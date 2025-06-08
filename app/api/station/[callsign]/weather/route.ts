import { Packet } from "@/lib/db/models";
import { NextResponse } from "next/server";
import { Op } from "sequelize";
import { APRSBeaconFrame } from "@/lib/aprs/types";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ callsign: string }> }
) {
    const { callsign } = await params;

    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const weatherPackets = await Packet.findAll({
        where: {
            callsign: callsign,
            parsedType: "beacon",
            "parsedData.isWX": true,
            receivedAt: { [Op.gte]: twentyFourHoursAgo },
        },
        order: [["receivedAt", "ASC"]],
        attributes: ["parsedData", "receivedAt"],
    });

    if (!weatherPackets || weatherPackets.length === 0) {
        return NextResponse.json([]);
    }

    const chartData = weatherPackets.map((p) => {
        const parsedData = p.parsedData as APRSBeaconFrame;
        const wxData = parsedData.wxData;

        return {
            time: p.receivedAt,
            temperature: wxData?.temperature,
            pressure: wxData?.pressure,
            humidity: wxData?.humidity,
            windDir: wxData?.windDir,
            windGust: wxData?.windGust,
            luminosity: wxData?.luminosity,
            rain1h: wxData?.rain1h,
        };
    });

    return NextResponse.json(chartData);
}
