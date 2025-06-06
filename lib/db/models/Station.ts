import { CreationOptional, DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config";
import Packet from "./Packet";

export interface StationAttributes {
    callsign: string;
    lastPacketAt: Date | null;
    lastStatusAt: Date | null;
    comment: string | null;
    lastPositionLatitude: number | null;
    lastPositionLongitude: number | null;
    lastSymbol: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface StationCreationAttributes
    extends Optional<
        StationAttributes,
        | "lastPacketAt"
        | "lastStatusAt"
        | "comment"
        | "lastPositionLatitude"
        | "lastPositionLongitude"
        | "lastSymbol"
        | "createdAt"
        | "updatedAt"
    > {}

export default class Station
    extends Model<StationAttributes, StationCreationAttributes>
    implements StationAttributes
{
    public callsign!: string;
    public lastPacketAt!: CreationOptional<Date | null>;
    public lastStatusAt!: CreationOptional<Date | null>;
    public comment!: CreationOptional<string | null>;
    public lastPositionLatitude!: CreationOptional<number | null>;
    public lastPositionLongitude!: CreationOptional<number | null>;
    public lastSymbol!: CreationOptional<string | null>;

    public readonly createdAt!: CreationOptional<Date>;
    public readonly updatedAt!: CreationOptional<Date>;

    public readonly packets?: Packet[];
}

Station.init(
    {
        callsign: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false,
        },
        lastPacketAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        lastStatusAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        comment: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        lastPositionLatitude: {
            type: DataTypes.DOUBLE,
            allowNull: true,
        },
        lastPositionLongitude: {
            type: DataTypes.DOUBLE,
            allowNull: true,
        },
        lastSymbol: {
            type: DataTypes.CHAR(2),
            allowNull: true,
        },
    },
    {
        sequelize,
        timestamps: true,
        tableName: "Stations",
        modelName: "Station",
    }
);
