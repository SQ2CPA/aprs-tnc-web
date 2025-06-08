"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import L from "leaflet";
import ReactDOMServer from "react-dom/server";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { ArrowLeft, Loader2, MapPin } from "lucide-react";
import { AprsMapIcon } from "@/components/AprsMapIcon";
import { AprsIcon } from "@/components/AprsIcon";
import FooterLayout from "@/components/layouts/FooterLayout";

import "leaflet/dist/leaflet.css";

import { APRSFrame, APRSPacketLocation } from "@/lib/aprs/types";

interface StationData {
    callsign: string;
    symbol: string;
    comment: string;
    lastPacketAt: Date;
    path: string;
    parsedData: APRSFrame & {
        location: APRSPacketLocation;
    };
    pathCoordinates: [number, number][];
    pathPacketsInfo: { lat: number; lng: number; time: Date; path: string }[];
    pathPacketsCount: number;
}

const MapContainer = dynamic(
    () => import("react-leaflet").then((mod) => mod.MapContainer),
    { ssr: false }
);
const TileLayer = dynamic(
    () => import("react-leaflet").then((mod) => mod.TileLayer),
    { ssr: false }
);
const Marker = dynamic(
    () => import("react-leaflet").then((mod) => mod.Marker),
    { ssr: false }
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
    ssr: false,
});
const ZoomControl = dynamic(
    () => import("react-leaflet").then((mod) => mod.ZoomControl),
    { ssr: false }
);
const Polyline = dynamic(
    () => import("react-leaflet").then((mod) => mod.Polyline),
    { ssr: false }
);
const CircleMarker = dynamic(
    () => import("react-leaflet").then((mod) => mod.CircleMarker),
    { ssr: false }
);

const getColorFromCallsign = (callsign: string): string => {
    const colors: string[] = [
        "#FF5733",
        "#3357FF",
        "#33FF57",
        "#FFC300",
        "#C70039",
    ];

    if (!callsign || callsign.length === 0) {
        return colors[0];
    }

    let hash = 0;
    for (let i = 0; i < callsign.length; i++) {
        hash += callsign.charCodeAt(i);
    }

    const index = hash % colors.length;

    return colors[index];
};

const createStationIcon = (callsign: string, aprsSymbol?: string | null) => {
    const iconHtml = ReactDOMServer.renderToString(
        <div className="aprs-marker">
            <AprsMapIcon symbol={aprsSymbol} size={32} />
            <div className="aprs-callsign">{callsign}</div>
        </div>
    );
    return L.divIcon({
        html: iconHtml,
        className: "custom-aprs-marker",
        iconSize: [48, 48 + 14],
        iconAnchor: [24, 48 + 7],
        popupAnchor: [0, -(48 + 7)],
    });
};

export default function StationMapPage() {
    const params = useParams();
    const router = useRouter();
    const callsign = params.callsign as string;

    const [station, setStation] = useState<StationData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStationDetails = async () => {
            if (!callsign) return;
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
                if (data.pathPacketsInfo) {
                    data.pathPacketsInfo.forEach(
                        (p: { time: string | number | Date }) => {
                            p.time = new Date(p.time);
                        }
                    );
                }
                setStation(data);
            } catch (error) {
                console.error("Error fetching station details:", error);
                setStation(null);
            } finally {
                setLoading(false);
            }
        };

        fetchStationDetails();
    }, [callsign]);

    useEffect(() => {
        const style = document.createElement("style");
        style.textContent = `
            .custom-aprs-marker { background: none !important; border: none !important; }
            .aprs-marker { display: flex; flex-direction: column; align-items: center; cursor: pointer; }
            .aprs-marker .aprs-icon-container-reusable { filter: drop-shadow(0 1px 2px rgba(0,0,0,0.5)); transition: transform 0.2s ease; }
            .aprs-marker:hover .aprs-icon-container-reusable { transform: scale(1.1); }
            .aprs-callsign { background: rgba(255, 255, 255, 0.95); border: 1px solid #aaa; border-radius: 3px; padding: 1px 4px; font-size: 10px; font-weight: bold; color: #333; text-align: center; white-space: nowrap; margin-top: 2px; box-shadow: 0 1px 2px rgba(0,0,0,0.2); }
        `;
        document.head.appendChild(style);
        return () => {
            document.head.removeChild(style);
        };
    }, []);

    const stationPosition = useMemo(() => {
        const lat = station?.parsedData?.location?.latitude;
        const lng = station?.parsedData?.location?.longitude;

        if (typeof lat === "number" && typeof lng === "number") {
            return [lat, lng] as [number, number];
        }
        return null;
    }, [station]);

    if (loading) {
        return (
            <div className="container max-w-4xl py-10">
                <Card>
                    <CardContent className="py-10">
                        <div className="flex flex-col items-center justify-center gap-4">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            <p className="text-muted-foreground">
                                Loading station map...
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!station || !stationPosition) {
        return (
            <FooterLayout>
                <div className="mb-6">
                    <Button variant="secondary" asChild>
                        <Link
                            href={`/station/${callsign}`}
                            className="flex items-center"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Details
                        </Link>
                    </Button>
                </div>
                <Card>
                    <CardContent className="py-10 text-center">
                        <p>Station not found or no position data available.</p>
                    </CardContent>
                </Card>
            </FooterLayout>
        );
    }

    const pathColor = getColorFromCallsign(station.callsign);

    return (
        <FooterLayout>
            <div className="mb-6 flex justify-between items-center">
                <Button variant="secondary" asChild>
                    <Link
                        href={`/station/${callsign}`}
                        className="flex items-center"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Details
                    </Link>
                </Button>
            </div>

            <Card className="overflow-hidden">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <MapPin className="h-6 w-6 text-muted-foreground" />
                        <div>
                            <CardTitle>Map for {station.callsign}</CardTitle>
                            <CardDescription>
                                Last position at:{" "}
                                {station.lastPacketAt.toLocaleString()}. Showing{" "}
                                {station.pathPacketsCount} positions from the
                                last 24h.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div style={{ height: "60vh", width: "100%" }}>
                        <MapContainer
                            center={stationPosition}
                            zoom={13}
                            style={{ height: "100%", width: "100%", zIndex: 1 }}
                            zoomControl={false}
                        >
                            <ZoomControl position="bottomleft" />
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />

                            {station.pathCoordinates &&
                                station.pathCoordinates.length > 1 && (
                                    <Polyline
                                        pathOptions={{
                                            color: pathColor,
                                            weight: 3,
                                        }}
                                        positions={station.pathCoordinates}
                                    />
                                )}

                            {station.pathPacketsInfo?.map((packet, index) => (
                                <CircleMarker
                                    key={index}
                                    center={[packet.lat, packet.lng]}
                                    pathOptions={{
                                        color: pathColor,
                                        fillColor: pathColor,
                                        fillOpacity: 0.8,
                                    }}
                                    radius={5}
                                >
                                    <Popup>
                                        <div className="text-sm">
                                            <p className="font-semibold">
                                                {packet.time.toLocaleString()}
                                            </p>
                                            {packet.path && (
                                                <p className="text-xs text-gray-500 font-mono mt-1 break-all">
                                                    via: {packet.path}
                                                </p>
                                            )}
                                        </div>
                                    </Popup>
                                </CircleMarker>
                            ))}

                            <Marker
                                position={stationPosition}
                                icon={createStationIcon(
                                    station.callsign,
                                    station.symbol
                                )}
                            >
                                <Popup minWidth={220}>
                                    <div className="p-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="h-8 w-8 flex-shrink-0">
                                                <AprsIcon
                                                    symbol={station.symbol}
                                                    size={32}
                                                />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-sm">
                                                    {station.callsign}
                                                </h3>
                                                <p className="text-xs text-gray-600">
                                                    {station.lastPacketAt.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                        {station.comment && (
                                            <p className="text-sm mb-1">
                                                {station.comment}
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-500 font-mono mb-2 break-all">
                                            via {station.path}
                                        </p>
                                        <Button
                                            size="sm"
                                            className="w-full"
                                            onClick={() =>
                                                router.push(
                                                    `/station/${callsign}`
                                                )
                                            }
                                        >
                                            View Details
                                        </Button>
                                    </div>
                                </Popup>
                            </Marker>
                        </MapContainer>
                    </div>
                </CardContent>
            </Card>
        </FooterLayout>
    );
}
