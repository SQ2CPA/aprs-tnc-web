import {
    Message,
    Packet,
    PacketConsoleEvent,
    PacketConsoleTransmission,
    Station,
} from "@/lib/db/models";
import { NextResponse } from "next/server";

export async function POST() {
    try {
        // Delete all messages
        await Message.destroy({ where: {}, truncate: true });

        // Delete packet console data
        await PacketConsoleEvent.destroy({ where: {}, truncate: true });
        await PacketConsoleTransmission.destroy({ where: {}, truncate: true });

        // Delete all packets
        await Packet.destroy({ where: {}, truncate: true });

        // Delete all stations
        await Station.destroy({ where: {}, truncate: true });

        return NextResponse.json({
            success: true,
            message: "Database cleaned successfully",
        });
    } catch (error) {
        console.error("Error cleaning database:", error);
        return NextResponse.json(
            { success: false, message: "Failed to clean database" },
            { status: 500 }
        );
    }
}
