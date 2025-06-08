"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail } from "lucide-react";

interface Conversation {
    callsign: string;
    lastMessage: string;
    createdAt: string;
    unread: number;
}

export default function ConversationsButton() {
    const [totalUnread, setTotalUnread] = useState(0);

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const response = await fetch("/api/conversations");
                if (!response.ok) {
                    throw new Error("Failed to fetch conversations");
                }
                const data: Conversation[] = await response.json();

                const unreadCount = data.reduce(
                    (sum, conversation) => sum + conversation.unread,
                    0
                );

                setTotalUnread(unreadCount);
            } catch (error) {
                console.error("Error fetching conversations:", error);
                setTotalUnread(0);
            }
        };

        fetchConversations();

        const intervalId = setInterval(fetchConversations, 10000);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <Link
            href="/conversations"
            className="flex h-10 items-center gap-2 rounded-md bg-white/90 px-3 py-2 backdrop-blur dark:bg-gray-800/90 dark:text-white"
            aria-label={`Konwersacje. Nieprzeczytane wiadomości: ${totalUnread}`}
        >
            <Mail className="h-5 w-5" />

            {totalUnread > 0 && (
                <span className="text-sm font-bold text-destructive">
                    {totalUnread}
                </span>
            )}
        </Link>
    );
}
