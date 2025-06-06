import { Station, Packet } from "@/lib/db/models";
import { NextResponse, NextRequest } from "next/server";
import { Op, WhereOptions } from "sequelize";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const hours = searchParams.get("hours");

    const stationWhereClause: WhereOptions<Station> = {
        lastPositionLatitude: { [Op.not]: null },
    };

    if (hours && !isNaN(parseInt(hours, 10))) {
        const date = new Date();
        date.setHours(date.getHours() - parseInt(hours, 10));

        stationWhereClause.lastPacketAt = {
            [Op.gte]: date,
        };
    }

    const stations = await Station.findAll({
        where: stationWhereClause,
        order: [["lastPacketAt", "DESC"]],
        include: [
            {
                model: Packet,
                as: "packets",
                order: [["receivedAt", "DESC"]],
                limit: 1,
                attributes: ["path"],
            },
        ],
    });

    const mappedStations = stations.map((station) => {
        const lastPacketPath =
            station.packets && station.packets.length > 0
                ? station.packets[0].path
                : null;

        return {
            callsign: station.callsign,
            lat: station.lastPositionLatitude,
            lng: station.lastPositionLongitude,
            comment: station.comment,
            symbol: station.lastSymbol,
            lastStatus: station.lastStatusAt,
            lastPacketAt: station.lastPacketAt,
            lastPosition: "",
            path: lastPacketPath,
        };
    });

    return NextResponse.json(mappedStations);
}
