"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Send } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import FooterLayout from "@/components/layouts/FooterLayout";

export default function NewMessagePage() {
    const [callsign, setCallsign] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!callsign.trim() || !message.trim()) {
            toast({
                title: "Error",
                description: "Please enter both callsign and message.",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("/api/messages/send", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    callsign: callsign.trim().toUpperCase(),
                    content: message.trim(),
                }),
            });

            if (response.ok) {
                toast({
                    title: "Message sent",
                    description: `Message sent to ${callsign.toUpperCase()}`,
                });
                router.push(`/messages/${callsign.trim().toUpperCase()}`);
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
        } finally {
            setLoading(false);
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

            <Card>
                <CardHeader>
                    <CardTitle>New Message</CardTitle>
                    <CardDescription>
                        Send a message to another APRS station
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="callsign">Callsign</Label>
                            <Input
                                id="callsign"
                                placeholder="Enter callsign (e.g., SP5ABC)"
                                value={callsign}
                                onChange={(e) =>
                                    setCallsign(e.target.value.toUpperCase())
                                }
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="message">Message</Label>
                            <Textarea
                                id="message"
                                placeholder="Enter your message..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={4}
                                required
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" disabled={loading}>
                            <Send className="mr-2 h-4 w-4" />
                            {loading ? "Sending..." : "Send Message"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </FooterLayout>
    );
}
