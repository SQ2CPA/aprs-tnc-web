import parseAPRSFrame from "@/lib/aprs";
import {
    APRSBeaconFrame,
    APRSFrame,
    APRSMessageFrame,
    APRSPacketType,
    APRSStatusFrame,
} from "@/lib/aprs/types";
import { Setting, Packet, sequelize, Message } from "@/lib/db/models";
import { MessageStatus } from "@/lib/db/models/Message";
import { PacketCreationAttributes } from "@/lib/db/models/Packet";
import Station, { StationAttributes } from "@/lib/db/models/Station";
import { decodeKISS, encodeKISS, KissChar } from "@/lib/kiss";
import { appendFile } from "fs/promises";
import * as net from "net";
import { Op } from "sequelize";

const APRS_DESTINATION_CALLSIGN = "APLRFW";
let aprsMessageMaxRetries: number = 10;
let aprsMessageRetryInterval: number = 15;
let aprsPath: string | null = "WIDE1-1";

let currentMyCallsign: string | null = null;
let currentMySSID: number | null = null;
let currentTncAddress: string | null = null;
let kissBuffer = Buffer.alloc(0);
let client: net.Socket;
let inactivityTimer: NodeJS.Timeout | null = null;
let reconnectTimeout: NodeJS.Timeout | null = null;
let isProcessingMessages = false;

async function processAndSavePacket(
    parsedAPRSPacket: APRSFrame,
    rawDecodedFrame: string
): Promise<void> {
    try {
        await appendFile(
            "./data/frames.txt",
            `${new Date().toUTCString()} : ${rawDecodedFrame}\r\n`,
            "utf-8"
        );
    } catch {}

    const transaction = await sequelize.transaction();

    try {
        const [station] = await Station.findOrCreate({
            where: { callsign: parsedAPRSPacket.sender },
            defaults: { callsign: parsedAPRSPacket.sender },
            transaction,
        });

        const stationUpdateData: Partial<StationAttributes> = {
            lastPacketAt: new Date(),
        };

        if (parsedAPRSPacket.type === "beacon") {
            const beacon = parsedAPRSPacket as APRSBeaconFrame;
            stationUpdateData.comment = beacon.comment;
            if (beacon.location) {
                stationUpdateData.lastPositionLatitude =
                    beacon.location.latitude;
                stationUpdateData.lastPositionLongitude =
                    beacon.location.longitude;
            }
            stationUpdateData.lastSymbol = beacon.overlay + beacon.symbol;
        } else if (parsedAPRSPacket.type === "status") {
            stationUpdateData.lastStatusAt = new Date();
        } else if (parsedAPRSPacket.type === "message") {
            const ackIdRegex = /ack([0-9]+)$/;
            const match = parsedAPRSPacket.content.match(ackIdRegex);
            let isAck = !!match && !!match[1] && !isNaN(Number(match[1]));

            if (isAck) {
                if (parsedAPRSPacket.recipient === currentMyCallsign) {
                    const ackId = match![1];
                    console.log(
                        `Received ACK (${ackId}) from ${parsedAPRSPacket.sender}`
                    );

                    await Message.update(
                        {
                            status: MessageStatus.DELIVERED,
                        },
                        {
                            where: {
                                messageId: ackId,

                                sender: parsedAPRSPacket.sender,
                                type: "sent",
                            },
                            transaction,
                        }
                    );
                }
            } else if (
                parsedAPRSPacket.content.toLowerCase() !== "ping" &&
                parsedAPRSPacket.sender !== currentMyCallsign &&
                parsedAPRSPacket.recipient === currentMyCallsign
            ) {
                const messageId = parsedAPRSPacket.ack;

                if (messageId) {
                    const fifteenSecondsAgo = new Date(Date.now() - 15 * 1000);

                    const existingMessage = await Message.findOne({
                        where: {
                            messageId: messageId,
                            sender: parsedAPRSPacket.sender,
                            receivedAt: {
                                [Op.gte]: fifteenSecondsAgo,
                            },
                        },
                    });

                    if (existingMessage) {
                        console.log(
                            `Skipping duplicate message with ID ${messageId} from ${parsedAPRSPacket.sender}.`
                        );
                    } else {
                        await Message.create(
                            {
                                sender: parsedAPRSPacket.sender,
                                type: "received",
                                content: parsedAPRSPacket.content,
                                receivedAt: new Date(),
                                status: MessageStatus.RECEIVED,
                                isUnread: true,
                                messageId: messageId,
                                isFromIS: parsedAPRSPacket.isFromIS || false,
                            },
                            { transaction }
                        );
                    }
                } else {
                    await Message.create(
                        {
                            sender: parsedAPRSPacket.sender,
                            type: "received",
                            content: parsedAPRSPacket.content,
                            receivedAt: new Date(),
                            status: MessageStatus.RECEIVED,
                            isUnread: true,
                            messageId: undefined,
                            isFromIS: parsedAPRSPacket.isFromIS || false,
                        },
                        { transaction }
                    );
                }
            }
        }

        await station.update(stationUpdateData, { transaction });

        const infoField = rawDecodedFrame.substring(
            rawDecodedFrame.indexOf(":") + 1
        );
        const packetTypeChar = infoField.charAt(0) as APRSPacketType;

        const packetData: PacketCreationAttributes = {
            callsign: parsedAPRSPacket.sender,
            rawFrame: rawDecodedFrame,
            path: parsedAPRSPacket.paths?.join(","),
            destination: parsedAPRSPacket.destination,
            receivedAt: new Date(),
            packetType: packetTypeChar,
            parsedData: parsedAPRSPacket,
            parsedType: parsedAPRSPacket.type,
        };

        if (parsedAPRSPacket.type === "beacon") {
            const beacon = parsedAPRSPacket as APRSBeaconFrame;
            if (beacon.location) {
                packetData.latitude = beacon.location.latitude;
                packetData.longitude = beacon.location.longitude;
            }
            packetData.symbol = beacon.overlay + beacon.symbol;
            packetData.comment = beacon.comment;
        } else if (parsedAPRSPacket.type === "status") {
            const status = parsedAPRSPacket as APRSStatusFrame;
            packetData.statusText = status.content;
        } else if (parsedAPRSPacket.type === "message") {
            const message = parsedAPRSPacket as APRSMessageFrame;
        }

        await Packet.create(packetData, { transaction });

        await transaction.commit();
        console.log(`✅ Saved and updated frame from ${station.callsign}.`);
    } catch (error) {
        await transaction.rollback();
        console.error("❌ Database error:", error);
    }
}

(async function () {
    await sequelize.sync();

    const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000;
    const RECONNECT_DELAY_MS = 5000;
    const CONFIG_CHECK_INTERVAL_MS = 15000;
    const MESSAGE_PROCESSING_INTERVAL_MS = 5000;

    function resetInactivityTimer() {
        if (inactivityTimer) {
            clearTimeout(inactivityTimer);
        }
        inactivityTimer = setTimeout(() => {
            console.log(
                `No data received for ${
                    INACTIVITY_TIMEOUT_MS / 60000
                } minutes. Restarting connection.`
            );
            if (client && !client.destroyed) {
                client.destroy();
            }
        }, INACTIVITY_TIMEOUT_MS);
    }

    function clearInactivityTimer() {
        if (inactivityTimer) {
            clearTimeout(inactivityTimer);
            inactivityTimer = null;
        }
    }

    function sendFrame(ax25FrameAsString: string): Promise<boolean> {
        return new Promise((resolve) => {
            if (!client || client.destroyed || !client.writable) {
                console.warn(
                    "Client not connected or not writable. Cannot send frame."
                );
                return resolve(false);
            }
            console.log(`Sending frame: ${ax25FrameAsString}`);
            const kissFrame = encodeKISS(ax25FrameAsString);
            if (kissFrame) {
                client.write(kissFrame, (err) => {
                    if (err) {
                        console.error(
                            "Error while sending frame:",
                            err.message
                        );
                        resolve(false);
                    } else {
                        console.log("Frame sent.");
                        resolve(true);
                    }
                });
            } else {
                console.error("Failed to encode KISS frame.");
                resolve(false);
            }
        });
    }

    async function processMessages() {
        if (isProcessingMessages) {
            console.log("Skipping processMessages run, already processing.");
            return;
        }

        if (!currentMyCallsign) {
            console.log("Cannot process messages, myCallsign is not set.");
            return;
        }

        isProcessingMessages = true;

        try {
            const receivedMessages = await Message.findAll({
                where: {
                    type: "received",
                    status: MessageStatus.RECEIVED,
                    messageId: { [Op.ne]: null },
                },
            });

            for (const message of receivedMessages) {
                console.log(
                    `Preparing ACK (${message.messageId}) for message from ${message.sender}`
                );
                const callsignWithSSID = currentMySSID
                    ? `${currentMyCallsign}-${currentMySSID}`
                    : currentMyCallsign;
                const path = aprsPath ? `,${aprsPath}` : "";
                const ackPacket = `${callsignWithSSID}>${APRS_DESTINATION_CALLSIGN}${path}::${message.sender.padEnd(
                    9,
                    " "
                )}:ack${message.messageId}`;

                const success = await sendFrame(ackPacket);
                if (success) {
                    await message.update({
                        status: MessageStatus.RECEIVED_ACK,
                    });
                    console.log(
                        `Successfully sent ACK for message ${message.messageId}`
                    );
                } else {
                    console.warn(
                        `Failed to send ACK for message ${message.messageId}. Will retry.`
                    );
                }
                await new Promise((resolve) => setTimeout(resolve, 250));
            }

            const pendingMessages = await Message.findAll({
                where: {
                    type: "sent",
                    status: MessageStatus.SENDING,
                },
            });

            for (const message of pendingMessages) {
                if (
                    message.retries &&
                    message.retries >= aprsMessageMaxRetries
                ) {
                    console.log(
                        `Message to ${message.sender} (ID: ${message.messageId}) reached max retries. Aborting.`
                    );
                    await message.update({ status: MessageStatus.ABORTED });
                    continue;
                }

                const timeSinceLastSend = message.lastSendAt
                    ? Date.now() - message.lastSendAt.getTime()
                    : Infinity;
                const shouldSend =
                    !message.lastSendAt ||
                    timeSinceLastSend >= aprsMessageRetryInterval * 1000;

                if (shouldSend) {
                    console.log(
                        `Sending message to ${message.sender}, ID: ${
                            message.messageId
                        } (Retry ${
                            (message.retries || 0) + 1
                        }/${aprsMessageMaxRetries})`
                    );
                    const callsignWithSSID = currentMySSID
                        ? `${currentMyCallsign}-${currentMySSID}`
                        : currentMyCallsign;
                    const path = aprsPath ? `,${aprsPath}` : "";
                    const msgPacket = `${callsignWithSSID}>${APRS_DESTINATION_CALLSIGN}${path}::${message.sender.padEnd(
                        9,
                        " "
                    )}:${message.content}{${message.messageId}`;

                    const success = await sendFrame(msgPacket);
                    if (success) {
                        await message.update({
                            retries: (message.retries || 0) + 1,
                            lastSendAt: new Date(),
                        });
                    } else {
                        console.warn(
                            `Failed to send message ${message.messageId} to ${message.sender}. Will retry if possible.`
                        );
                    }
                    await new Promise((resolve) => setTimeout(resolve, 500));
                }
            }
        } catch (error) {
            console.error("Error during processMessages:", error);
        } finally {
            isProcessingMessages = false;
        }
    }

    function connectToTNC() {
        if (!currentTncAddress) {
            console.log("Connection deferred: TNC address is not set.");
            return;
        }

        if (reconnectTimeout) {
            clearTimeout(reconnectTimeout);
            reconnectTimeout = null;
        }

        const addressParts = currentTncAddress.split(":");
        const host = addressParts[0];
        const port = parseInt(addressParts[1], 10);

        console.log(
            `Attempting to connect to TNC KISS: ${currentTncAddress}...`
        );

        if (client) {
            client.removeAllListeners();
            if (!client.destroyed) {
                client.destroy();
            }
        }

        client = new net.Socket();

        client.connect(port, host, () => {
            console.log(`✅ Connected with TNC KISS: ${currentTncAddress}`);
            kissBuffer = Buffer.alloc(0);
            resetInactivityTimer();
        });

        client.on("data", async (chunk) => {
            resetInactivityTimer();
            kissBuffer = Buffer.concat([kissBuffer, chunk]);

            let fendStart = -1;
            while ((fendStart = kissBuffer.indexOf(KissChar.FEND)) !== -1) {
                const fendEnd = kissBuffer.indexOf(
                    KissChar.FEND,
                    fendStart + 1
                );
                if (fendEnd === -1) {
                    break;
                }
                const potentialFrame = kissBuffer.slice(fendStart, fendEnd + 1);
                const decodedData = decodeKISS(potentialFrame);
                if (decodedData) {
                    console.log(`✅ Received frame: ${decodedData}`);
                    const parsedAPRSPacket = parseAPRSFrame(decodedData);
                    if (parsedAPRSPacket) {
                        console.log(parsedAPRSPacket);
                        await processAndSavePacket(
                            parsedAPRSPacket,
                            decodedData
                        );
                    } else {
                        console.warn("❌ Error while parsing data");
                    }
                } else {
                    console.warn("❌ Error while decoding data");
                }
                kissBuffer = kissBuffer.slice(fendEnd + 1);
            }
        });

        client.on("close", () => {
            console.log("🔌 Connection closed.");
            clearInactivityTimer();

            if (client && typeof client.removeAllListeners === "function") {
                client.removeAllListeners();
            }

            if (reconnectTimeout) clearTimeout(reconnectTimeout);
            reconnectTimeout = setTimeout(() => {
                connectToTNC();
            }, RECONNECT_DELAY_MS);
        });

        client.on("error", (err) => {
            console.error("Connection error:", err.message);
            clearInactivityTimer();
            if (client && !client.destroyed) {
                client.destroy();
            }
        });
    }

    async function checkAndApplySettings() {
        try {
            const settings = await Setting.findAll();
            const settingsMap = new Map(settings.map((s) => [s.key, s.value]));

            currentMyCallsign = settingsMap.get("myCallsign") || null;
            const ssidValue = settingsMap.get("ssid");
            const ssid = ssidValue ? parseInt(ssidValue, 10) : null;

            if (ssid && ssid > 0) currentMyCallsign += "-" + ssid;

            const pathSetting = settingsMap.get("messagePath");
            aprsPath = pathSetting || "WIDE1-1";

            const retriesSetting = settingsMap.get("maxRetries");
            aprsMessageMaxRetries = retriesSetting
                ? parseInt(retriesSetting, 10)
                : 3;

            // console.log(`Loaded new callsign: ${currentMyCallsign}, path: ${aprsPath}`);

            const intervalSetting = settingsMap.get("retryInterval");
            aprsMessageRetryInterval = intervalSetting
                ? parseInt(intervalSetting, 10)
                : 30;

            const newTncAddress = settingsMap.get("tncAddress") || null;
            let isValid = false;
            if (newTncAddress) {
                const match = newTncAddress.match(
                    /^((?:[0-9]{1,3}\.){3}[0-9]{1,3}):([0-9]{1,5})$/
                );
                if (match) {
                    const port = parseInt(match[2], 10);
                    if (port > 0 && port <= 65535) {
                        isValid = true;
                    }
                }
            }

            if (isValid) {
                if (newTncAddress !== currentTncAddress) {
                    console.log(
                        `New TNC address detected: ${newTncAddress}. Reconnecting.`
                    );
                    currentTncAddress = newTncAddress;
                    connectToTNC();
                }
            } else {
                if (currentTncAddress !== null) {
                    console.log(
                        "TNC address removed or invalid. Disconnecting."
                    );
                    currentTncAddress = null;
                    if (client && !client.destroyed) {
                        client.destroy();
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching settings from database:", error);
        }
    }

    await checkAndApplySettings();

    setInterval(checkAndApplySettings, CONFIG_CHECK_INTERVAL_MS);

    setInterval(processMessages, MESSAGE_PROCESSING_INTERVAL_MS);
})();
