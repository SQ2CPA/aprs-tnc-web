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

    const telemetryPackets = await Packet.findAll({
        where: {
            callsign: callsign,
            parsedType: "beacon",
            "parsedData.isTelemetry": true,
            receivedAt: { [Op.gte]: twentyFourHoursAgo },
        },
        order: [["receivedAt", "ASC"]],
        attributes: ["parsedData", "receivedAt"],
    });

    if (!telemetryPackets || telemetryPackets.length === 0) {
        return NextResponse.json([]);
    }

    const chartData = telemetryPackets.map((p) => {
        const parsedData = p.parsedData as APRSBeaconFrame;
        const decodedTelemetry = parsedData.decodedTelemetry;

        return {
            time: p.receivedAt,
            rxPackets: decodedTelemetry?.rxPackets,
            txPackets: decodedTelemetry?.txPackets,
            digiPackets: decodedTelemetry?.digiPackets,
            internalVoltage: decodedTelemetry?.internalVoltage,
            externalVoltage: decodedTelemetry?.externalVoltage,
        };
    });

    return NextResponse.json(chartData);
}
