import { sequelize } from "@/lib/db/models";

async function sync() {
    await sequelize.sync({ force: true });

    console.log(`Done`);

    process.exit();
}

sync();
