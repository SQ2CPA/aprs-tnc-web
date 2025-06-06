"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface SettingsData {
    tncAddress: string;
    messagePath: string;
    maxRetries: string;
    retryInterval: string;
    myCallsign: string;
    ssid: string;
    latitude: string;
    longitude: string;
}

export default function SettingsPage() {
    const [tncAddress, setTncAddress] = useState("");
    const [messagePath, setMessagePath] = useState("");
    const [maxRetries, setMaxRetries] = useState("");
    const [retryInterval, setRetryInterval] = useState("");
    const [myCallsign, setMyCallsign] = useState("");
    const [ssid, setSsid] = useState("");
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");

    const [originalSettings, setOriginalSettings] =
        useState<SettingsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const fetchSettings = async () => {
            setIsLoading(true);
            try {
                const response = await fetch("/api/settings");
                const data = await response.json();

                const initialSettings: SettingsData = {
                    tncAddress: data.tncAddress || "",
                    messagePath: data.messagePath || "WIDE1-1,WIDE2-1",
                    maxRetries: data.maxRetries?.toString() || "3",
                    retryInterval: data.retryInterval?.toString() || "30",
                    myCallsign: data.myCallsign || "",
                    ssid: data.ssid?.toString() || "0",
                    latitude: data.latitude?.toString() || "0",
                    longitude: data.longitude?.toString() || "0",
                };

                setTncAddress(initialSettings.tncAddress);
                setMessagePath(initialSettings.messagePath);
                setMaxRetries(initialSettings.maxRetries);
                setRetryInterval(initialSettings.retryInterval);
                setMyCallsign(initialSettings.myCallsign);
                setSsid(initialSettings.ssid);
                setLatitude(initialSettings.latitude);
                setLongitude(initialSettings.longitude);

                setOriginalSettings(initialSettings);
            } catch (error) {
                console.error("Error fetching settings:", error);
                toast({
                    title: "Error",
                    description: "Failed to fetch settings.",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchSettings();
    }, [toast]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        const settingsToSave = {
            tncAddress,
            messagePath,
            maxRetries: Number.parseInt(maxRetries) || 3,
            retryInterval: Number.parseInt(retryInterval) || 30,
            myCallsign,
            ssid: Number.parseInt(ssid) || 0,
            latitude: parseFloat(latitude) || 0,
            longitude: parseFloat(longitude) || 0,
        };

        try {
            const response = await fetch("/api/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settingsToSave),
            });

            if (response.ok) {
                toast({
                    title: "Settings saved",
                    description:
                        "Your settings have been successfully updated.",
                });
                setOriginalSettings({
                    tncAddress,
                    messagePath,
                    maxRetries,
                    retryInterval,
                    myCallsign,
                    ssid,
                    latitude,
                    longitude,
                });
            } else {
                throw new Error("Failed to save settings");
            }
        } catch (error) {
            console.error("Error saving settings:", error);
            toast({
                title: "Error",
                description: "Failed to save settings. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const hasChanged = originalSettings
        ? tncAddress !== originalSettings.tncAddress ||
          messagePath !== originalSettings.messagePath ||
          maxRetries !== originalSettings.maxRetries ||
          retryInterval !== originalSettings.retryInterval ||
          myCallsign !== originalSettings.myCallsign ||
          ssid !== originalSettings.ssid ||
          latitude !== originalSettings.latitude ||
          longitude !== originalSettings.longitude
        : false;

    if (isLoading) {
        return (
            <div className="container max-w-2xl py-10 flex justify-center items-center text-white">
                <p>Loading settings...</p>
            </div>
        );
    }

    return (
        <div className="container max-w-2xl py-10">
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
                    <CardTitle>Settings</CardTitle>
                    <CardDescription>
                        Manage station and connection settings.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="my-callsign">
                                    Your Callsign
                                </Label>
                                <Input
                                    id="my-callsign"
                                    disabled={isSaving}
                                    placeholder="e.g., N0CALL"
                                    value={myCallsign}
                                    onChange={(e) =>
                                        setMyCallsign(
                                            e.target.value.toUpperCase()
                                        )
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="ssid">SSID</Label>
                                <Input
                                    id="ssid"
                                    type="number"
                                    min="0"
                                    max="15"
                                    disabled={isSaving}
                                    placeholder="e.g., 7"
                                    value={ssid}
                                    onChange={(e) => setSsid(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="latitude">Latitude</Label>
                                <Input
                                    id="latitude"
                                    type="number"
                                    step="any"
                                    disabled={isSaving}
                                    placeholder="e.g., 40.7128"
                                    value={latitude}
                                    onChange={(e) =>
                                        setLatitude(e.target.value)
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="longitude">Longitude</Label>
                                <Input
                                    id="longitude"
                                    type="number"
                                    step="any"
                                    disabled={isSaving}
                                    placeholder="e.g., -74.0060"
                                    value={longitude}
                                    onChange={(e) =>
                                        setLongitude(e.target.value)
                                    }
                                />
                            </div>
                        </div>

                        <hr />

                        <div className="space-y-2">
                            <Label htmlFor="tnc-address">TNC Address</Label>
                            <Input
                                id="tnc-address"
                                disabled={isSaving}
                                placeholder="e.g., 127.0.0.1:8001"
                                value={tncAddress}
                                onChange={(e) => setTncAddress(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="message-path">Message Path</Label>
                            <Input
                                id="message-path"
                                disabled={isSaving}
                                placeholder="e.g., WIDE1-1,WIDE2-1"
                                value={messagePath}
                                onChange={(e) => setMessagePath(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="max-retries">
                                    Maximum Retries
                                </Label>
                                <Input
                                    id="max-retries"
                                    disabled={isSaving}
                                    type="number"
                                    min="1"
                                    max="10"
                                    placeholder="3"
                                    value={maxRetries}
                                    onChange={(e) =>
                                        setMaxRetries(e.target.value)
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="retry-interval">
                                    Retry Interval (seconds)
                                </Label>
                                <Input
                                    id="retry-interval"
                                    disabled={isSaving}
                                    type="number"
                                    min="5"
                                    max="300"
                                    placeholder="30"
                                    value={retryInterval}
                                    onChange={(e) =>
                                        setRetryInterval(e.target.value)
                                    }
                                />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button
                            type="submit"
                            disabled={!hasChanged || isSaving}
                        >
                            {isSaving ? "Saving..." : "Save Settings"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
