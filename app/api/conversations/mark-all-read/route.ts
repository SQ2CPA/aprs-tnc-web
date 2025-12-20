import { Message } from "@/lib/db/models";
import { NextResponse } from "next/server";

export async function POST() {
    try {
        await Message.update(
            {
                isUnread: false,
            },
            {
                where: {
                    isUnread: true,
                },
            }
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to mark all messages as read:", error);
        return NextResponse.json(
            { error: "Failed to mark all messages as read" },
            { status: 500 }
        );
    }
}
