import { ensureDatabaseSchema } from "@/lib/db/ensure-schema";
import { Packet, PacketConsoleEvent } from "@/lib/db/models";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        await ensureDatabaseSchema();

        const [lastPacket, lastTxEvent] = await Promise.all([
            Packet.findOne({
                order: [["receivedAt", "DESC"]],
                limit: 1,
            }),
            PacketConsoleEvent.findOne({
                where: {
                    direction: "TX",
                },
                order: [["createdAt", "DESC"]],
                limit: 1,
            }),
        ]);

        const status = {
            connected: true,
            working: true,
            lastTx: lastTxEvent?.createdAt || null,
            lastRx: lastPacket?.receivedAt || null,
        };

        return NextResponse.json(status);
    } catch (error) {
        console.error("Error fetching TNC status:", error);

        return NextResponse.json(
            {
                connected: false,
                working: false,
                lastTx: null,
                lastRx: null,
            },
            { status: 500 }
        );
    }
}
