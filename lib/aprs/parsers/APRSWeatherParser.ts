import { APRSWXData, APRSWXKey } from "@/lib/aprs/types";

const rainMultiplier = 0.254;

const weatherParsingMap: {
    [key: string]: {
        valueName: APRSWXKey;
        valueConversionFunction: (x: string) => number;
        valueLength: number;
    };
} = {
    "/": {
        valueName: "windDir",
        valueConversionFunction: (x: string) => {
            return Number(x);
        },
        valueLength: 3,
    },
    g: {
        valueName: "windGust",
        valueConversionFunction: (x: string) => {
            return Number(x) * 0.447;
        },
        valueLength: 3,
    },
    t: {
        valueName: "temperature",
        valueConversionFunction: (x: string) => {
            return (Number(x) - 32) / 1.8;
        },
        valueLength: 3,
    },
    r: {
        valueName: "rain1h",
        valueConversionFunction: (x: string) => {
            return Number(x) * rainMultiplier;
        },
        valueLength: 3,
    },
    p: {
        valueName: "rain24h",
        valueConversionFunction: (x: string) => {
            return Number(x) * rainMultiplier;
        },
        valueLength: 3,
    },
    P: {
        valueName: "rainSinceMidnight",
        valueConversionFunction: (x: string) => {
            return Number(x) * rainMultiplier;
        },
        valueLength: 3,
    },
    h: {
        valueName: "humidity",
        valueConversionFunction: (x: string) => {
            return Number(x);
        },
        valueLength: 2,
    },
    b: {
        valueName: "pressure",
        valueConversionFunction: (x: string) => {
            return Number(x) / 10;
        },
        valueLength: 5,
    },
    l: {
        valueName: "luminosity",
        valueConversionFunction: (x: string) => {
            return Number(x) + 1000;
        },
        valueLength: 3,
    },
    L: {
        valueName: "luminosity",
        valueConversionFunction: (x: string) => {
            return Number(x);
        },
        valueLength: 3,
    },
    s: {
        valueName: "snow",
        valueConversionFunction: (x: string) => {
            return Number(x) * 2.54;
        },
        valueLength: 3,
    },
    "#": {
        valueName: "rainRaw",
        valueConversionFunction: (x: string) => {
            return Number(x);
        },
        valueLength: 3,
    },
};

function isUnknownWeatherValue(rawValue: string) {
    return (
        rawValue == " ".repeat(rawValue.length) ||
        rawValue == ".".repeat(rawValue.length)
    );
}

export default class APRSWeatherParser {
    static parse(comment: string) {
        let commentCurentPosition = 0;
        const weather: APRSWXData = {};

        while (true) {
            const parsedWeatherSymbol =
                weatherParsingMap[comment[commentCurentPosition]];

            if (!parsedWeatherSymbol) {
                break;
            }

            const rawSymbolValue = comment.substr(
                commentCurentPosition + 1,
                parsedWeatherSymbol.valueLength
            );

            const symbolValue =
                parsedWeatherSymbol.valueConversionFunction(rawSymbolValue);
            if (!isNaN(symbolValue)) {
                weather[parsedWeatherSymbol.valueName] = symbolValue;
            } else {
                if (!isUnknownWeatherValue(rawSymbolValue)) {
                    break;
                }
            }

            commentCurentPosition += 1 + parsedWeatherSymbol.valueLength;
        }

        if (commentCurentPosition > 0) {
            comment = comment.substr(commentCurentPosition);

            return {
                weather,
                comment,
            };
        }

        return null;
    }
}
