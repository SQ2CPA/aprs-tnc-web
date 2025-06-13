import { NextResponse, NextRequest } from "next/server";
import { Op, WhereOptions } from "sequelize";
import { Station, Packet, Setting } from "@/lib/db/models";

const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
            Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const period = searchParams.get("period");

        const settings = await Setting.findAll({
            where: { key: ["latitude", "longitude"] },
        });

        const myLatitude = parseFloat(
            settings.find((s) => s.key === "latitude")?.value || "0"
        );
        const myLongitude = parseFloat(
            settings.find((s) => s.key === "longitude")?.value || "0"
        );

        if (!myLatitude || !myLongitude) {
            return NextResponse.json(
                { error: "Your station location is not set." },
                { status: 400 }
            );
        }

        const stationWhereClause: WhereOptions<Station> = {
            lastPositionLatitude: { [Op.not]: null },
            lastPositionLongitude: { [Op.not]: null },
        };

        if (period === "24h") {
            const twentyFourHoursAgo = new Date();
            twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
            stationWhereClause.lastPacketAt = {
                [Op.gte]: twentyFourHoursAgo,
            };
        }

        const stations = await Station.findAll({
            where: stationWhereClause,
            include: [
                {
                    model: Packet,
                    as: "packets",
                    order: [["receivedAt", "DESC"]],
                    where: {
                        parsedType: "beacon",
                    },
                    limit: 1,
                    attributes: ["path", "parsedType"],
                },
            ],
        });

        const dxStations = stations
            .map((station) => {
                const distance = calculateDistance(
                    myLatitude,
                    myLongitude,
                    station.lastPositionLatitude!,
                    station.lastPositionLongitude!
                );

                return {
                    callsign: station.callsign,
                    symbol: station.lastSymbol,
                    comment: station.comment,
                    lastPacketAt: station.lastPacketAt,
                    via:
                        station.packets && station.packets.length > 0
                            ? station.packets[0].path
                            : null,
                    distance: parseFloat(distance.toFixed(2)),
                };
            })
            .filter((station) => station.distance < 1000)
            .sort((a, b) => b.distance - a.distance);

        return NextResponse.json(dxStations);
    } catch (error) {
        console.error("Error fetching DX stations:", error);
        return NextResponse.json(
            { error: "Failed to fetch DX stations." },
            { status: 500 }
        );
    }
}
