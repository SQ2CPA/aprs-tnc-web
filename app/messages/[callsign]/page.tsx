"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, RotateCcw, X } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import FooterLayout from "@/components/layouts/FooterLayout";

enum MessageStatus {
    RECEIVED,
    RECEIVED_ACK,
    RECEIVED_NO_ACK,
    NOT_CONFIRMED,
    DELIVERED,
    SENDING,
    ABORTED,
    ERROR,
}

interface Message {
    id: number;
    sender: string;
    type: "sent" | "received";
    receiver: string;
    content: string;
    createdAt: string;
    status?: MessageStatus;
    retries?: number;
}

export default function MessagesPage() {
    const params = useParams();
    const callsign = params.callsign as string;
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    const fetchMessages = async () => {
        try {
            const response = await fetch(`/api/messages/${callsign}`);
            const data = await response.json();
            setMessages(data);
        } catch (error) {
            console.error("Error fetching messages:", error);
            toast({
                title: "Error",
                description: "Failed to load messages.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (callsign) {
            fetchMessages();
            const intervalId = setInterval(fetchMessages, 5000);
            return () => clearInterval(intervalId);
        }
    }, [callsign]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const response = await fetch("/api/messages/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ callsign, content: newMessage }),
            });

            if (response.ok) {
                setNewMessage("");
                fetchMessages();
            } else {
                throw new Error("Failed to send message");
            }
        } catch (error) {
            console.error("Error sending message:", error);
            toast({
                title: "Error",
                description: "Failed to send message. Please try again.",
                variant: "destructive",
            });
        }
    };

    const handleRetryMessage = async (id: number) => {
        setMessages((prevMessages) =>
            prevMessages.map((msg) =>
                msg.id === id
                    ? { ...msg, status: MessageStatus.SENDING, retries: 0 }
                    : msg
            )
        );

        try {
            const response = await fetch(`/api/messages/retry`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });

            if (response.ok) {
                toast({
                    title: "Retrying message",
                    description: "Retrying to send message...",
                });
            } else {
                throw new Error("Failed to retry message");
            }
        } catch (error) {
            console.error("Error retrying message:", error);
            toast({
                title: "Error",
                description: "Failed to retry message. Please try again.",
                variant: "destructive",
            });
            fetchMessages();
        }
    };

    const handleCancelMessage = async (id: number) => {
        setMessages((prevMessages) =>
            prevMessages.map((msg) =>
                msg.id === id ? { ...msg, status: MessageStatus.ABORTED } : msg
            )
        );

        try {
            const response = await fetch(`/api/messages/cancel`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });

            if (response.ok) {
                toast({
                    title: "Message cancelled",
                    description: "Message sending has been canceled.",
                });
            } else {
                throw new Error("Failed to cancel message");
            }
        } catch (error) {
            console.error("Error canceling message:", error);
            toast({
                title: "Error",
                description: "Failed to cancel message. Please try again.",
                variant: "destructive",
            });
            fetchMessages();
        }
    };

    const getStatusBadge = (message: Message) => {
        switch (message.status) {
            case MessageStatus.RECEIVED_ACK:
                return (
                    <Badge variant="success" className="text-xs">
                        Sent ACK
                    </Badge>
                );
            case MessageStatus.SENDING:
                return (
                    <Badge variant="secondary" className="text-xs">
                        {`Sending (${message.retries || 0}/10)`}
                    </Badge>
                );
            case MessageStatus.ABORTED:
                return (
                    <Badge variant="destructive" className="text-xs">
                        Aborted
                    </Badge>
                );
            case MessageStatus.DELIVERED:
                return (
                    <Badge variant="success" className="text-xs">
                        Delivered
                    </Badge>
                );
            case MessageStatus.ERROR:
                return (
                    <Badge variant="destructive" className="text-xs">
                        Error
                    </Badge>
                );
            default:
                return null;
        }
    };

    const getActionButtons = (message: Message) => {
        if (message.type === "received") return null;

        switch (message.status) {
            case MessageStatus.SENDING:
                return (
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleCancelMessage(message.id)}
                        className="ml-2 px-2 py-1 h-auto"
                    >
                        <X className="h-3 w-3" />
                        <span className="ml-1 text-xs">Cancel</span>
                    </Button>
                );
            case MessageStatus.ABORTED:
            case MessageStatus.DELIVERED:
            case MessageStatus.ERROR:
                return (
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleRetryMessage(message.id)}
                        className="ml-2 px-2 py-1 h-auto"
                    >
                        <RotateCcw className="h-3 w-3" />
                        <span className="ml-1 text-xs">Retry</span>
                    </Button>
                );
            default:
                return null;
        }
    };

    return (
        <FooterLayout>
            <div className="mb-6">
                <Button variant="secondary" asChild>
                    <Link href="/conversations" className="flex items-center">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Conversations
                    </Link>
                </Button>
            </div>

            <Card className="flex flex-col h-[calc(70vh)]">
                <CardHeader>
                    <CardTitle>Messages with {callsign}</CardTitle>
                    <CardDescription>
                        <Link
                            href={`/station/${callsign}`}
                            className="text-blue-500 hover:underline"
                        >
                            View station details
                        </Link>
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow overflow-y-auto">
                    {loading ? (
                        <p className="text-center py-4">Loading messages...</p>
                    ) : messages.length > 0 ? (
                        <div className="space-y-4">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex ${
                                        message.type === "received"
                                            ? "justify-start"
                                            : "justify-end"
                                    }`}
                                >
                                    <div
                                        className={`max-w-[80%] rounded-lg px-4 py-2 ${
                                            message.type === "received"
                                                ? "bg-muted"
                                                : "bg-primary text-primary-foreground"
                                        }`}
                                    >
                                        <p>{message.content}</p>
                                        <div className="flex items-center justify-between mt-1 min-h-[20px]">
                                            <p className="text-xs opacity-70">
                                                {new Date(
                                                    message.createdAt
                                                ).toLocaleString()}
                                            </p>
                                            <div className="flex items-center ml-2">
                                                {getStatusBadge(message)}
                                                {getActionButtons(message)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                    ) : (
                        <p className="text-center py-4">
                            No messages yet. Start a conversation!
                        </p>
                    )}
                </CardContent>
                <CardFooter>
                    <form
                        onSubmit={handleSendMessage}
                        className="flex w-full gap-2"
                    >
                        <Input
                            placeholder="Type your message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            className="flex-grow"
                        />
                        <Button
                            type="submit"
                            disabled={!newMessage.trim() || loading}
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </CardFooter>
            </Card>
        </FooterLayout>
    );
}
