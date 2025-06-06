import { Sequelize } from "sequelize";
import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize({
    dialect: "mysql",
    dialectModule: mysql,
    host: process.env.MYSQL_HOST,
    username: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_DB,
    dialectOptions: {
        charset: "utf8mb4",
    },
    define: {
        charset: "utf8mb4",
        collate: "utf8mb4_unicode_ci",
    },
    logging: false,
});

export default sequelize;
