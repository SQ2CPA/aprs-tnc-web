import { CreationOptional, DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config";
import { PACKET_CONSOLE_TRANSMISSION_STATUSES } from "@/lib/packet-console";

export interface PacketConsoleTransmissionAttributes {
    id: number;
    rawFrame: string;
    status: (typeof PACKET_CONSOLE_TRANSMISSION_STATUSES)[number];
    errorMessage: string | null;
    processedAt: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface PacketConsoleTransmissionCreationAttributes
    extends Optional<
        PacketConsoleTransmissionAttributes,
        "id" | "errorMessage" | "processedAt" | "createdAt" | "updatedAt"
    > {}

export default class PacketConsoleTransmission
    extends Model<
        PacketConsoleTransmissionAttributes,
        PacketConsoleTransmissionCreationAttributes
    >
    implements PacketConsoleTransmissionAttributes
{
    public id!: CreationOptional<number>;
    public rawFrame!: string;
    public status!: (typeof PACKET_CONSOLE_TRANSMISSION_STATUSES)[number];
    public errorMessage!: CreationOptional<string | null>;
    public processedAt!: CreationOptional<Date | null>;

    public readonly createdAt!: CreationOptional<Date>;
    public readonly updatedAt!: CreationOptional<Date>;
}

PacketConsoleTransmission.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        rawFrame: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM(...PACKET_CONSOLE_TRANSMISSION_STATUSES),
            allowNull: false,
        },
        errorMessage: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        processedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        sequelize,
        timestamps: true,
        tableName: "PacketConsoleTransmissions",
        modelName: "PacketConsoleTransmission",
        indexes: [
            { fields: ["status"] },
            { fields: ["createdAt"] },
            { fields: ["processedAt"] },
        ],
    }
);
