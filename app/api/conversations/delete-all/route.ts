import { Message } from "@/lib/db/models";
import { NextResponse } from "next/server";

export async function POST() {
    try {
        await Message.destroy({
            where: {},
            truncate: true,
        });

        return NextResponse.json({
            success: true,
        });
    } catch (error) {
        console.error("Failed to delete all conversations:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
