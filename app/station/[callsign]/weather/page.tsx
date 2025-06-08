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

interface WeatherData {
    time: string;
    temperature?: number;
    pressure?: number;
    humidity?: number;
    windDir?: number;
    windGust?: number;
    luminosity?: number;
    rain1h?: number;
}

const weatherChartsConfig: {
    dataKey: keyof WeatherData;
    title: string;
    unit: string;
    color: string;
}[] = [
    {
        dataKey: "temperature",
        title: "Temperature",
        unit: "°C",
        color: "#ef4444",
    },
    { dataKey: "pressure", title: "Pressure", unit: "hPa", color: "#3b82f6" },
    { dataKey: "humidity", title: "Humidity", unit: "%", color: "#22c55e" },
    { dataKey: "windGust", title: "Wind Gust", unit: "km/h", color: "#a855f7" },
    {
        dataKey: "windDir",
        title: "Wind Direction",
        unit: "°",
        color: "#78716c",
    },
    {
        dataKey: "luminosity",
        title: "Luminosity",
        unit: "W/m²",
        color: "#f97316",
    },
    { dataKey: "rain1h", title: "Rain (1h)", unit: "mm", color: "#06b6d4" },
];

const formatXAxis = (tickItem: string) => {
    return new Date(tickItem).toLocaleTimeString("pl-PL", {
        hour: "2-digit",
        minute: "2-digit",
    });
};

export default function WeatherHistoryPage() {
    const params = useParams();
    const callsign = params.callsign as string;
    const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!callsign) return;

        const fetchWeatherData = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(
                    `/api/station/${callsign}/weather`
                );
                if (!response.ok) {
                    throw new Error(
                        `Failed to fetch data: ${response.statusText}`
                    );
                }
                const data = await response.json();
                setWeatherData(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchWeatherData();
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

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Weather History</CardTitle>
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
                            Loading weather data...
                        </p>
                    </CardContent>
                </Card>
            )}

            {!loading && !error && weatherData.length === 0 && (
                <Card>
                    <CardContent className="py-20 text-center">
                        <p>
                            No weather data found for this station in the last
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

            {!loading && !error && weatherData.length > 0 && (
                <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                    {weatherChartsConfig.map((chart) => (
                        <Card key={chart.dataKey}>
                            <CardHeader>
                                <CardTitle>{chart.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart
                                        data={weatherData.filter(
                                            (d) =>
                                                d[chart.dataKey] !== null &&
                                                d[chart.dataKey] !== undefined
                                        )}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="time"
                                            tickFormatter={formatXAxis}
                                        />
                                        <YAxis
                                            unit={chart.unit}
                                            domain={["auto", "auto"]}
                                        />
                                        <Tooltip
                                            labelFormatter={(label) =>
                                                new Date(label).toLocaleString(
                                                    "pl-PL"
                                                )
                                            }
                                            formatter={(value) => [
                                                `${Number(value).toFixed(2)} ${
                                                    chart.unit
                                                }`,
                                                chart.title,
                                            ]}
                                        />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey={chart.dataKey}
                                            name={chart.title}
                                            stroke={chart.color}
                                            dot={false}
                                            connectNulls
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </FooterLayout>
    );
}
