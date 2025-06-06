import sequelize from "@/lib/db/config";
import { Setting } from "@/lib/db/models";
import { NextResponse } from "next/server";

const defaultSettings = {
    tncAddress: "127.0.0.1:8001",
    messagePath: "WIDE1-1,WIDE2-1",
    maxRetries: 3,
    retryInterval: 30,
    myCallsign: "N0CALL",
};

const allowedSettingKeys = [
    "tncAddress",
    "messagePath",
    "maxRetries",
    "retryInterval",
    "myCallsign",
    "ssid",
    "latitude",
    "longitude",
];

export async function GET() {
    try {
        const settingsFromDb = await Setting.findAll({
            where: { key: allowedSettingKeys },
        });

        const settings = settingsFromDb.reduce((acc, setting) => {
            acc[setting.key] = setting.value;
            return acc;
        }, {} as Record<string, any>);

        const finalSettings = { ...defaultSettings, ...settings };
        return NextResponse.json(finalSettings);
    } catch (error) {
        console.error("Error fetching settings:", error);
        return NextResponse.json(
            { error: "Failed to fetch settings from the database." },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        await sequelize.sync();
        const data = await request.json();

        const settingPromises = Object.entries(data)
            .filter(([key]) => allowedSettingKeys.includes(key))
            .map(([key, value]) => {
                return Setting.upsert({ key, value });
            });

        if (settingPromises.length === 0) {
            return NextResponse.json(
                { success: false, message: "No valid settings to save." },
                { status: 400 }
            );
        }

        await Promise.all(settingPromises);

        const savedSettings = Object.fromEntries(
            Object.entries(data).filter(([key]) =>
                allowedSettingKeys.includes(key)
            )
        );

        return NextResponse.json({ success: true, settings: savedSettings });
    } catch (error) {
        console.error("Error saving settings:", error);
        return NextResponse.json(
            { error: "Failed to save settings in the database." },
            { status: 500 }
        );
    }
}
