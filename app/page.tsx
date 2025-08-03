"use client";

import type React from "react";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock, LayoutGrid, Loader2, Search, Settings } from "lucide-react";
import Link from "next/link";
import TncStatus from "@/components/tnc-status";
import RecentStationsList from "@/components/recent-stations-list";
import { useRouter } from "next/navigation";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import ConversationsButton from "@/components/conversation-button";

const MapComponent = dynamic(() => import("@/components/map-component"), {
    ssr: false,
    loading: () => (
        <div className="h-screen w-full flex items-center justify-center text-white">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
    ),
});

export default function Home() {
    const [callsign, setCallsign] = useState("");
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedHours, setSelectedHours] = useState("24");
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(
                    `/api/stations?hours=${selectedHours}`
                );
                const data = await response.json();
                setStations(data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching APRS data:", error);
                setLoading(false);
            }
        };

        fetchData();

        const intervalId = setInterval(fetchData, 5000);

        return () => clearInterval(intervalId);
    }, [selectedHours]);

    useEffect(() => {
        const clean = async () => {
            try {
                await fetch(`/api/clean`, {
                    method: "POST",
                });
            } catch (error) {
                console.error("Failed to clean:", error);
            }
        };

        clean();
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (callsign.trim()) {
            router.push(`/station/${callsign.trim()}`);
        }
    };

    return (
        <main className="relative h-screen w-full overflow-hidden">
            <MapComponent stations={stations} />

            <div className="absolute top-0 left-0 right-0 z-[1000] p-2 md:p-4 flex flex-col items-center gap-2">
                <form
                    onSubmit={handleSearch}
                    className="flex gap-2 w-full max-w-md order-1 md:absolute md:left-1/2 md:-translate-x-1/2"
                >
                    <Input
                        type="text"
                        placeholder="Enter callsign..."
                        value={callsign}
                        onChange={(e) => setCallsign(e.target.value)}
                        className="bg-white/90 dark:bg-gray-800/90 backdrop-blur dark:text-slate-100 dark:placeholder:text-gray-400"
                    />
                    <Button type="submit">
                        <Search className="h-4 w-4 md:mr-2" />
                        <span className="hidden md:inline">Search</span>
                    </Button>
                </form>

                <div className="w-full flex justify-between items-center order-2">
                    <div className="flex items-center gap-2">
                        <ConversationsButton />

                        <div className="flex items-center gap-2 bg-white/90 dark:bg-gray-800/90 dark:text-white backdrop-blur rounded-md px-3 py-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <Select
                                value={selectedHours}
                                onValueChange={setSelectedHours}
                            >
                                <SelectTrigger className="w-20 border-0 bg-transparent p-0 h-auto">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">1h</SelectItem>
                                    <SelectItem value="2">2h</SelectItem>
                                    <SelectItem value="3">3h</SelectItem>
                                    <SelectItem value="6">6h</SelectItem>
                                    <SelectItem value="12">12h</SelectItem>
                                    <SelectItem value="24">24h</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link href="/menu">
                            <Button
                                variant="outline"
                                size="icon"
                                className="bg-white/90 dark:bg-gray-800/90 backdrop-blur dark:text-white dark:border-gray-600"
                            >
                                <LayoutGrid className="h-4 w-4" />
                                <span className="sr-only">Menu</span>
                            </Button>
                        </Link>

                        <Link href="/settings">
                            <Button
                                variant="outline"
                                size="icon"
                                className="bg-white/90 dark:bg-gray-800/90 backdrop-blur dark:text-white dark:border-gray-600"
                            >
                                <Settings className="h-4 w-4" />
                                <span className="sr-only">Settings</span>
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-16 md:bottom-4 left-4 z-[1001]">
                <RecentStationsList />
            </div>

            <div className="absolute bottom-16 md:bottom-4 right-4 z-[1001]">
                <TncStatus />
            </div>

            <footer className="absolute bottom-2 left-0 right-0 z-[1000] flex flex-col items-center justify-center text-xs text-gray-500">
                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur px-3 py-1 rounded-lg text-center dark:text-white">
                    <p>
                        Copyright &copy; {new Date().getFullYear()} Damian
                        SQ2CPA
                    </p>
                    <p>Made with ❤️ in Poland</p>
                </div>
            </footer>
        </main>
    );
}
