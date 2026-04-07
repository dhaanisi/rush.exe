import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { username, score, difficulty, maxCombo } = await req.json();

    const player = await prisma.player.upsert({
        where: { username },
        update: {},
        create: { username },
    });

    await prisma.gameScore.create({
        data: {
            score,
            difficulty,
            maxCombo,
            playerId: player.id,
        },
    });

    return NextResponse.json({ success: true });
}