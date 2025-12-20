import { Packet, Station } from "@/lib/db/models";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ callsign: string }> }
) {
    const { callsign } = await params;

    const station = await Station.findOne({
        where: {
            callsign,
        },
        include: [
            {
                model: Packet,
                as: "packets",
                attributes: ["id", "rawFrame", "receivedAt"],
                limit: 1000,
                separate: true,
                order: [["receivedAt", "DESC"]],
            },
        ],
    });

    if (!station) return NextResponse.json({}, { status: 404 });

    const frames = station.packets?.map((packet) => ({
        id: packet.id,
        timestamp: packet.receivedAt,
        raw: packet.rawFrame,
    }));

    return NextResponse.json(frames);
}
