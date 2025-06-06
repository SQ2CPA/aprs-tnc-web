import { APRSPacketType } from "../types";

export default class APRSFromISParser {
    static isValid(body: string) {
        return body.startsWith("}");
    }

    static parse(header: string, body: string) {
        const index = body.indexOf(APRSPacketType.THIRD_PARTY);

        const destinationDelimiterPos = header.indexOf(">");

        const sender = header.substr(0, destinationDelimiterPos);

        return {
            via: sender,
            frame: body.slice(index + 1),
        };
    }
}
