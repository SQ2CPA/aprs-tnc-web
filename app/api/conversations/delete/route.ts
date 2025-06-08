import { Message } from "@/lib/db/models";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const data = await request.json();

    const callsign = data["callsign"] as string;

    await Message.destroy({
        where: {
            sender: callsign,
        },
    });

    return NextResponse.json({
        success: true,
    });
}
