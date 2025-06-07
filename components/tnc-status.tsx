"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatTimeAgo } from "@/lib/utils";
import { RadioTower, X } from "lucide-react";

export default function TncStatus() {
    const [isExpanded, setIsExpanded] = useState(false);
    const [status, setStatus] = useState({
        connected: false,
        working: false,
        lastTx: null as string | null,
        lastRx: null as string | null,
    });

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const response = await fetch("/api/tnc-status");
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                const data = await response.json();
                setStatus(data);
            } catch (error) {
                console.error("Error fetching TNC status:", error);
            }
        };

        fetchStatus();
        const intervalId = setInterval(fetchStatus, 5000);

        return () => clearInterval(intervalId);
    }, []);

    const toggleView = () => setIsExpanded(!isExpanded);

    if (!isExpanded) {
        return (
            <button
                onClick={toggleView}
                className="p-2 bg-white/90 dark:bg-gray-800/90 dark:text-slate-200 backdrop-blur shadow-md rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
                <RadioTower className="h-6 w-6" />
            </button>
        );
    }

    return (
        <Card className="w-48 bg-white/90 dark:bg-gray-800/90 dark:text-slate-200 dark:border-gray-700 backdrop-blur shadow-md">
            <div className="flex items-center justify-between p-2">
                <h3 className="font-semibold text-sm dark:text-white">
                    TNC Status
                </h3>
                <button
                    onClick={toggleView}
                    className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                    <X size={16} />
                </button>
            </div>
            <CardContent className="p-2 pt-0 text-xs">
                <div className="grid grid-cols-2 gap-1">
                    <span>Connection:</span>
                    <Badge
                        variant={status.connected ? "success" : "destructive"}
                        className="text-xs py-0 px-1 justify-center"
                    >
                        {status.connected ? "Active" : "Unactive"}
                    </Badge>

                    <span>Connector:</span>
                    <Badge
                        variant={status.working ? "success" : "destructive"}
                        className="text-xs py-0 px-1 justify-center"
                    >
                        {status.working ? "Working" : "Failed"}
                    </Badge>

                    <span>Last TX:</span>
                    <span className="truncate">
                        {formatTimeAgo(status.lastTx)}
                    </span>

                    <span>Last RX:</span>
                    <span className="truncate">
                        {formatTimeAgo(status.lastRx)}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}
