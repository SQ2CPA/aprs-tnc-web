import {
    APRSPacketLocation,
    APRSPacketLocationType,
    APRSPacketType,
} from "../types";

function isUncompressedLocation(body: string) {
    return /\d{4}\.\d{2}[NS].\d{5}\.\d{2}[EW]./.test(body);
}

function valueFromBase91(data: string) {
    let ret = 0;

    for (let i = 0; i < 4; i++) {
        ret += (data.charCodeAt(i) - 33) * Math.pow(91, 3 - i);
    }

    return ret;
}

function parseLatitudeCompressed(data: string) {
    return 90 - valueFromBase91(data) / 380926;
}

function parseLongitudeCompressed(data: string) {
    return -180 + valueFromBase91(data) / 190463;
}

function parseCompressedSymbols(body: string) {
    const overlay = body[0];
    const symbol = body[9];

    return { symbol, overlay };
}

function parseCompressedCorrdinate(body: string): APRSPacketLocation {
    const lat = body.slice(1, 5);
    const lng = body.slice(5, 9);

    return {
        latitude: parseLatitudeCompressed(lat),
        longitude: parseLongitudeCompressed(lng),
        type: APRSPacketLocationType.COMPRESSED,
    };
}

function parsePositionAndComment(body: string) {
    if (isUncompressedLocation(body)) {
        const location = parseUncompressedCoordinate(body);
        const comment = body.slice(19);

        const symbols = parseUncompressedSymbol(body);

        return {
            symbols,
            location,
            comment,
        };
    } else {
        const location = parseCompressedCorrdinate(body);
        const comment = body.slice(13);

        const symbols = parseCompressedSymbols(body);

        return {
            symbols,
            location,
            comment,
        };
    }
}

function parseUncompressedSymbol(body: string) {
    const symbol = body[18];
    const overlay = body[8];

    return { symbol, overlay };
}

function parseUncompressedCoordinate(body: string): APRSPacketLocation {
    const lat = body.slice(0, 8);
    const lng = body.slice(9, 18);

    const latDirection = lat.slice(-1);
    const latNumbers = lat.slice(0, -1);
    const latDegrees = parseFloat(latNumbers.slice(0, 2));
    const latMinutes = parseFloat(latNumbers.slice(2));
    const latitude = latDegrees + latMinutes / 60;
    const finalLat = latDirection === "N" ? latitude : -latitude;

    const lonDirection = lng.slice(-1);
    const lonNumbers = lng.slice(0, -1);
    const lonDegrees = parseFloat(lonNumbers.slice(0, 3));
    const lonMinutes = parseFloat(lonNumbers.slice(3));
    const longitude = lonDegrees + lonMinutes / 60;
    const finalLon = lonDirection === "E" ? longitude : -longitude;

    return {
        latitude: finalLat,
        longitude: finalLon,
        type: APRSPacketLocationType.UNCOMPRESSED,
    };
}

export default class APRSBeaconParser {
    static isValid(body: string) {
        return [
            APRSPacketType.POSITION_1,
            APRSPacketType.POSITION_2,
            APRSPacketType.POSITION_3,
            APRSPacketType.POSITION_4,
        ].includes(body[0] as APRSPacketType);
    }

    static parse(body: string) {
        const messagingEnabled = body[0] == "=" || body[0] == "@";

        let comment;

        if (
            body[0] == APRSPacketType.POSITION_3 ||
            body[0] == APRSPacketType.POSITION_4
        ) {
            comment = body.substr(8);
        } else {
            comment = body.substr(1);
        }

        return {
            ...parsePositionAndComment(comment),
            messagingEnabled,
        };
    }
}
