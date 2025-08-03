import { Packet } from "@/lib/db/models";
import { NextResponse } from "next/server";
import { Op } from "sequelize";

export async function POST() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    await Packet.destroy({
        where: {
            createdAt: {
                [Op.lt]: thirtyDaysAgo,
            },
        },
    });

    return NextResponse.json({});
}
