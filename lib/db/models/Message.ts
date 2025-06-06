import { CreationOptional, DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config";

export enum MessageStatus {
    RECEIVED,
    RECEIVED_ACK,
    RECEIVED_NO_ACK,
    NOT_CONFIRMED,
    DELIVERED,
    SENDING,
    ABORTED,
    ERROR,
}

export interface MessageAttributes {
    id: number;

    messageId: string | null;
    sender: string;
    content: string;
    status: MessageStatus;
    type: "received" | "sent";

    isUnread: boolean | null;
    isFromIS: boolean | null;
    receivedAt: Date | null;

    retries: number | null;
    lastSendAt: Date | null;

    createdAt?: Date;
    updatedAt?: Date;
}

export interface MessageCreationAttributes
    extends Optional<
        MessageAttributes,
        | "id"
        | "messageId"
        | "sender"
        | "isUnread"
        | "isFromIS"
        | "receivedAt"
        | "retries"
        | "lastSendAt"
        | "createdAt"
        | "updatedAt"
    > {}

export default class Message
    extends Model<MessageAttributes, MessageCreationAttributes>
    implements Omit<MessageAttributes, "id">
{
    public id!: CreationOptional<number>;
    public messageId!: CreationOptional<string | null>;
    public sender!: string;
    public content!: string;
    public status!: MessageStatus;
    public type!: "received" | "sent";

    public isUnread!: CreationOptional<boolean | null>;
    public isFromIS!: CreationOptional<boolean | null>;
    public receivedAt!: CreationOptional<Date | null>;

    public retries!: CreationOptional<number | null>;
    public lastSendAt!: CreationOptional<Date | null>;

    public readonly createdAt!: CreationOptional<Date>;
    public readonly updatedAt!: CreationOptional<Date>;
}

Message.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        messageId: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        sender: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        status: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        type: {
            type: DataTypes.ENUM("received", "sent"),
            allowNull: false,
        },
        isUnread: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
        isFromIS: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
        receivedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        retries: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        lastSendAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        sequelize,
        timestamps: true,
        tableName: "Messages",
        modelName: "Message",
        indexes: [
            { fields: ["type"] },
            { fields: ["status"] },
            { fields: ["createdAt"] },
        ],
    }
);
