import { Packet } from "@/lib/db/models";
import { NextResponse } from "next/server";

export async function GET() {
    const lastPacket = await Packet.findOne({
        order: [["receivedAt", "DESC"]],
        limit: 1,
    });

    const status = {
        connected: true,
        working: true,
        lastTx: null,
        lastRx: lastPacket?.receivedAt,
    };

    return NextResponse.json(status);
}
