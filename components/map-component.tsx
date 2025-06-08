"use client";

import { useEffect, useState, useRef } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    ZoomControl,
    Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useRouter } from "next/navigation";
import L from "leaflet";
import ReactDOMServer from "react-dom/server";
import { AprsMapIcon } from "./AprsMapIcon";
import { AprsIcon } from "./AprsIcon";
import { Loader2 } from "lucide-react";

interface Station {
    callsign: string;
    lat: number;
    lng: number;
    comment?: string;
    symbol?: string;
    lastStatus?: string;
    path: string;
    lastPosition?: string;
    lastPacketAt: Date;
    pathCoordinates: [number, number][];
}

interface MapComponentProps {
    stations: Station[];
}

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

export default function MapComponent({ stations = [] }: MapComponentProps) {
    const router = useRouter();
    const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const mapRef = useRef(null);

    useEffect(() => {
        const fetchSettingsAndSetCenter = async () => {
            try {
                const response = await fetch("/api/settings");
                if (!response.ok) {
                    throw new Error("Settings fetch failed");
                }
                const data = await response.json();

                if (data.latitude && data.longitude) {
                    const lat = parseFloat(data.latitude);
                    const lng = parseFloat(data.longitude);

                    if (!isNaN(lat) && !isNaN(lng)) {
                        setMapCenter([lat, lng]);
                    } else {
                        setMapCenter([52.2297, 21.0122]);
                    }
                }
            } catch (error) {
                setMapCenter([52.2297, 21.0122]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSettingsAndSetCenter();
    }, []);

    const createStationIcon = (
        callsign: string,
        aprsSymbol?: string | null
    ) => {
        const iconHtml = ReactDOMServer.renderToString(
            <>
                <div className="aprs-marker">
                    <AprsMapIcon symbol={aprsSymbol} size={32} />
                    <div className="aprs-callsign">{callsign}</div>
                </div>
            </>
        );

        return L.divIcon({
            html: iconHtml,
            className: "custom-aprs-marker",
            iconSize: [48, 48 + 14],
            iconAnchor: [48 / 2, 48 + 7],
            popupAnchor: [0, -(48 + 7)],
        });
    };

    useEffect(() => {
        const style = document.createElement("style");
        style.textContent = `
            .custom-aprs-marker { background: none !important; border: none !important; }
            .aprs-marker { display: flex; flex-direction: column; align-items: center; cursor: pointer; }
            .aprs-marker .aprs-icon-container-reusable { filter: drop-shadow(0 1px 2px rgba(0,0,0,0.5)); transition: transform 0.2s ease; }
            .aprs-marker:hover .aprs-icon-container-reusable { transform: scale(1.1); }
            .aprs-callsign { background: rgba(255, 255, 255, 0.95); border: 1px solid #aaa; border-radius: 3px; padding: 1px 4px; font-size: 10px; font-weight: bold; color: #333; text-align: center; white-space: nowrap; margin-top: 2px; box-shadow: 0 1px 2px rgba(0,0,0,0.2); }
            .aprs-text-overlay-inner { position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-family: Arial, sans-serif; font-size: 20px; font-weight: bold; color: white; text-shadow: 0 0 2px white, 0 0 2px white, 0 0 2px white; pointer-events: none; }
        `;
        document.head.appendChild(style);
        return () => {
            document.head.removeChild(style);
        };
    }, []);

    useEffect(() => {
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl:
                "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
            iconUrl:
                "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
            shadowUrl:
                "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
        });

        if (mapRef.current) {
            setTimeout(() => {
                (mapRef.current as any)?.invalidateSize();
            }, 100);
        }
    }, [mapRef]);

    const handleInfoClick = (callsign: string) => {
        router.push(`/station/${callsign}`);
    };

    const handleMapClick = (callsign: string) => {
        router.push(`/station/${callsign}/map`);
    };

    const handleMessageClick = (callsign: string) => {
        router.push(`/messages/${callsign}`);
    };

    if (isLoading) {
        return (
            <div className="h-screen w-full flex items-center justify-center text-white">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
        );
    }

    return (
        <MapContainer
            center={mapCenter || [52.2297, 21.0122]}
            zoom={10}
            style={{ height: "100%", width: "100%", zIndex: 1 }}
            attributionControl={true}
            zoomControl={false}
            ref={mapRef}
        >
            <ZoomControl position="bottomleft" />
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {stations.map((station) => (
                <Polyline
                    pathOptions={{
                        color: getColorFromCallsign(station.callsign),
                        weight: 3,
                    }}
                    positions={station.pathCoordinates}
                />
            ))}

            {stations.map((station) => (
                <Marker
                    key={station.callsign}
                    position={[station.lat, station.lng]}
                    icon={createStationIcon(station.callsign, station.symbol)}
                >
                    <Popup
                        className="custom-popup"
                        maxWidth={240}
                        minWidth={220}
                    >
                        <div className="p-2">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="h-8 w-8 flex items-center justify-center overflow-hidden">
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
                            <p className="text-xs text-gray-500 font-mono mb-2">
                                via {station.path}
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() =>
                                        handleInfoClick(station.callsign)
                                    }
                                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium transition-colors"
                                >
                                    Info
                                </button>
                                <button
                                    onClick={() =>
                                        handleMapClick(station.callsign)
                                    }
                                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-xs font-medium transition-colors"
                                >
                                    Map
                                </button>
                                <button
                                    onClick={() =>
                                        handleMessageClick(station.callsign)
                                    }
                                    className="flex-1 bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs font-medium transition-colors"
                                >
                                    Message
                                </button>
                            </div>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}
