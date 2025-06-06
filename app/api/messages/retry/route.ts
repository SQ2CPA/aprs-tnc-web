import { Message } from "@/lib/db/models";
import { MessageStatus } from "@/lib/db/models/Message";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const data = await request.json();

    const id = data["id"] as number;

    await Message.update(
        {
            status: MessageStatus.SENDING,
            retries: 0,
        },
        {
            where: {
                id,
            },
        }
    );

    return NextResponse.json({
        success: true,
    });
}
