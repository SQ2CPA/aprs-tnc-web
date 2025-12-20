import { Message } from "@/lib/db/models";
import { MessageStatus } from "@/lib/db/models/Message";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const data = await request.json();

    const messageType = data["messageType"] || "normal";
    let sender: string;
    let content: string = data["content"];
    let messageId: string | null = null;

    if (messageType === "cq") {
        sender = "BLN1CQ";
        content = "CQ " + content;
    } else if (messageType === "bulletin") {
        const bulletinId = data["bulletinId"];
        if (!bulletinId || bulletinId.length === 0 || bulletinId.length > 6) {
            return NextResponse.json(
                { error: "Bulletin ID must be between 1 and 6 characters" },
                { status: 400 }
            );
        }
        sender = "BLN" + bulletinId.toUpperCase();
    } else {
        sender = data["callsign"];
        const ID = Math.floor(Math.random() * (99 - 10 + 1) + 10);
        messageId = ID.toString();
    }

    await Message.create({
        content: content,
        sender: sender,
        messageId: messageId,
        status: MessageStatus.SENDING,
        type: "sent",
        retries: 0,
    });

    return NextResponse.json({
        success: true,
    });
}
