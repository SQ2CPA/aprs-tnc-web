"use client";

import { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import FooterLayout from "@/components/layouts/FooterLayout";

interface Frame {
    id: string;
    timestamp: string;
    raw: string;
}

export default function RawFramesPage() {
    const params = useParams();
    const callsign = params.callsign as string;
    const [frames, setFrames] = useState<Frame[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFrames = async () => {
            try {
                const response = await fetch(`/api/station/${callsign}/frames`);
                const data = await response.json();
                setFrames(data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching frames:", error);
                setLoading(false);
            }
        };

        if (callsign) {
            fetchFrames();
        }
    }, [callsign]);

    return (
        <FooterLayout>
            <div className="mb-6">
                <Button variant="secondary" asChild>
                    <Link
                        href={`/station/${callsign}`}
                        className="flex items-center"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Station Details
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Raw Frames</CardTitle>
                    <CardDescription>
                        All raw APRS frames for {callsign}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p>Loading frames...</p>
                    ) : frames.length > 0 ? (
                        <div className="space-y-2">
                            {frames.map((frame) => (
                                <div
                                    key={frame.id}
                                    className="font-mono text-sm border-b pb-2 last:border-b-0"
                                >
                                    <span className="text-muted-foreground">
                                        {frame.timestamp}
                                    </span>
                                    <span>:</span>
                                    <span className="break-all">
                                        {frame.raw}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center py-4">
                            No frames found for this station.
                        </p>
                    )}
                </CardContent>
            </Card>
        </FooterLayout>
    );
}
