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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Send, Radio } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import FooterLayout from "@/components/layouts/FooterLayout";

export default function NewMessagePage() {
    const [messageType, setMessageType] = useState<
        "normal" | "cq" | "bulletin"
    >("normal");
    const [callsign, setCallsign] = useState("");
    const [bulletinId, setBulletinId] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [showCQAlert, setShowCQAlert] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!message.trim()) {
            toast({
                title: "Error",
                description: "Please enter a message.",
                variant: "destructive",
            });
            return;
        }

        if (messageType === "normal" && !callsign.trim()) {
            toast({
                title: "Error",
                description: "Please enter a callsign.",
                variant: "destructive",
            });
            return;
        }

        if (messageType === "bulletin" && !bulletinId.trim()) {
            toast({
                title: "Error",
                description: "Please enter a bulletin ID.",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);

        try {
            const requestBody: any = {
                content: message.trim(),
                messageType: messageType,
            };

            if (messageType === "normal") {
                requestBody.callsign = callsign.trim().toUpperCase();
            } else if (messageType === "bulletin") {
                requestBody.bulletinId = bulletinId.trim().toUpperCase();
            }

            const response = await fetch("/api/messages/send", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });

            if (response.ok) {
                if (messageType === "cq") {
                    setShowCQAlert(true);
                } else if (messageType === "bulletin") {
                    toast({
                        title: "Bulletin sent",
                        description: `Bulletin ${bulletinId.toUpperCase()} has been sent`,
                    });
                    router.push("/conversations");
                } else {
                    toast({
                        title: "Message sent",
                        description: `Message sent to ${callsign.toUpperCase()}`,
                    });
                    router.push(`/messages/${callsign.trim().toUpperCase()}`);
                }
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
                            <Label>Message Type</Label>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant={
                                        messageType === "normal"
                                            ? "default"
                                            : "outline"
                                    }
                                    onClick={() => setMessageType("normal")}
                                    className="flex-1"
                                >
                                    Normal
                                </Button>
                                <Button
                                    type="button"
                                    variant={
                                        messageType === "cq"
                                            ? "default"
                                            : "outline"
                                    }
                                    onClick={() => setMessageType("cq")}
                                    className="flex-1"
                                >
                                    CQ
                                </Button>
                                <Button
                                    type="button"
                                    variant={
                                        messageType === "bulletin"
                                            ? "default"
                                            : "outline"
                                    }
                                    onClick={() => setMessageType("bulletin")}
                                    className="flex-1"
                                >
                                    Bulletin
                                </Button>
                            </div>
                        </div>

                        {messageType === "normal" && (
                            <div className="space-y-2">
                                <Label htmlFor="callsign">Callsign</Label>
                                <Input
                                    id="callsign"
                                    placeholder="Enter callsign (e.g., SP5ABC)"
                                    value={callsign}
                                    onChange={(e) =>
                                        setCallsign(
                                            e.target.value.toUpperCase()
                                        )
                                    }
                                    required
                                />
                            </div>
                        )}

                        {messageType === "bulletin" && (
                            <div className="space-y-2">
                                <Label htmlFor="bulletinId">
                                    Bulletin ID (1-6 characters)
                                </Label>
                                <Input
                                    id="bulletinId"
                                    placeholder="e.g., 0, A, 0ALERT"
                                    value={bulletinId}
                                    onChange={(e) =>
                                        setBulletinId(
                                            e.target.value.toUpperCase()
                                        )
                                    }
                                    maxLength={6}
                                    required
                                />
                                <p className="text-sm text-muted-foreground">
                                    Standard IDs: 0-9, A-Z. Custom IDs like
                                    0ALERT are also allowed.
                                </p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="message">Message</Label>
                            <Textarea
                                id="message"
                                placeholder={
                                    messageType === "cq"
                                        ? "Enter your CQ message (CQ prefix will be added automatically)..."
                                        : "Enter your message..."
                                }
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
                            {loading
                                ? "Sending..."
                                : messageType === "cq"
                                ? "Send CQ"
                                : messageType === "bulletin"
                                ? "Send Bulletin"
                                : "Send Message"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>

            <AlertDialog open={showCQAlert} onOpenChange={setShowCQAlert}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <div className="flex items-center justify-center mb-4">
                            <div className="rounded-full bg-primary/10 p-3">
                                <Radio className="h-8 w-8 text-primary" />
                            </div>
                        </div>
                        <AlertDialogTitle className="text-center text-2xl">
                            CQ Sent Successfully!
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-center text-base">
                            Your CQ has been broadcast. Wait for responses from
                            other stations...
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="sm:justify-center">
                        <AlertDialogAction
                            onClick={() => {
                                setShowCQAlert(false);
                                router.push("/conversations");
                            }}
                        >
                            OK
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </FooterLayout>
    );
}
