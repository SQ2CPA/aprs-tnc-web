"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import FooterLayout from "@/components/layouts/FooterLayout";

interface TelemetryData {
    time: string;
    rxPackets?: number;
    txPackets?: number;
    digiPackets?: number;
    internalVoltage?: number;
    externalVoltage?: number;
}

const formatXAxis = (tickItem: string) => {
    return new Date(tickItem).toLocaleTimeString("pl-PL", {
        hour: "2-digit",
        minute: "2-digit",
    });
};

export default function TelemetryHistoryPage() {
    const params = useParams();
    const callsign = params.callsign as string;
    const [telemetryData, setTelemetryData] = useState<TelemetryData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!callsign) return;

        const fetchTelemetryData = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(
                    `/api/station/${callsign}/telemetry`
                );
                if (!response.ok) {
                    throw new Error(
                        `Failed to fetch data: ${response.statusText}`
                    );
                }
                const data = await response.json();
                setTelemetryData(data);
            } catch (err: any) {
                setError(err.message);
                console.error("Error fetching telemetry history:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchTelemetryData();
    }, [callsign]);

    const renderChart = (
        title: string,
        dataKeys: { key: keyof TelemetryData; color: string; label: string }[],
        unit: string = ""
    ) => (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={telemetryData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" tickFormatter={formatXAxis} />
                        <YAxis unit={unit} domain={["auto", "auto"]} />
                        <Tooltip
                            labelFormatter={(label) =>
                                new Date(label).toLocaleString("pl-PL")
                            }
                            formatter={(value, name) => [
                                `${Number(value).toFixed(2)} ${unit}`,
                                name,
                            ]}
                        />
                        <Legend />
                        {dataKeys.map((item) => (
                            <Line
                                key={item.key}
                                type="monotone"
                                dataKey={item.key}
                                stroke={item.color}
                                name={item.label}
                                dot={false}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );

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

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Telemetry History</CardTitle>
                    <CardDescription>
                        Displaying data for <strong>{callsign}</strong> from the
                        last 24 hours.
                    </CardDescription>
                </CardHeader>
            </Card>

            {loading && (
                <Card>
                    <CardContent className="py-20 flex flex-col items-center justify-center gap-4">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        <p className="text-muted-foreground">
                            Loading telemetry data...
                        </p>
                    </CardContent>
                </Card>
            )}

            {!loading && !error && telemetryData.length === 0 && (
                <Card>
                    <CardContent className="py-20 text-center">
                        <p>
                            No telemetry data found for this station in the last
                            24 hours.
                        </p>
                    </CardContent>
                </Card>
            )}

            {error && (
                <Card>
                    <CardContent className="py-20 text-center text-red-600">
                        <p>Error: {error}</p>
                    </CardContent>
                </Card>
            )}

            {!loading && !error && telemetryData.length > 0 && (
                <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                    {renderChart("Packet Counters", [
                        {
                            key: "txPackets",
                            color: "#8884d8",
                            label: "TX packets",
                        },
                        {
                            key: "rxPackets",
                            color: "#82ca9d",
                            label: "RX packets",
                        },
                        {
                            key: "digiPackets",
                            color: "#ffc658",
                            label: "Digi packets",
                        },
                    ])}

                    {renderChart(
                        "Voltage Levels",
                        [
                            {
                                key: "internalVoltage",
                                color: "#e67e22",
                                label: "Internal",
                            },
                            {
                                key: "externalVoltage",
                                color: "#3498db",
                                label: "External",
                            },
                        ],
                        "V"
                    )}
                </div>
            )}
        </FooterLayout>
    );
}
