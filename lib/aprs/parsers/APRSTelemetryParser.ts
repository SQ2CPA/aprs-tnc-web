import { APRSTelemetry } from "../types";

function decodeTelemetryBytes(
    char1: string,
    char2: string,
    type: number
): number {
    const byte1 = char1.charCodeAt(0) - 33;
    const byte2 = char2.charCodeAt(0) - 33;

    if (byte1 < 0 || byte1 > 90 || byte2 < 0 || byte2 > 90) {
        throw new Error(
            `Invalid base-91 characters encountered: '${char1}${char2}'`
        );
    }

    const encodedValue = byte1 * 91 + byte2;

    let decodedValue: number;

    switch (type) {
        case 0:
        case 1:
            decodedValue = encodedValue;
            break;
        case 2:
            decodedValue = encodedValue / 100.0;
            break;
        case 3:
            decodedValue = (encodedValue * 2) / 100.0;
            break;
        default:
            console.warn(
                `Unknown telemetry type: ${type}. Assuming no scaling.`
            );
            decodedValue = encodedValue;
            break;
    }

    return decodedValue;
}

function decodeAprsTelemetry(body: string): APRSTelemetry | null {
    const encodedStringR = body.match(/\|(.*?)\|$/);

    if (!encodedStringR) return null;

    const encodedString = encodedStringR[0];

    if (
        !encodedString ||
        !encodedString.startsWith("|") ||
        !encodedString.endsWith("|")
    ) {
        console.error(
            "Telemetry Invalid format: String must start and end with '|'."
        );
        return null;
    }

    const data = encodedString.substring(1, encodedString.length - 1);

    if (data.length !== 12) {
        console.error(
            `Telemetry Invalid format: Data length should be 12, but got ${data.length}.`
        );
        return null;
    }

    try {
        const telemetry: APRSTelemetry = {
            telemetryCounter: decodeTelemetryBytes(data[0], data[1], 0),
            txPackets: decodeTelemetryBytes(data[2], data[3], 1),
            rxPackets: decodeTelemetryBytes(data[4], data[5], 1),
            digiPackets: decodeTelemetryBytes(data[6], data[7], 1),
            internalVoltage: decodeTelemetryBytes(data[8], data[9], 2),
            externalVoltage: decodeTelemetryBytes(data[10], data[11], 3),
        };
        return telemetry;
    } catch (error) {
        if (error instanceof Error) {
            console.error(
                `Telemetry Error decoding telemetry: ${error.message}`
            );
        } else {
            console.error(
                "Telemetry An unknown error occurred during decoding."
            );
        }
        return null;
    }
}

export default class APRSTelemetryParser {
    static isValid(body: string) {
        return /\|(.*?)\|$/.test(body);
    }

    static cleanComment(comment: string): string {
        return comment.slice(0, comment.indexOf("|"));
    }

    static extract(comment: string, destination: string) {
        const decodedTelemetry =
            destination === "APLRFD" ? decodeAprsTelemetry(comment) : null;
        const telemetry = comment.slice(comment.indexOf("|"));

        return {
            telemetry,
            decodedTelemetry,
        };
    }
}
