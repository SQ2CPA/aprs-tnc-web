import { APRSBeaconFrame } from "@/lib/aprs/types";
import { Station, Packet } from "@/lib/db/models";
import { NextResponse, NextRequest } from "next/server";
import { Op, WhereOptions } from "sequelize";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const hours = searchParams.get("hours");

    const stationWhereClause: WhereOptions<Station> = {
        lastPositionLatitude: { [Op.not]: null },
    };

    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(
        twentyFourHoursAgo.getHours() - parseInt(hours || "24", 10)
    );

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

    const mappedStations = await Promise.all(
        stations.map(async (station) => {
            const lastPacketPath =
                station.packets && station.packets.length > 0
                    ? station.packets[0].path
                    : null;

            const pathPackets = await Packet.findAll({
                where: {
                    callsign: station.callsign,
                    parsedType: "beacon",
                    receivedAt: { [Op.gte]: twentyFourHoursAgo },
                    "parsedData.location.latitude": {
                        [Op.and]: [{ [Op.ne]: null }, { [Op.ne]: 0 }],
                    },
                },
                order: [["receivedAt", "ASC"]],
                attributes: ["parsedData"],
            });

            const pathCoordinates = pathPackets.map((p) => [
                (p.parsedData as APRSBeaconFrame).location.latitude,
                (p.parsedData as APRSBeaconFrame).location.longitude,
            ]);

            const firstLocation = pathPackets[0]?.parsedData as
                | APRSBeaconFrame
                | undefined;

            const areAllLocationsSame =
                pathPackets.length > 1 &&
                firstLocation &&
                pathPackets.every(
                    (p) =>
                        (p.parsedData as APRSBeaconFrame).location.latitude ===
                            firstLocation.location.latitude &&
                        (p.parsedData as APRSBeaconFrame).location.longitude ===
                            firstLocation.location.longitude
                );

            return {
                callsign: station.callsign,
                lat:
                    (
                        pathPackets?.slice(0)?.pop()
                            ?.parsedData as APRSBeaconFrame
                    )?.location.latitude || station.lastPositionLatitude,
                lng:
                    (
                        pathPackets?.slice(0)?.pop()
                            ?.parsedData as APRSBeaconFrame
                    )?.location.longitude || station.lastPositionLongitude,
                comment: station.comment,
                symbol: station.lastSymbol,
                lastStatus: station.lastStatusAt,
                lastPacketAt: station.lastPacketAt,
                lastPosition: "",
                path: lastPacketPath,
                pathCoordinates: areAllLocationsSame ? [] : pathCoordinates,
            };
        })
    );

    return NextResponse.json(mappedStations);
}
