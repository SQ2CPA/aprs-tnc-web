"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AprsIcon } from "./AprsIcon";
import { formatTimeAgo } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { List } from "lucide-react";

interface RecentStation {
    callsign: string;
    lastPacketAt: string;
    lastSymbol: string;
}

export default function RecentStationsList() {
    const [recentStations, setRecentStations] = useState<RecentStation[]>([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchRecentStations = async () => {
            try {
                const response = await fetch("/api/recent-stations");
                const data = await response.json();
                setRecentStations(data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching recent stations:", error);
                setLoading(false);
            }
        };

        fetchRecentStations();

        const intervalId = setInterval(fetchRecentStations, 5000);

        return () => clearInterval(intervalId);
    }, []);

    const handleStationClick = (callsign: string) => {
        router.push(`/station/${callsign}`);
    };

    const toggleExpanded = () => {
        setExpanded(!expanded);
    };

    return (
        <Card className="w-64 bg-white/90 dark:bg-gray-800/90 dark:text-slate-200 dark:border-gray-700 backdrop-blur shadow-md">
            <CardContent className="p-2">
                <div className="flex justify-between items-center mb-1">
                    <h3 className="font-semibold text-sm dark:text-white">
                        Recent Stations
                    </h3>
                    <div className="flex gap-1">
                        <Link href="/stations">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs px-2 py-1 h-auto"
                            >
                                <List className="h-3 w-3 mr-1" />
                                All
                            </Button>
                        </Link>
                        <button
                            onClick={toggleExpanded}
                            className="text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 px-1"
                        >
                            {expanded ? "Hide" : "Show"}
                        </button>
                    </div>
                </div>

                {expanded && (
                    <div className="max-h-[300px] overflow-y-auto">
                        {loading ? (
                            <p className="text-xs text-center py-2">
                                Loading...
                            </p>
                        ) : recentStations.length > 0 ? (
                            <ul className="space-y-1">
                                {recentStations.map((station) => (
                                    <li
                                        key={station.callsign}
                                        className="flex items-center gap-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer"
                                        onClick={() =>
                                            handleStationClick(station.callsign)
                                        }
                                    >
                                        <AprsIcon
                                            symbol={station.lastSymbol}
                                            size={32}
                                        />
                                        <span className="text-xs font-medium flex-grow">
                                            {station.callsign}
                                        </span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {formatTimeAgo(
                                                station.lastPacketAt
                                            )}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-xs text-center py-2">
                                No recent stations
                            </p>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
