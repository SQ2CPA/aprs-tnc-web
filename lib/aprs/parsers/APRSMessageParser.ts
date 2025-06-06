import { APRSPacketType } from "../types";

export default class APRSMessageParser {
    static isValid(body: string) {
        return body.startsWith(APRSPacketType.MESSAGE);
    }

    static parse(body: string) {
        const recipientEndIndex = body.indexOf(":", 1);

        const recipient = body.substring(1, recipientEndIndex).trim();

        let content = body.substring(recipientEndIndex + 1);

        let ack: string | null = null;

        const messageIdRegex = /{([A-Z0-9]+)}?$/;
        const match = content.match(messageIdRegex);

        if (match && match[1]) {
            ack = match[1];

            content = content.substring(0, content.length - match[0].length);
        }

        return {
            recipient,
            content,
            ack,
        };
    }
}
