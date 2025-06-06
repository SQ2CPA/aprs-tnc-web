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
                order: [["receivedAt", "DESC"]],
                attributes: ["id", "rawFrame", "receivedAt"],
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
