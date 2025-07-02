import { APRSBeaconFrame } from "@/lib/aprs/types";
import { Packet, Station } from "@/lib/db/models";
import { NextResponse } from "next/server";
import { Op } from "sequelize";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ callsign: string }> }
) {
    const { callsign } = await params;

    const stationWithLastPacket = await Station.findOne({
        where: { callsign },
        include: [
            {
                model: Packet,
                as: "packets",
                order: [["receivedAt", "DESC"]],
                where: {
                    parsedType: "beacon",
                    "parsedData.location.latitude": {
                        [Op.and]: [{ [Op.ne]: null }, { [Op.ne]: 0 }],
                    },
                },
                limit: 1,
                required: false,
            },
        ],
    });

    if (!stationWithLastPacket) {
        return NextResponse.json({}, { status: 404 });
    }

    const lastPacket = stationWithLastPacket.packets?.[0] ?? null;

    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const pathPackets = await Packet.findAll({
        where: {
            callsign: stationWithLastPacket.callsign,
            parsedType: "beacon",
            receivedAt: { [Op.gte]: twentyFourHoursAgo },
            "parsedData.location.latitude": {
                [Op.and]: [{ [Op.ne]: null }, { [Op.ne]: 0 }],
            },
        },
        order: [["receivedAt", "ASC"]],
        attributes: ["parsedData", "receivedAt", "path"],
    });

    const pathCoordinates = pathPackets.map((p) => [
        (p.parsedData as APRSBeaconFrame).location.latitude,
        (p.parsedData as APRSBeaconFrame).location.longitude,
    ]);

    const pathPacketsInfo = pathPackets.map((p) => ({
        lat: (p.parsedData as APRSBeaconFrame).location.latitude,
        lng: (p.parsedData as APRSBeaconFrame).location.longitude,
        time: p.receivedAt,
        path: p.path,
    }));

    const callsignOnly = callsign.split("-")[0];
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
        callsign: stationWithLastPacket.callsign,
        symbol: stationWithLastPacket.lastSymbol,
        comment: stationWithLastPacket.comment,
        lastPacketAt: stationWithLastPacket.lastPacketAt,
        path: lastPacket ? lastPacket.path : null,
        parsedData: lastPacket ? lastPacket.parsedData : null,
        pathCoordinates,
        pathPacketsInfo,
        pathPacketsCount: pathPackets.length,
        ssids: others
            .filter((s) => s.callsign !== callsign)
            .map((s) => ({
                callsign: s.callsign,
                symbol: s.lastSymbol,
            })),
    };

    return NextResponse.json(stationDetails);
}
