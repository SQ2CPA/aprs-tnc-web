import { NextResponse } from "next/server";
import { Op } from "sequelize";
import { ensureDatabaseSchema } from "@/lib/db/ensure-schema";
import {
    Packet,
    PacketConsoleEvent,
    PacketConsoleTransmission,
} from "@/lib/db/models";
import { validateTNC2Frame } from "@/lib/kiss";
import {
    PACKET_CONSOLE_EVENT_ROOM_WHEN_BOOTSTRAPPING,
    PACKET_CONSOLE_HISTORY_LIMIT,
    PACKET_CONSOLE_INITIAL_RX_LIMIT,
    PACKET_CONSOLE_TRANSMISSION_WAIT_INTERVAL_MS,
    PACKET_CONSOLE_TRANSMISSION_WAIT_TIMEOUT_MS,
    type PacketConsoleLine,
} from "@/lib/packet-console";

export const dynamic = "force-dynamic";

function mapEventToLine(event: PacketConsoleEvent): PacketConsoleLine {
    return {
        id: `event-${event.id}`,
        timestamp: event.createdAt.toISOString(),
        direction: event.direction,
        raw: event.rawFrame,
    };
}

function mapPacketToLine(packet: Packet): PacketConsoleLine {
    return {
        id: `packet-${packet.id}`,
        timestamp: packet.receivedAt.toISOString(),
        direction: "RX",
        raw: packet.rawFrame,
    };
}

async function buildPacketConsoleLines() {
    const recentEvents = await PacketConsoleEvent.findAll({
        order: [["createdAt", "DESC"]],
        limit: PACKET_CONSOLE_HISTORY_LIMIT,
    });

    const hasEnoughRecentRx =
        recentEvents.filter((event) => event.direction === "RX").length >=
        PACKET_CONSOLE_INITIAL_RX_LIMIT;

    const keptEvents = hasEnoughRecentRx
        ? recentEvents
        : recentEvents.slice(0, PACKET_CONSOLE_EVENT_ROOM_WHEN_BOOTSTRAPPING);

    const rxCount = keptEvents.filter((event) => event.direction === "RX").length;
    const supplementalRxCount = Math.max(
        0,
        PACKET_CONSOLE_INITIAL_RX_LIMIT - rxCount
    );

    let supplementalPackets: Packet[] = [];

    if (supplementalRxCount > 0) {
        const excludedPacketIds = keptEvents
            .map((event) => event.packetId)
            .filter((packetId): packetId is number => packetId !== null);

        supplementalPackets = await Packet.findAll({
            where:
                excludedPacketIds.length > 0
                    ? {
                          id: {
                              [Op.notIn]: excludedPacketIds,
                          },
                      }
                    : undefined,
            order: [["receivedAt", "DESC"]],
            limit: supplementalRxCount,
            attributes: ["id", "rawFrame", "receivedAt"],
        });
    }

    return [...keptEvents.map(mapEventToLine), ...supplementalPackets.map(mapPacketToLine)]
        .sort(
            (left, right) =>
                new Date(left.timestamp).getTime() -
                new Date(right.timestamp).getTime()
        )
        .slice(-PACKET_CONSOLE_HISTORY_LIMIT);
}

async function waitForTransmissionResult(transmissionId: number) {
    const startedAt = Date.now();

    while (
        Date.now() - startedAt <
        PACKET_CONSOLE_TRANSMISSION_WAIT_TIMEOUT_MS
    ) {
        const transmission = await PacketConsoleTransmission.findByPk(
            transmissionId,
            {
                attributes: ["status", "errorMessage"],
            }
        );

        if (!transmission) {
            return {
                status: "failed",
                errorMessage: "Transmission disappeared before it was processed.",
            } as const;
        }

        if (transmission.status === "sent" || transmission.status === "failed") {
            return {
                status: transmission.status,
                errorMessage: transmission.errorMessage,
            } as const;
        }

        await new Promise((resolve) =>
            setTimeout(resolve, PACKET_CONSOLE_TRANSMISSION_WAIT_INTERVAL_MS)
        );
    }

    return {
        status: "pending",
        errorMessage: null,
    } as const;
}

export async function GET() {
    try {
        await ensureDatabaseSchema();

        const lines = await buildPacketConsoleLines();

        return NextResponse.json(
            { lines },
            {
                headers: {
                    "Cache-Control": "no-store",
                },
            }
        );
    } catch (error) {
        console.error("Error loading packet console:", error);

        return NextResponse.json(
            { error: "Failed to load packet console." },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        await ensureDatabaseSchema();

        const data = await request.json();
        const rawFrame =
            typeof data?.rawFrame === "string" ? data.rawFrame.trim() : "";

        if (!rawFrame) {
            return NextResponse.json(
                { error: "Frame is required." },
                { status: 400 }
            );
        }

        if (!validateTNC2Frame(rawFrame)) {
            return NextResponse.json(
                {
                    error: "Invalid frame format. Use a valid TNC2 frame.",
                },
                { status: 400 }
            );
        }

        const transmission = await PacketConsoleTransmission.create({
            rawFrame,
            status: "pending",
        });

        const result = await waitForTransmissionResult(transmission.id);

        if (result.status === "sent") {
            return NextResponse.json({
                success: true,
                status: "sent",
            });
        }

        if (result.status === "failed") {
            return NextResponse.json(
                {
                    error:
                        result.errorMessage ||
                        "Failed to send the frame to RF.",
                },
                { status: 503 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                status: "queued",
            },
            { status: 202 }
        );
    } catch (error) {
        console.error("Error queueing packet console frame:", error);

        return NextResponse.json(
            { error: "Failed to queue the frame for RF transmit." },
            { status: 500 }
        );
    }
}
