"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    AlertTriangle,
    ArrowLeft,
    Eraser,
    Radio,
    Send,
    Terminal,
} from "lucide-react";
import FooterLayout from "@/components/layouts/FooterLayout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
    PACKET_CONSOLE_HISTORY_LIMIT,
    PACKET_CONSOLE_POLL_INTERVAL_MS,
    type PacketConsoleLine,
} from "@/lib/packet-console";

function formatConsoleTimestamp(timestamp: string) {
    return new Date(timestamp).toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    });
}

export default function PacketConsolePage() {
    const [lines, setLines] = useState<PacketConsoleLine[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDangerOpen, setIsDangerOpen] = useState(true);
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [rawFrame, setRawFrame] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);

    const consoleViewportRef = useRef<HTMLDivElement>(null);
    const frameInputRef = useRef<HTMLInputElement>(null);
    const clearedAfterRef = useRef<string | null>(null);
    const router = useRouter();
    const { toast } = useToast();

    const fetchConsole = async (showLoader = false) => {
        if (showLoader) {
            setLoading(true);
        }

        try {
            const response = await fetch("/api/packet-console", {
                cache: "no-store",
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to load packet console.");
            }

            const clearedAfter = clearedAfterRef.current;
            const nextLines: PacketConsoleLine[] = Array.isArray(data.lines)
                ? data.lines
                : [];

            setLines(
                nextLines
                    .filter((line) => {
                        if (!clearedAfter) {
                            return true;
                        }

                        return (
                            new Date(line.timestamp).getTime() >
                            new Date(clearedAfter).getTime()
                        );
                    })
                    .slice(-PACKET_CONSOLE_HISTORY_LIMIT)
            );
            setFetchError(null);
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to load packet console.";
            setFetchError(message);
        } finally {
            if (showLoader) {
                setLoading(false);
            }
        }
    };

    const handleClearConsole = () => {
        clearedAfterRef.current = new Date().toISOString();
        setLines([]);
    };

    const handleCopyFrameToInput = (line: PacketConsoleLine) => {
        setRawFrame(line.raw);
        frameInputRef.current?.focus();
    };

    useEffect(() => {
        void fetchConsole(true);

        const intervalId = setInterval(() => {
            void fetchConsole();
        }, PACKET_CONSOLE_POLL_INTERVAL_MS);

        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        if (!consoleViewportRef.current) {
            return;
        }

        consoleViewportRef.current.scrollTop =
            consoleViewportRef.current.scrollHeight;
    }, [lines]);

    const handleSendFrame = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const trimmedFrame = rawFrame.trim();
        if (!trimmedFrame) {
            return;
        }

        setIsSending(true);

        try {
            const response = await fetch("/api/packet-console", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    rawFrame: trimmedFrame,
                }),
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Failed to send the frame to RF."
                );
            }

            setRawFrame("");
            await fetchConsole();

            toast({
                title:
                    data.status === "queued" ? "Frame queued" : "Frame sent",
                description:
                    data.status === "queued"
                        ? "The frame was queued for RF transmit and should appear shortly."
                        : "The frame was sent to RF and logged as TX.",
            });
        } catch (error) {
            toast({
                title: "Send failed",
                description:
                    error instanceof Error
                        ? error.message
                        : "Failed to send the frame to RF.",
                variant: "destructive",
            });
        } finally {
            setIsSending(false);
        }
    };

    return (
        <FooterLayout maxWidthClassName="max-w-7xl">
            <AlertDialog
                open={isDangerOpen}
                onOpenChange={(open) => {
                    if (open) {
                        setIsDangerOpen(true);
                    }
                }}
            >
                <AlertDialogContent
                    className="border-destructive/60 sm:max-w-xl"
                    onEscapeKeyDown={(event) => event.preventDefault()}
                >
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-3 text-2xl text-destructive">
                            <AlertTriangle className="h-6 w-6" />
                            DANGER ZONE
                        </AlertDialogTitle>
                        <AlertDialogDescription className="space-y-3 text-sm leading-6 text-left">
                            <p>
                                Packet Console is for developers, testers, and
                                advanced APRS/TNC troubleshooting only.
                            </p>
                            <p>
                                It shows raw RF traffic and lets you transmit
                                raw frames directly to RF.
                            </p>
                            <p>
                                If you do not know exactly what this is, do not
                                enter this page.
                            </p>
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4">
                        <input
                            id="danger-confirmation"
                            type="checkbox"
                            className="mt-1 h-4 w-4 accent-red-600"
                            checked={isConfirmed}
                            onChange={(event) =>
                                setIsConfirmed(event.target.checked)
                            }
                        />
                        <Label
                            htmlFor="danger-confirmation"
                            className="text-sm font-medium leading-6"
                        >
                            Yes, I know what I am doing.
                        </Label>
                    </div>

                    <AlertDialogFooter className="sm:justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push("/")}
                        >
                            OK, leave
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            disabled={!isConfirmed}
                            onClick={() => setIsDangerOpen(false)}
                        >
                            OK, I know what I am doing
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <div className="mb-6">
                <Button variant="secondary" asChild>
                    <Link href="/menu" className="flex items-center">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Menu
                    </Link>
                </Button>
            </div>

            <Card className="border-destructive/30">
                <CardHeader>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-3">
                                <Terminal className="h-5 w-5 text-destructive" />
                                Packet Console
                            </CardTitle>
                            <CardDescription>
                                Live raw RF console with the latest RX/TX lines.
                                Maximum {PACKET_CONSOLE_HISTORY_LIMIT} lines are
                                kept on screen.
                            </CardDescription>
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-destructive/30 bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">
                            <Radio className="h-3.5 w-3.5" />
                            Refreshing every second
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-1 text-xs text-destructive">
                            Developer-only raw access. TX goes directly to RF.
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleClearConsole}
                        >
                            <Eraser className="mr-2 h-4 w-4" />
                            Clear
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {fetchError ? (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Console unavailable</AlertTitle>
                            <AlertDescription>{fetchError}</AlertDescription>
                        </Alert>
                    ) : null}

                    <div
                        ref={consoleViewportRef}
                        className="h-[420px] overflow-auto rounded-lg border border-border bg-black/90 p-4 font-mono text-xs text-green-200 shadow-inner sm:text-sm"
                    >
                        {loading ? (
                            <p className="text-green-300/80">
                                Loading packet console...
                            </p>
                        ) : lines.length > 0 ? (
                            <div className="min-w-max space-y-2">
                                {lines.map((line) => (
                                    <button
                                        key={line.id}
                                        type="button"
                                        onClick={() => handleCopyFrameToInput(line)}
                                        className="block min-w-full whitespace-nowrap rounded px-1 py-0.5 text-left transition-colors hover:bg-white/5 focus:outline-none focus:ring-1 focus:ring-red-400"
                                        title="Copy raw frame to input"
                                    >
                                        <span className="text-slate-400">
                                            [{formatConsoleTimestamp(line.timestamp)}]
                                        </span>{" "}
                                        <span
                                            className={
                                                line.direction === "TX"
                                                    ? "text-red-300"
                                                    : "text-emerald-300"
                                            }
                                        >
                                            [{line.direction}]
                                        </span>{" "}
                                        <span className="text-slate-100">
                                            {line.raw}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <p className="text-green-300/80">
                                No console lines yet.
                            </p>
                        )}
                    </div>

                    <form
                        onSubmit={handleSendFrame}
                        className="flex flex-col gap-3 sm:flex-row"
                    >
                        <Input
                            ref={frameInputRef}
                            value={rawFrame}
                            onChange={(event) => setRawFrame(event.target.value)}
                            placeholder="N0CALL>APRS,WIDE1-1:>Test frame"
                            className="font-mono"
                            disabled={isSending || isDangerOpen}
                            autoComplete="off"
                            spellCheck={false}
                        />
                        <Button
                            type="submit"
                            variant="destructive"
                            disabled={
                                isSending || isDangerOpen || rawFrame.trim().length === 0
                            }
                            className="sm:min-w-40"
                        >
                            <Send className="mr-2 h-4 w-4" />
                            {isSending ? "Sending..." : "Send to RF"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </FooterLayout>
    );
}
