import { CreationOptional, DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config";
import { PACKET_CONSOLE_DIRECTIONS } from "@/lib/packet-console";

export interface PacketConsoleEventAttributes {
    id: number;
    direction: (typeof PACKET_CONSOLE_DIRECTIONS)[number];
    rawFrame: string;
    packetId: number | null;
    transmissionId: number | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface PacketConsoleEventCreationAttributes
    extends Optional<
        PacketConsoleEventAttributes,
        "id" | "packetId" | "transmissionId" | "createdAt" | "updatedAt"
    > {}

export default class PacketConsoleEvent
    extends Model<
        PacketConsoleEventAttributes,
        PacketConsoleEventCreationAttributes
    >
    implements PacketConsoleEventAttributes
{
    public id!: CreationOptional<number>;
    public direction!: (typeof PACKET_CONSOLE_DIRECTIONS)[number];
    public rawFrame!: string;
    public packetId!: CreationOptional<number | null>;
    public transmissionId!: CreationOptional<number | null>;

    public readonly createdAt!: CreationOptional<Date>;
    public readonly updatedAt!: CreationOptional<Date>;
}

PacketConsoleEvent.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        direction: {
            type: DataTypes.ENUM(...PACKET_CONSOLE_DIRECTIONS),
            allowNull: false,
        },
        rawFrame: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        packetId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        transmissionId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    },
    {
        sequelize,
        timestamps: true,
        tableName: "PacketConsoleEvents",
        modelName: "PacketConsoleEvent",
        indexes: [
            { fields: ["direction"] },
            { fields: ["createdAt"] },
            { fields: ["packetId"] },
            { fields: ["transmissionId"] },
        ],
    }
);
