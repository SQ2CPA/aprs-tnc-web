import {
    CreationOptional,
    DataTypes,
    ForeignKey,
    Model,
    Optional,
} from "sequelize";
import sequelize from "../config";
import Station from "./Station";
import { APRSFrame, APRSFrameTypeName, APRSPacketType } from "@/lib/aprs/types";

export interface PacketAttributes {
    id: number;
    callsign: ForeignKey<Station["callsign"]>;
    rawFrame: string;
    path: string | null;
    destination: string | null;
    receivedAt: Date;
    comment: string | null;
    statusText: string | null;
    packetType: APRSPacketType;
    parsedType: APRSFrameTypeName;
    latitude: number | null;
    longitude: number | null;
    symbol: string | null;
    parsedData: object | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface PacketCreationAttributes
    extends Optional<
        PacketAttributes,
        | "id"
        | "path"
        | "destination"
        | "comment"
        | "statusText"
        | "latitude"
        | "longitude"
        | "symbol"
        | "parsedData"
        | "createdAt"
        | "updatedAt"
    > {}

export default class Packet
    extends Model<PacketAttributes, PacketCreationAttributes>
    implements PacketAttributes
{
    public id!: CreationOptional<number>;
    public callsign!: ForeignKey<Station["callsign"]>;
    public rawFrame!: string;
    public path!: CreationOptional<string | null>;
    public destination!: CreationOptional<string | null>;
    public receivedAt!: Date;
    public comment!: CreationOptional<string | null>;
    public statusText!: CreationOptional<string | null>;
    public packetType!: APRSPacketType;
    public parsedType!: APRSFrameTypeName;
    public latitude!: CreationOptional<number | null>;
    public longitude!: CreationOptional<number | null>;
    public symbol!: CreationOptional<string | null>;
    public parsedData!: CreationOptional<APRSFrame | null>;

    public readonly createdAt!: CreationOptional<Date>;
    public readonly updatedAt!: CreationOptional<Date>;

    public readonly station?: Station;
}

Packet.init(
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
        callsign: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        path: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        destination: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        receivedAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        comment: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        statusText: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        packetType: {
            type: DataTypes.ENUM(...Object.values(APRSPacketType)),
            allowNull: false,
        },
        parsedType: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        latitude: {
            type: DataTypes.DOUBLE,
            allowNull: true,
        },
        longitude: {
            type: DataTypes.DOUBLE,
            allowNull: true,
        },
        symbol: {
            type: DataTypes.CHAR(2),
            allowNull: true,
        },
        parsedData: {
            type: DataTypes.JSON,
            allowNull: true,
        },
    },
    {
        sequelize,
        timestamps: true,
        tableName: "Packets",
        modelName: "Packet",
        indexes: [
            { fields: ["callsign"] },
            { fields: ["receivedAt"] },
            { fields: ["packetType"] },
        ],
    }
);

Station.hasMany(Packet, {
    foreignKey: {
        name: "callsign",
        allowNull: false,
    },
    as: "packets",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
});

Packet.belongsTo(Station, {
    foreignKey: {
        name: "callsign",
        allowNull: false,
    },
    as: "station",
});
