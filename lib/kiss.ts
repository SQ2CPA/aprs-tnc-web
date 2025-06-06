import { Buffer } from "buffer";

export enum KissChar {
    FEND = 0xc0,
    FESC = 0xdb,
    TFEND = 0xdc,
    TFESC = 0xdd,
}

export enum KissCmd {
    Data = 0x00,
}

export enum AX25Char {
    ControlField = 0x03,
    InformationField = 0xf0,
}

const IS_LAST_ADDRESS_POSITION_MASK = 0x01;
const HAS_BEEN_DIGIPITED_MASK = 0x80;

export function validateKISSFrame(kissBuffer: Buffer): boolean {
    return (
        kissBuffer.length >= 3 &&
        kissBuffer[0] === KissChar.FEND &&
        kissBuffer[kissBuffer.length - 1] === KissChar.FEND
    );
}

export function decodeAddressAX25(
    ax25Address: Buffer,
    isRelay: boolean
): { address: string; isLast: boolean } {
    if (ax25Address.length !== 7) {
        return { address: "INVALID", isLast: true };
    }

    let address = "";
    for (let i = 0; i < 6; ++i) {
        let currentCharacter = ax25Address[i];
        currentCharacter >>= 1;
        if (currentCharacter !== 0x20) {
            address += String.fromCharCode(currentCharacter);
        }
    }

    const ssidByte = ax25Address[6];
    const hasBeenDigipeated = (ssidByte & HAS_BEEN_DIGIPITED_MASK) !== 0;
    const isLastAddress = (ssidByte & IS_LAST_ADDRESS_POSITION_MASK) !== 0;
    const ssid = (ssidByte >> 1) & 0x0f;

    if (ssid > 0) {
        address += `-${ssid}`;
    }

    if (isRelay && hasBeenDigipeated) {
        address += "*";
    }

    return { address, isLast: isLastAddress };
}

export function decapsulateKISS(kissPayload: Buffer): Buffer {
    const ax25Frame = Buffer.alloc(kissPayload.length);
    let ax25Len = 0;

    for (let i = 0; i < kissPayload.length; ++i) {
        const currentChar = kissPayload[i];
        if (currentChar === KissChar.FESC) {
            i++;
            if (i < kissPayload.length) {
                const nextChar = kissPayload[i];
                if (nextChar === KissChar.TFEND) {
                    ax25Frame[ax25Len++] = KissChar.FEND;
                } else if (nextChar === KissChar.TFESC) {
                    ax25Frame[ax25Len++] = KissChar.FESC;
                } else {
                    console.warn(
                        `KISS Decapsulate: Unexpected byte after FESC: 0x${nextChar.toString(
                            16
                        )}`
                    );
                }
            } else {
                console.warn("KISS Decapsulate: FESC at end of payload");
            }
        } else {
            ax25Frame[ax25Len++] = currentChar;
        }
    }
    return ax25Frame.slice(0, ax25Len);
}

export function decodeKISS(kissFrame: Buffer): string | null {
    if (!validateKISSFrame(kissFrame)) {
        console.log("Invalid KISS Frame structure (FEND markers)");
        return null;
    }

    const command = kissFrame[1] & 0x0f;
    if (command !== KissCmd.Data) {
        console.log(
            `Not a KISS Data frame (Command: 0x${command.toString(16)})`
        );
        return null;
    }

    const kissPayload = kissFrame.slice(2, kissFrame.length - 1);
    const ax25Frame = decapsulateKISS(kissPayload);

    if (ax25Frame.length < 14) {
        console.log(
            "AX.25 frame too short after decapsulation:",
            ax25Frame.length
        );
        return null;
    }

    try {
        let isLastAddress = false;
        const dstResult = decodeAddressAX25(ax25Frame.slice(0, 7), false);
        const srcResult = decodeAddressAX25(ax25Frame.slice(7, 14), false);
        isLastAddress = srcResult.isLast;

        let frame = `${srcResult.address}>${dstResult.address}`;

        let digiInfoIndex = 14;
        let digiCount = 0;
        const maxDigis = 8;

        while (
            !isLastAddress &&
            digiInfoIndex + 7 <= ax25Frame.length &&
            digiCount < maxDigis
        ) {
            const digiResult = decodeAddressAX25(
                ax25Frame.slice(digiInfoIndex, digiInfoIndex + 7),
                true
            );
            frame += `,${digiResult.address}`;
            isLastAddress = digiResult.isLast;
            digiInfoIndex += 7;
            digiCount++;
        }

        if (digiCount === maxDigis && !isLastAddress) {
            console.warn("Exceeded max digipeater count during parsing.");
        }

        if (ax25Frame.length > digiInfoIndex + 1) {
            const payload = ax25Frame.slice(digiInfoIndex + 2);
            const payloadString = payload.toString("utf-8");

            frame += `:${payloadString}`;
        } else if (ax25Frame.length > digiInfoIndex) {
            console.warn(
                "AX.25 frame ends after Control field, no PID or Payload."
            );
            frame += ":";
        } else {
            console.warn(
                "AX.25 frame ends after addresses, no Control/PID/Payload."
            );
            frame += ":";
        }

        return frame;
    } catch (e) {
        console.error("Error decoding AX.25 addresses/payload:", e);
        return null;
    }
}

export function encodeAddressAX25(addressInput: string): Buffer {
    let address = addressInput;
    const hasBeenDigipeated = address.includes("*");
    if (hasBeenDigipeated) {
        address = address.replace("*", "");
    }

    let ssid = 0;
    const separatorIndex = address.indexOf("-");
    let callsignPart = address;

    if (separatorIndex !== -1) {
        callsignPart = address.substring(0, separatorIndex);
        const ssidPart = address.substring(separatorIndex + 1);
        ssid = parseInt(ssidPart, 10);
        if (isNaN(ssid) || ssid < 0 || ssid > 15) {
            ssid = 0;
        }
    }

    const kissAddress = Buffer.alloc(7);
    for (let i = 0; i < 6; ++i) {
        let addressChar = " ";
        if (i < callsignPart.length) {
            addressChar = callsignPart.charAt(i).toUpperCase();
        }
        kissAddress[i] = addressChar.charCodeAt(0) << 1;
    }

    let ssidByte = (ssid << 1) | 0x60;
    if (hasBeenDigipeated) {
        ssidByte |= HAS_BEEN_DIGIPITED_MASK;
    }
    kissAddress[6] = ssidByte;

    return kissAddress;
}

export function encapsulateKISS(
    ax25Frame: Buffer,
    command: KissCmd = KissCmd.Data,
    port: number = 0
): Buffer {
    const maxKissLen = 2 * ax25Frame.length + 3;
    const kissFrame = Buffer.alloc(maxKissLen);
    let kissLen = 0;

    kissFrame[kissLen++] = KissChar.FEND;
    kissFrame[kissLen++] = (port << 4) | command;

    for (let i = 0; i < ax25Frame.length; ++i) {
        const currentChar = ax25Frame[i];
        if (currentChar === KissChar.FEND) {
            kissFrame[kissLen++] = KissChar.FESC;
            kissFrame[kissLen++] = KissChar.TFEND;
        } else if (currentChar === KissChar.FESC) {
            kissFrame[kissLen++] = KissChar.FESC;
            kissFrame[kissLen++] = KissChar.TFESC;
        } else {
            kissFrame[kissLen++] = currentChar;
        }
    }
    kissFrame[kissLen++] = KissChar.FEND;

    return kissFrame.slice(0, kissLen);
}

export function validateTNC2Frame(frame: string): boolean {
    return frame.includes(">") && frame.includes(":");
}

export function encodeKISS(tnc2Frame: string): Buffer | null {
    if (!validateTNC2Frame(tnc2Frame)) {
        console.error("Invalid TNC2 frame format for encoding:", tnc2Frame);
        return null;
    }

    const colonIndex = tnc2Frame.indexOf(":");
    const pathPart = tnc2Frame.substring(0, colonIndex);
    const payloadPart = tnc2Frame.substring(colonIndex + 1);

    const addresses = pathPart.split(/[>,]/);

    if (addresses.length < 2) {
        console.error("Invalid path in TNC2 frame (need SRC>DST):", pathPart);
        return null;
    }

    const srcAddress = addresses[0];
    const dstAddress = addresses[1];
    const digiAddresses = addresses.slice(2);

    let ax25Addresses: Buffer[] = [];

    ax25Addresses.push(encodeAddressAX25(dstAddress));
    ax25Addresses.push(encodeAddressAX25(srcAddress));
    digiAddresses.forEach((digi) => {
        ax25Addresses.push(encodeAddressAX25(digi));
    });

    if (ax25Addresses.length > 0) {
        const lastAddressBuffer = ax25Addresses[ax25Addresses.length - 1];
        if (lastAddressBuffer.length === 7) {
            lastAddressBuffer[6] |= IS_LAST_ADDRESS_POSITION_MASK;
        }
    }

    const addressBlock = Buffer.concat(ax25Addresses);

    const controlField = Buffer.from([AX25Char.ControlField]);
    const pidField = Buffer.from([AX25Char.InformationField]);
    const payloadBuffer = Buffer.from(payloadPart, "utf-8");

    const ax25Frame = Buffer.concat([
        addressBlock,
        controlField,
        pidField,
        payloadBuffer,
    ]);

    return encapsulateKISS(ax25Frame, KissCmd.Data);
}
