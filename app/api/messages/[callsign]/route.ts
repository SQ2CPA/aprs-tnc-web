import { Message } from "@/lib/db/models";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ callsign: string }> }
) {
    const { callsign } = await params;

    try {
        const messages = await Message.findAll({
            where: {
                sender: callsign,
            },
            order: [["createdAt", "ASC"]],
        });

        await Message.update(
            {
                isUnread: false,
            },
            {
                where: {
                    sender: callsign,
                },
            }
        );

        return NextResponse.json(messages);
    } catch (error) {
        return NextResponse.json(
            { error: "Nie udało się pobrać wiadomości." },
            { status: 500 }
        );
    }
}
