import { sequelize } from "@/lib/db/models";

let schemaSyncPromise: Promise<void> | null = null;

export async function ensureDatabaseSchema() {
    if (!schemaSyncPromise) {
        schemaSyncPromise = sequelize
            .sync()
            .then(() => undefined)
            .catch((error) => {
                schemaSyncPromise = null;
                throw error;
            });
    }

    await schemaSyncPromise;
}
