import APRSBeaconParser from "./parsers/APRSBeaconParser";
import APRSFromISParser from "./parsers/APRSFromISParser";
import APRSMessageParser from "./parsers/APRSMessageParser";
import APRSStatusParser from "./parsers/APRSStatusParser";
import APRSTelemetryParser from "./parsers/APRSTelemetryParser";
import APRSWeatherParser from "./parsers/APRSWeatherParser";
import { APRSFrame, APRSTelemetry } from "./types";

function parseHeader(header: string) {
    const destinationDelimiterPos = header.indexOf(">");

    const sender = header.substr(0, destinationDelimiterPos);

    const toAndDigiString = header.substr(destinationDelimiterPos + 1);
    const toAndDigiDelimiterPos = toAndDigiString.indexOf(",");

    let destination = "";
    let paths: string[] = [];

    if (toAndDigiDelimiterPos < 0) {
        destination = toAndDigiString;
        paths = [];
    } else {
        destination = toAndDigiString.substr(0, toAndDigiDelimiterPos);
        paths = toAndDigiString.substr(toAndDigiDelimiterPos + 1).split(",");
    }

    return {
        sender,
        paths,
        destination,
    };
}

export default function parseAPRSFrame(frame: string): APRSFrame | null {
    if (!frame.includes(">")) return null;
    if (!frame.includes(":")) return null;

    const headerDelimiterPos = frame.indexOf(":");

    let headerString = frame.substr(0, headerDelimiterPos);
    let bodyString = frame.substr(headerDelimiterPos + 1);

    let isFromIS = false;
    let via: string | null = null;

    if (APRSFromISParser.isValid(bodyString)) {
        const data = APRSFromISParser.parse(headerString, bodyString);

        const headerDelimiterPos = data.frame.indexOf(":");

        headerString = data.frame.substr(0, headerDelimiterPos);
        bodyString = data.frame.substr(headerDelimiterPos + 1);

        isFromIS = true;
        via = data.via;
    }

    const header = parseHeader(headerString);

    if (APRSStatusParser.isValid(bodyString)) {
        const content = APRSStatusParser.parse(bodyString);

        return {
            ...header,
            isFromIS,
            via,
            type: "status",
            content,
        };
    }

    if (APRSMessageParser.isValid(bodyString)) {
        const data = APRSMessageParser.parse(bodyString);

        return {
            ...header,
            isFromIS,
            via,
            type: "message",
            ...data,
        };
    }

    if (APRSBeaconParser.isValid(bodyString)) {
        const beaconData = APRSBeaconParser.parse(bodyString);

        let decodedTelemetry: APRSTelemetry | null = null;
        let telemetryData: string | null = null;

        if (APRSTelemetryParser.isValid(bodyString)) {
            const data = APRSTelemetryParser.extract(
                beaconData.comment,
                header.destination
            );

            decodedTelemetry = data.decodedTelemetry;
            telemetryData = data.telemetry;

            beaconData.comment = APRSTelemetryParser.cleanComment(
                beaconData.comment
            );
        }

        if (
            beaconData.comment.startsWith(".../") ||
            /^\d{3}\//.test(beaconData.comment)
        ) {
            beaconData.comment = beaconData.comment.slice(3);
        }

        const weatherData = APRSWeatherParser.parse(beaconData.comment);

        if (weatherData) {
            beaconData.comment = weatherData.comment;
        }

        beaconData.comment = beaconData.comment.trim();

        return {
            ...header,
            isFromIS,
            via,
            type: "beacon",
            comment: beaconData.comment,
            isTelemetry: !!telemetryData,
            decodedTelemetry,
            telemetryData,
            isWX: !!weatherData,
            wxData: !weatherData ? null : weatherData.weather,
            location: beaconData.location,
            ...beaconData.symbols,
            messagingEnabled: beaconData.messagingEnabled,
        };
    }

    console.log(header);

    return null;
}
