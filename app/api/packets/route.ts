import { Packet, Station } from "@/lib/db/models";
import { NextResponse } from "next/server";

export async function GET() {
    const packets = await Packet.findAll({
        include: [
            {
                model: Station,
                as: "station",
                attributes: ["callsign"],
            },
        ],
        order: [["receivedAt", "DESC"]],
        attributes: ["id", "rawFrame", "receivedAt"],
        limit: 1000, // Limit to last 1000 packets
    });

    const frames = packets.map((packet) => ({
        id: packet.id,
        timestamp: packet.receivedAt,
        raw: packet.rawFrame,
        callsign: packet.station?.callsign || "Unknown",
    }));

    return NextResponse.json(frames);
}
