"use client";

import { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Eye, Wifi } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AprsIcon } from "@/components/AprsIcon";
import FooterLayout from "@/components/layouts/FooterLayout";

interface DXStation {
    callsign: string;
    symbol: string;
    via: string | null;
    distance: number;
    lastPacketAt: string;
}

export default function DXPage() {
    const [stations, setStations] = useState<DXStation[]>([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState<"24h" | "all">("24h");

    useEffect(() => {
        const fetchDxStations = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/dx?period=${period}`);
                const data = await response.json();
                if (response.ok) {
                    setStations(data);
                } else {
                    console.error("Error fetching DX stations:", data.error);
                }
            } catch (error) {
                console.error("Error fetching DX stations:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDxStations();
    }, [period]);

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffSeconds < 60) return `${diffSeconds}s ago`;
        if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
        if (diffSeconds < 86400)
            return `${Math.floor(diffSeconds / 3600)}h ago`;
        return `${Math.floor(diffSeconds / 86400)}d ago`;
    };

    return (
        <FooterLayout>
            <div className="mb-6 flex justify-between items-center">
                <Button variant="secondary" asChild>
                    <Link href="/" className="flex items-center">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Map
                    </Link>
                </Button>
                <div className="flex gap-2">
                    <Button
                        variant={period === "24h" ? "default" : "secondary"}
                        onClick={() => setPeriod("24h")}
                    >
                        Last 24h
                    </Button>
                    <Button
                        variant={period === "all" ? "default" : "secondary"}
                        onClick={() => setPeriod("all")}
                    >
                        All Time
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Wifi />
                        <CardTitle>DX Cluster</CardTitle>
                    </div>
                    <CardDescription>
                        Record reception ranges of received stations, sorted by
                        distance.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p className="text-center py-4">Loading stations...</p>
                    ) : stations.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Station</TableHead>
                                    <TableHead>Via</TableHead>
                                    <TableHead>Distance</TableHead>
                                    <TableHead>Last Activity</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {stations.map((station) => (
                                    <TableRow key={station.callsign}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <AprsIcon
                                                    symbol={station.symbol}
                                                    size={32}
                                                />
                                                <span className="font-medium">
                                                    {station.callsign}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="max-w-[200px] truncate font-mono text-xs">
                                            {station.via || "N/A"}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {station.distance} km
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {formatTimeAgo(
                                                station.lastPacketAt
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Button size="sm" asChild>
                                                <Link
                                                    href={`/station/${station.callsign}`}
                                                >
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    Details
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <p className="text-center py-4">No stations found.</p>
                    )}
                </CardContent>
            </Card>
        </FooterLayout>
    );
}
