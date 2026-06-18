"use client";

import { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Download } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FooterLayout from "@/components/layouts/FooterLayout";

interface Frame {
    id: string;
    timestamp: string;
    raw: string;
    callsign: string;
}

export default function AllPacketsPage() {
    const [frames, setFrames] = useState<Frame[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("");

    useEffect(() => {
        const fetchFrames = async () => {
            try {
                const response = await fetch("/api/packets");
                const data = await response.json();
                setFrames(data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching frames:", error);
                setLoading(false);
            }
        };

        fetchFrames();
    }, []);

    const keyword = filter.trim().toLowerCase();
    const filteredFrames = keyword
        ? frames.filter((frame) =>
              `${frame.raw} ${frame.callsign} ${frame.timestamp}`
                  .toLowerCase()
                  .includes(keyword)
          )
        : frames;

    const handleDownload = () => {
        const content = filteredFrames.map((frame) => frame.raw).join("\n");
        const blob = new Blob([content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `aprs-packets-${new Date().toISOString()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <FooterLayout maxWidthClassName="max-w-7xl">
            <div className="mb-6">
                <Button variant="secondary" asChild>
                    <Link href="/menu" className="flex items-center">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Menu
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div>
                            <CardTitle>All Packets</CardTitle>
                            <CardDescription>
                                All raw APRS packets (last 1000)
                            </CardDescription>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDownload}
                            disabled={loading || filteredFrames.length === 0}
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Download txt
                        </Button>
                    </div>
                    <Input
                        type="text"
                        placeholder="Filter packets by keyword..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="mt-4"
                    />
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p>Loading packets...</p>
                    ) : filteredFrames.length > 0 ? (
                        <div className="space-y-2">
                            {filteredFrames.map((frame) => (
                                <div
                                    key={frame.id}
                                    className="font-mono text-sm border-b pb-2 last:border-b-0"
                                >
                                    <div className="flex flex-col gap-1">
                                        <div className="flex gap-2">
                                            <span className="text-muted-foreground">
                                                {frame.timestamp}
                                            </span>
                                            <span className="font-semibold text-primary">
                                                {frame.callsign}
                                            </span>
                                        </div>
                                        <span className="break-all">
                                            {frame.raw}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center py-4">
                            {keyword
                                ? "No packets match your filter."
                                : "No packets found."}
                        </p>
                    )}
                </CardContent>
            </Card>
        </FooterLayout>
    );
}
