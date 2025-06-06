export type APRSFrameTypeName = "message" | "status" | "beacon";

export interface APRSBaseFrame {
    type: APRSFrameTypeName;
    sender: string;
    destination: string;
    paths?: string[];
    isFromIS: boolean;
    via?: string | null;
}

export enum APRSPacketType {
    POSITION_1 = "!",
    POSITION_2 = "=",
    POSITION_3 = "/",
    POSITION_4 = "@",
    MIC_E_1 = "`",
    MIC_E_2 = "'",
    OBJECT = ";",
    MESSAGE = ":",
    THIRD_PARTY = "}",
    STATUS = ">",
}

export interface APRSTelemetry {
    telemetryCounter: number;
    txPackets: number;
    rxPackets: number;
    digiPackets: number;
    internalVoltage: number;
    externalVoltage: number;
}

const aprsWeatherValueNames = [
    "windDir",
    "windGust",
    "temperature",
    "rain1h",
    "rain24h",
    "rainSinceMidnight",
    "humidity",
    "pressure",
    "luminosity",
    "snow",
    "rainRaw",
] as const;

export type APRSWXKey = (typeof aprsWeatherValueNames)[number];

export type APRSWXData = Partial<Record<APRSWXKey, number>>;

export enum APRSPacketLocationType {
    COMPRESSED = "compressed",
    UNCOMPRESSED = "uncompressed",
}

export interface APRSPacketLocation {
    latitude: number;
    longitude: number;
    type: APRSPacketLocationType;
}

export interface APRSMessageFrame extends APRSBaseFrame {
    type: "message";
    recipient: string;
    content: string;
    ack?: string | null;
}

export interface APRSStatusFrame extends APRSBaseFrame {
    type: "status";
    content: string;
}

export interface APRSBeaconFrame extends APRSBaseFrame {
    type: "beacon";
    location: APRSPacketLocation;
    symbol: string;
    overlay: string;
    isWX: boolean;
    isTelemetry: boolean;
    comment: string;
    wxData?: APRSWXData | null;
    telemetryData?: string | null;
    decodedTelemetry?: APRSTelemetry | null;
    messagingEnabled: boolean;
}

export type APRSFrame = APRSMessageFrame | APRSStatusFrame | APRSBeaconFrame;
