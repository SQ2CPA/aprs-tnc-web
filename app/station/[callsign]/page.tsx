"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ArrowLeft,
    MessageSquare,
    FileText,
    Loader2,
    Thermometer,
    Wind,
    Gauge,
    Droplets,
    Sun,
    Snowflake,
    Zap,
    Map,
    LineChart,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AprsIcon } from "@/components/AprsIcon";
import {
    APRSFrame,
    APRSBeaconFrame,
    APRSWXKey,
    APRSTelemetry,
} from "@/lib/aprs/types";
import FooterLayout from "@/components/layouts/FooterLayout";

const weatherLabels: Record<
    APRSWXKey,
    { label: string; unit: string; icon: React.ReactNode }
> = {
    temperature: {
        label: "Temperature",
        unit: "°C",
        icon: <Thermometer className="h-4 w-4 text-muted-foreground" />,
    },
    windDir: {
        label: "Wind Direction",
        unit: "°",
        icon: <Wind className="h-4 w-4 text-muted-foreground" />,
    },
    windGust: {
        label: "Wind Gust",
        unit: "km/h",
        icon: <Wind className="h-4 w-4 text-muted-foreground" />,
    },
    pressure: {
        label: "Pressure",
        unit: "hPa",
        icon: <Gauge className="h-4 w-4 text-muted-foreground" />,
    },
    humidity: {
        label: "Humidity",
        unit: "%",
        icon: <Droplets className="h-4 w-4 text-muted-foreground" />,
    },
    rain1h: {
        label: "Rain (1h)",
        unit: "mm",
        icon: <Droplets className="h-4 w-4 text-muted-foreground" />,
    },
    rain24h: {
        label: "Rain (24h)",
        unit: "mm",
        icon: <Droplets className="h-4 w-4 text-muted-foreground" />,
    },
    rainSinceMidnight: {
        label: "Rain (since midnight)",
        unit: "mm",
        icon: <Droplets className="h-4 w-4 text-muted-foreground" />,
    },
    luminosity: {
        label: "Luminosity",
        unit: "W/m²",
        icon: <Sun className="h-4 w-4 text-muted-foreground" />,
    },
    snow: {
        label: "Snow (24h)",
        unit: "cm",
        icon: <Snowflake className="h-4 w-4 text-muted-foreground" />,
    },
    rainRaw: {
        label: "Raw Rain Reading",
        unit: "",
        icon: <Droplets className="h-4 w-4 text-muted-foreground" />,
    },
};

const telemetryLabels: Record<keyof APRSTelemetry, string> = {
    telemetryCounter: "Telemetry Counter",
    txPackets: "TX Packets",
    rxPackets: "RX Packets",
    digiPackets: "Digi Packets",
    internalVoltage: "Internal Voltage",
    externalVoltage: "External Voltage",
};

interface StationDetails {
    callsign: string;
    symbol: string;
    comment: string;
    lastPacketAt: Date;
    path: string;
    ssids: Array<{
        callsign: string;
        symbol: string;
    }>;
    parsedData: APRSFrame;
}

export default function StationPage() {
    const params = useParams();
    const callsign = params.callsign as string;
    const [stationDetails, setStationDetails] = useState<StationDetails | null>(
        null
    );
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStationDetails = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/station/${callsign}`);

                if (!response.ok) {
                    throw new Error(
                        `API responded with status: ${response.status}`
                    );
                }

                const data = await response.json();

                if (data.lastPacketAt) {
                    data.lastPacketAt = new Date(data.lastPacketAt);
                }

                setStationDetails(data);
            } catch (error) {
                console.error("Error fetching station details:", error);
                setStationDetails(null);
            } finally {
                setLoading(false);
            }
        };

        if (callsign) {
            fetchStationDetails();
        }
    }, [callsign]);

    const parsedData = stationDetails?.parsedData;

    if (loading) {
        return (
            <div className="container max-w-4xl py-10">
                <Card>
                    <CardContent className="py-10">
                        <div className="flex flex-col items-center justify-center gap-4">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            <p className="text-muted-foreground">
                                Loading station details...
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!stationDetails) {
        return (
            <div className="container max-w-4xl py-10">
                <div className="mb-6">
                    <Button variant="secondary" asChild>
                        <Link href="/" className="flex items-center">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Map
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardContent className="py-10 text-center">
                        <p>
                            Station not found or an error occurred while
                            loading.
                        </p>
                        <Button asChild className="mt-4">
                            <Link href="/">Back to Map</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

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

            <Card className="mb-6">
                <CardHeader>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <AprsIcon
                                symbol={stationDetails.symbol}
                                size={32}
                            />
                            <div>
                                <CardTitle>{stationDetails.callsign}</CardTitle>
                                <CardDescription>
                                    Station Details
                                </CardDescription>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row">
                            <Link href={`/station/${callsign}/map`}>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start sm:w-auto"
                                >
                                    <Map className="mr-2 h-4 w-4" />
                                    Map
                                </Button>
                            </Link>
                            <Link href={`/station/${callsign}/frames`}>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start sm:w-auto"
                                >
                                    <FileText className="mr-2 h-4 w-4" />
                                    RAW Frames
                                </Button>
                            </Link>
                            <Link href={`/messages/${stationDetails.callsign}`}>
                                <Button className="w-full justify-start sm:w-auto">
                                    <MessageSquare className="mr-2 h-4 w-4" />
                                    Send Message
                                </Button>
                            </Link>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="font-medium">Comment:</span>
                                <span>{stationDetails.comment}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">
                                    Last Position:
                                </span>
                                <span>
                                    {stationDetails.lastPacketAt.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Path:</span>
                                <span className="text-right font-mono">
                                    {stationDetails.path}
                                </span>
                            </div>
                        </div>

                        {parsedData?.type === "beacon" &&
                            parsedData.isWX &&
                            parsedData.wxData && (
                                <div className="pt-4 border-t">
                                    <div className="flex justify-between items-center mb-3">
                                        <h3 className="font-medium">
                                            Weather Report
                                        </h3>
                                        <Link
                                            href={`/station/${callsign}/weather`}
                                        >
                                            <Button variant="outline" size="sm">
                                                <LineChart className="mr-2 h-4 w-4" />
                                                History
                                            </Button>
                                        </Link>
                                    </div>
                                    <div className="grid gap-x-4 gap-y-3 md:grid-cols-2">
                                        {Object.entries(parsedData.wxData).map(
                                            ([key, value]) => {
                                                const config =
                                                    weatherLabels[
                                                        key as APRSWXKey
                                                    ];
                                                if (
                                                    !config ||
                                                    value === null ||
                                                    value === undefined
                                                )
                                                    return null;
                                                return (
                                                    <div
                                                        className="flex items-center justify-between"
                                                        key={key}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            {config.icon}
                                                            <span className="font-medium">
                                                                {config.label}:
                                                            </span>
                                                        </div>
                                                        <span>
                                                            {Number(
                                                                value
                                                            ).toFixed(1)}{" "}
                                                            {config.unit}
                                                        </span>
                                                    </div>
                                                );
                                            }
                                        )}
                                    </div>
                                </div>
                            )}

                        {parsedData?.type === "beacon" &&
                            parsedData.isTelemetry &&
                            parsedData.decodedTelemetry && (
                                <div className="pt-4 border-t">
                                    <div className="flex justify-between items-center mb-3">
                                        <h3 className="font-medium">
                                            Telemetry
                                        </h3>
                                        <Link
                                            href={`/station/${callsign}/telemetry`}
                                        >
                                            <Button variant="outline" size="sm">
                                                <LineChart className="mr-2 h-4 w-4" />
                                                History
                                            </Button>
                                        </Link>
                                    </div>
                                    <div className="grid gap-x-4 gap-y-2 md:grid-cols-2">
                                        {Object.entries(
                                            parsedData.decodedTelemetry
                                        ).map(([key, value]) => {
                                            const label =
                                                telemetryLabels[
                                                    key as keyof APRSTelemetry
                                                ];
                                            const displayValue = key.includes(
                                                "Voltage"
                                            )
                                                ? `${Number(value).toFixed(
                                                      1
                                                  )} V`
                                                : value;
                                            return (
                                                <div
                                                    className="flex justify-between"
                                                    key={key}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Zap className="h-4 w-4 text-muted-foreground" />
                                                        <span className="font-medium">
                                                            {label}:
                                                        </span>
                                                    </div>
                                                    <span>{displayValue}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                        <div className="pt-4 border-t">
                            <h3 className="font-medium mb-3">Other SSIDs:</h3>
                            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                {stationDetails.ssids.length > 0 ? (
                                    stationDetails.ssids.map((ssid) => (
                                        <Link
                                            href={`/station/${ssid.callsign}`}
                                            key={ssid.callsign}
                                        >
                                            <div className="flex items-center gap-2 p-2 border rounded-md hover:bg-muted/50 transition-colors">
                                                <AprsIcon
                                                    symbol={ssid.symbol}
                                                    size={32}
                                                />
                                                <span className="font-mono text-blue-600 hover:underline">
                                                    {ssid.callsign}
                                                </span>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <p className="text-muted-foreground">
                                        No other SSIDs found.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </FooterLayout>
    );
}
