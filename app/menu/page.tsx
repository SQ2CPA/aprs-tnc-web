"use client";

import type React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, BarChartBig, Globe } from "lucide-react";

export default function MenuPage() {
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
                    <CardTitle>Menu</CardTitle>
                    <CardDescription>
                        Choose one of the available options to see detailed
                        statistics and information.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                    <div className="flex flex-col space-y-4">
                        <Button
                            variant="outline"
                            size="lg"
                            className="w-full justify-start p-6"
                            asChild
                        >
                            <Link
                                href="/stats/all-frames"
                                className="flex items-center text-base"
                            >
                                <BarChartBig className="mr-4 h-5 w-5 text-muted-foreground" />
                                All Packets Statistics
                            </Link>
                        </Button>

                        <Button
                            variant="outline"
                            size="lg"
                            className="w-full justify-start p-6"
                            asChild
                        >
                            <Link
                                href="/stats/dx"
                                className="flex items-center text-base"
                            >
                                <Globe className="mr-4 h-5 w-5 text-muted-foreground" />
                                DX Statistics
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
