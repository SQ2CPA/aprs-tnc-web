// app/api/history/all-frames/route.ts

import { Packet } from "@/lib/db/models";
import { NextResponse } from "next/server";
import { Op } from "sequelize";

export async function GET(request: Request) {
    try {
        const twentyFourHoursAgo = new Date();
        twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

        const packets = await Packet.findAll({
            where: {
                receivedAt: { [Op.gte]: twentyFourHoursAgo },
            },
            attributes: ["receivedAt"],
        });

        const hourlyData: {
            date: Date;
            time: string;
            count: number;
        }[] = [];

        const now = new Date();
        for (let i = 23; i >= 0; i--) {
            const date = new Date(now);
            date.setHours(now.getHours() - i, 0, 0, 0);
            hourlyData.push({
                date,
                time: date.toLocaleTimeString("pl-PL", {
                    hour: "2-digit",
                    minute: "2-digit",
                }),
                count: 0,
            });
        }

        packets.forEach((packet) => {
            const packetDate = new Date(packet.receivedAt);
            packetDate.setMinutes(0, 0, 0);

            const bucket = hourlyData.find(
                (h) => h.date.getTime() === packetDate.getTime()
            );
            if (bucket) {
                bucket.count++;
            }
        });

        const chartData = hourlyData.map(({ time, count }) => ({
            time,
            count,
        }));

        return NextResponse.json(chartData);
    } catch (error) {
        console.error("Error fetching frame history:", error);
        return NextResponse.json({ message: "Błąd serwera" }, { status: 500 });
    }
}
