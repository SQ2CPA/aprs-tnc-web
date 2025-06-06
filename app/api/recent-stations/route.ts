import { Station } from "@/lib/db/models";
import { NextResponse } from "next/server";

export async function GET() {
    const stations = await Station.findAll({
        order: [["lastPacketAt", "DESC"]],
        limit: 10,
    });

    const recentStations = stations.map((station) => ({
        callsign: station.callsign,
        lastPacketAt: station.lastPacketAt,
        lastSymbol: station.lastSymbol,
    }));

    return NextResponse.json(recentStations);
}
