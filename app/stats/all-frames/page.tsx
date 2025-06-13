"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    ResponsiveContainer,
    BarChart,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    Bar,
    CartesianGrid,
} from "recharts";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import FooterLayout from "@/components/layouts/FooterLayout";

interface FrameHistoryData {
    time: string;
    count: number;
}

export default function GlobalHistoryPage() {
    const [chartData, setChartData] = useState<FrameHistoryData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`/api/stats/all-frames`);
                if (!response.ok) {
                    throw new Error(`API error: ${response.status}`);
                }
                const data: FrameHistoryData[] = await response.json();
                setChartData(data);
            } catch (err) {
                setError("Can't load statistics!");
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    const renderChart = () => (
        <ResponsiveContainer width="100%" height={400}>
            <BarChart
                data={chartData}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis allowDecimals={false} />
                <Tooltip
                    contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        borderColor: "hsl(var(--border))",
                    }}
                />
                <Legend />
                <Bar dataKey="count" fill="#3b82f6" name="Packets count" />
            </BarChart>
        </ResponsiveContainer>
    );

    return (
        <FooterLayout>
            <div className="mb-6">
                <Button variant="secondary" asChild>
                    <Link href={`/`} className="flex items-center">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Map
                    </Link>
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Global Packet History</CardTitle>
                    <CardDescription>
                        Total number of all APRS packets received in the system,
                        broken down by hour, over the last 24 hours.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading && (
                        <div className="flex flex-col items-center justify-center gap-4 h-[400px]">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            <p className="text-muted-foreground">
                                Loading data...
                            </p>
                        </div>
                    )}
                    {error && !loading && (
                        <div className="flex items-center justify-center h-[400px]">
                            <p className="text-destructive">{error}</p>
                        </div>
                    )}
                    {!loading &&
                        !error &&
                        chartData.length > 0 &&
                        renderChart()}
                    {!loading && !error && chartData.length === 0 && (
                        <div className="flex items-center justify-center h-[400px]">
                            <p className="text-muted-foreground">
                                No frame data available for the last 24 hours.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </FooterLayout>
    );
}
