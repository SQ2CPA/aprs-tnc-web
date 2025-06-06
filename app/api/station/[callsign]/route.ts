import { Packet, Station } from "@/lib/db/models";
import { NextResponse } from "next/server";
import { Op } from "sequelize";

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
                where: {
                    parsedType: "beacon",
                },
                limit: 1,
                attributes: ["path", "parsedData"],
            },
        ],
    });

    if (!station) return NextResponse.json({}, { status: 404 });

    const callsignOnly = callsign.split("-")[0];

    const lastPacketPath =
        station.packets && station.packets.length > 0
            ? station.packets[0].path
            : null;

    const others = await Station.findAll({
        where: {
            [Op.or]: [
                { callsign: callsign },
                { callsign: { [Op.startsWith]: `${callsignOnly}-` } },
            ],
        },
        raw: true,
    });

    const stationDetails = {
        callsign,
        symbol: station.lastSymbol,
        comment: station.comment,
        lastPacketAt: station.lastPacketAt,
        path: lastPacketPath,
        ssids: others
            .filter((station) => station.callsign !== callsign)
            .map((station) => ({
                callsign: station.callsign,
                symbol: station.lastSymbol,
            })),
        parsedData:
            station.packets && station.packets.length > 0
                ? station.packets[0].parsedData
                : null,
    };

    return NextResponse.json(stationDetails);
}
