import { Message } from "@/lib/db/models";
import { MessageStatus } from "@/lib/db/models/Message";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const data = await request.json();

    const ID = Math.floor(Math.random() * (99 - 10 + 1) + 10);

    await Message.create({
        content: data["content"],
        sender: data["callsign"],
        messageId: ID.toString(),
        status: MessageStatus.SENDING,
        type: "sent",
        retries: 0,
    });

    return NextResponse.json({
        success: true,
    });
}
