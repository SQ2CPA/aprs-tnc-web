import { DataTypes, Model } from "sequelize";
import sequelize from "../config";

export interface SettingAttributes {
    key: string;
    value: any;
}

export interface SettingCreationAttributes extends SettingAttributes {}

export default class Setting
    extends Model<SettingAttributes, SettingCreationAttributes>
    implements SettingAttributes
{
    public key!: string;
    public value!: any;

    public readonly createdAt!: undefined;
    public readonly updatedAt!: undefined;
}

Setting.init(
    {
        key: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false,
        },
        value: {
            type: DataTypes.JSON,
            allowNull: false,
        },
    },
    {
        sequelize,
        timestamps: false,
        tableName: "Settings",
        modelName: "Setting",
    }
);
