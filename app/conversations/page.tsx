"use client";

import { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Delete, MessageSquare, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import FooterLayout from "@/components/layouts/FooterLayout";

interface Conversation {
    callsign: string;
    lastMessage: string;
    createdAt: string;
    unread: number;
}

export default function ConversationsPage() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchConversations = async () => {
        try {
            const response = await fetch("/api/conversations");
            const data = await response.json();
            setConversations(data);
        } catch (error) {
            console.error("Error fetching conversations:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConversations();
        const intervalId = setInterval(fetchConversations, 5000);
        return () => clearInterval(intervalId);
    }, []);

    const handleDelete = async (callsign: string) => {
        try {
            const response = await fetch(`/api/conversations/delete`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ callsign }),
            });

            if (response.ok) {
                fetchConversations();
            } else {
                console.error("Failed to delete conversation");
            }
        } catch (error) {
            console.error("Error deleting conversation:", error);
        }
    };

    return (
        <FooterLayout>
            <div className="mb-6">
                <Button variant="secondary" asChild>
                    <Link href="/" className="flex items-center">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Map
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    {/* ... bez zmian ... */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle>Conversations</CardTitle>
                            <CardDescription>
                                Your message conversations with other stations
                            </CardDescription>
                        </div>
                        <Link
                            href="/conversations/new"
                            className="w-full sm:w-auto"
                        >
                            <Button className="w-full sm:w-auto">
                                <Plus className="mr-2 h-4 w-4" />
                                New Message
                            </Button>
                        </Link>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p>Loading conversations...</p>
                    ) : conversations.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Callsign</TableHead>
                                    <TableHead>Last Message</TableHead>
                                    <TableHead>Time</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {conversations.map((conversation) => (
                                    <TableRow key={conversation.callsign}>
                                        <TableCell className="font-medium">
                                            {conversation.callsign}
                                        </TableCell>
                                        <TableCell className="truncate max-w-[150px]">
                                            <div className="flex items-center gap-2">
                                                {conversation.unread > 0 && (
                                                    <Badge
                                                        variant="destructive"
                                                        className="text-xs"
                                                    >
                                                        {conversation.unread}
                                                    </Badge>
                                                )}
                                                <span>
                                                    {conversation.lastMessage}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(
                                                conversation.createdAt
                                            ).toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            <Button size="sm" asChild>
                                                <Link
                                                    href={`/messages/${conversation.callsign}`}
                                                >
                                                    <MessageSquare className="mr-2 h-4 w-4" />
                                                    View
                                                </Link>
                                            </Button>{" "}
                                            {/* --- Zmiany w przycisku Delete --- */}
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                    >
                                                        <Delete className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>
                                                            Are you sure?
                                                        </AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This action cannot
                                                            be undone. This will
                                                            permanently delete
                                                            the conversation
                                                            with{" "}
                                                            <strong>
                                                                {
                                                                    conversation.callsign
                                                                }
                                                            </strong>
                                                            .
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>
                                                            Cancel
                                                        </AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() =>
                                                                handleDelete(
                                                                    conversation.callsign
                                                                )
                                                            }
                                                        >
                                                            Confirm
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <p className="text-center py-4">
                            No conversations found.
                        </p>
                    )}
                </CardContent>
            </Card>
        </FooterLayout>
    );
}
