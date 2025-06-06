import { Message } from "@/lib/db/models";
import { NextResponse } from "next/server";
import { Op, fn, col } from "sequelize";

interface LatestMessageIdentifier {
    sender: string;
    maxCreatedAt: Date;
}

interface UnreadCount {
    sender: string;
    unreadCount: number;
}

export async function GET() {
    try {
        const latestMessageIdentifiers = (await Message.findAll({
            attributes: [
                "sender",
                [fn("MAX", col("createdAt")), "maxCreatedAt"],
            ],
            group: ["sender"],
            raw: true,
        })) as unknown as LatestMessageIdentifier[];

        if (latestMessageIdentifiers.length === 0) {
            return NextResponse.json([]);
        }

        const latestMessages = await Message.findAll({
            where: {
                [Op.or]: latestMessageIdentifiers.map((identifier) => ({
                    sender: identifier.sender,
                    createdAt: identifier.maxCreatedAt,
                })),
            },
            order: [["createdAt", "DESC"]],
        });

        const unreadCountsRaw = (await Message.findAll({
            attributes: ["sender", [fn("COUNT", col("id")), "unreadCount"]],
            where: {
                isUnread: true,
            },
            group: ["sender"],
            raw: true,
        })) as unknown as UnreadCount[];

        const unreadCountMap = unreadCountsRaw.reduce((acc, curr) => {
            acc[curr.sender] = parseInt(String(curr.unreadCount), 10);
            return acc;
        }, {} as Record<string, number>);

        const conversations = latestMessages.map((message) => ({
            callsign: message.sender,
            lastMessage: message.content,
            createdAt: message.createdAt,
            unread: unreadCountMap[message.sender] || 0,
        }));

        return NextResponse.json(conversations);
    } catch (error) {
        console.error("Failed to fetch conversations:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
