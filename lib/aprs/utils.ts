function toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
}

export function isDirectPacket(packet: string): boolean {
    const header = packet.split(":")[0];

    const pathElements = header.split(",").slice(1);

    const wasRepeated1 = pathElements.some((element) => element.endsWith("*"));
    const wasRepeated2 = pathElements.some((element) =>
        ["WIDE1", "WIDE2"].includes(element)
    );

    return !wasRepeated1 && !wasRepeated2;
}

export function coordsToMaidenhead(
    latitude: number,
    longitude: number,
    precision: 4 | 6 = 6
): string | null {
    if (
        isNaN(latitude) ||
        isNaN(longitude) ||
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
    ) {
        console.error("Nieprawidłowe współrzędne:", { latitude, longitude });
        return null;
    }

    const adjLon = longitude + 180;
    const adjLat = latitude + 90;

    const fieldLonIndex = Math.floor(adjLon / 20);

    const fieldLatIndex = Math.floor(adjLat / 10);

    const charCodeA = "A".charCodeAt(0);
    const fieldChar1 = String.fromCharCode(charCodeA + fieldLonIndex);
    const fieldChar2 = String.fromCharCode(charCodeA + fieldLatIndex);

    const squareLonIndex = Math.floor((adjLon % 20) / 2);

    const squareLatIndex = Math.floor(adjLat % 10);

    const squareChar3 = String(squareLonIndex);
    const squareChar4 = String(squareLatIndex);

    let locator = fieldChar1 + fieldChar2 + squareChar3 + squareChar4;

    if (precision === 6) {
        const subSquareLonRemainder = adjLon % 2;
        const subSquareLonIndex = Math.floor(subSquareLonRemainder / (2 / 24));

        const subSquareLatRemainder = adjLat % 1;
        const subSquareLatIndex = Math.floor(subSquareLatRemainder / (1 / 24));

        const charCodea = "a".charCodeAt(0);
        const subSquareChar5 = String.fromCharCode(
            charCodea + subSquareLonIndex
        );
        const subSquareChar6 = String.fromCharCode(
            charCodea + subSquareLatIndex
        );

        locator += subSquareChar5 + subSquareChar6;
    }

    return locator;
}

export interface APRSCallsign {
    callsign: string;
    ssid: string;
}

export function makeCallsign(callsign: string, ssid: number | null | string) {
    if (!ssid) return callsign;

    return `${callsign}-${ssid}`;
}

export function parseAPRSCallsign(packet: string): APRSCallsign | null {
    const headerMatch = packet.match(/^([A-Z0-9]{3,7})(?:-([0-9]{1,2}))?$/);
    if (headerMatch) {
        const callsign = headerMatch[1];
        const ssid = headerMatch[2] || "";
        return { callsign, ssid };
    }
    return null;
}
