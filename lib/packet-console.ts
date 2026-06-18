export const PACKET_CONSOLE_HISTORY_LIMIT = 20;
export const PACKET_CONSOLE_INITIAL_RX_LIMIT = 5;
export const PACKET_CONSOLE_EVENT_ROOM_WHEN_BOOTSTRAPPING = 15;
export const PACKET_CONSOLE_POLL_INTERVAL_MS = 1000;
export const PACKET_CONSOLE_TRANSMISSION_WAIT_TIMEOUT_MS = 3000;
export const PACKET_CONSOLE_TRANSMISSION_WAIT_INTERVAL_MS = 250;

export const PACKET_CONSOLE_DIRECTIONS = ["RX", "TX"] as const;
export type PacketConsoleDirection =
    (typeof PACKET_CONSOLE_DIRECTIONS)[number];

export const PACKET_CONSOLE_TRANSMISSION_STATUSES = [
    "pending",
    "sent",
    "failed",
] as const;
export type PacketConsoleTransmissionStatus =
    (typeof PACKET_CONSOLE_TRANSMISSION_STATUSES)[number];

export interface PacketConsoleLine {
    id: string;
    timestamp: string;
    direction: PacketConsoleDirection;
    raw: string;
}
