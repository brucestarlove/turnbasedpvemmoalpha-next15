import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { getGameRepository } from "@/lib/repositories";

const repository = getGameRepository();

// GET /api/game - Get complete game state
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const result = await repository.batch.getGameState(session.user.id);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to get game state:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/game - Initialize game for user
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const result = await repository.batch.initializeGame(session.user.id);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to initialize game:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE /api/game - Reset game data (admin/testing)
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Reset player data
    await repository.player.reset(session.user.id);

    // Reset town data
    const town = await repository.town.find();
    if (town) {
      await repository.town.reset(town.id);
    }

    // Clear game logs for this user
    await repository.gameLog.deleteByPlayer(session.user.id);

    // Add welcome log entry
    await repository.gameLog.create({
      playerId: session.user.id,
      message: "Game data reset! Welcome back to Starscape.",
      type: "system",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to reset game:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
