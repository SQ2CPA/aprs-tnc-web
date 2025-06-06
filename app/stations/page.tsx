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
import { ArrowLeft, Eye } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { AprsIcon } from "@/components/AprsIcon";
import FooterLayout from "@/components/layouts/FooterLayout";

interface Station {
    callsign: string;
    symbol: string;
    comment: string;
    lastPacketAt: string;
}

export default function AllStationsPage() {
    const [stations, setStations] = useState<Station[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllStations = async () => {
            try {
                const response = await fetch("/api/stations");
                const data = await response.json();
                setStations(data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching all stations:", error);
                setLoading(false);
            }
        };

        fetchAllStations();
    }, []);

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffSeconds < 60) {
            return `${diffSeconds}s ago`;
        } else if (diffSeconds < 3600) {
            return `${Math.floor(diffSeconds / 60)}m ago`;
        } else if (diffSeconds < 86400) {
            return `${Math.floor(diffSeconds / 3600)}h ago`;
        } else {
            return `${Math.floor(diffSeconds / 86400)}d ago`;
        }
    };

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

            <Card>
                <CardHeader>
                    <CardTitle>All Received Stations</CardTitle>
                    <CardDescription>
                        Complete list of all APRS stations that have been
                        received
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
                                    <TableHead>Comment</TableHead>
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
                                        <TableCell className="max-w-[200px] truncate">
                                            {station.comment}
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
