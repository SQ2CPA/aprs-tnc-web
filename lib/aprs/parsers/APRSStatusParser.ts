import { APRSPacketType } from "../types";

export default class APRSStatusParser {
    static isValid(body: string) {
        return body.startsWith(APRSPacketType.STATUS);
    }

    static parse(body: string): string {
        return body.slice(1);
    }
}
