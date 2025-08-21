import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { ALL_MISSIONS_POOL, COOLDOWN_MS } from "@/lib/game-config";
import { getGameRepository } from "@/lib/repositories";

const repository = getGameRepository();

// POST /api/game/missions - Start a mission
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { missionId, combatSkill } = body;

    if (!missionId) {
      return NextResponse.json(
        { success: false, error: "Mission ID is required" },
        { status: 400 },
      );
    }

    const player = await repository.player.findById(session.user.id);

    if (!player) {
      return NextResponse.json(
        { success: false, error: "Player not found" },
        { status: 404 },
      );
    }

    // Cooldown disabled
    // const now = Date.now();
    // const lastAction = player.lastActionTimestamp?.getTime() || 0;
    // if (now - lastAction < COOLDOWN_MS) {
    //   return NextResponse.json({
    //     success: false,
    //     error: 'Action is still on cooldown'
    //   }, { status: 429 });
    // }

    if (player.currentMission) {
      return NextResponse.json(
        {
          success: false,
          error: "Already on a mission",
        },
        { status: 409 },
      );
    }

    let mission = ALL_MISSIONS_POOL[missionId];
    if (!mission) {
      return NextResponse.json(
        { success: false, error: "Mission not found" },
        { status: 404 },
      );
    }

    // For combat missions, use the selected skill
    if (mission.type === "combat" && combatSkill) {
      mission = { ...mission, skill: combatSkill };
    }

    // Update player with new mission
    await repository.player.updateMission(session.user.id, mission);

    // Add log entry
    await repository.gameLog.create({
      playerId: session.user.id,
      message: `You have started: ${mission.name}.`,
      type: "action",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to start mission:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT /api/game/missions - Complete/resolve current mission
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const player = await repository.player.findById(session.user.id);

    if (!player || !player.currentMission) {
      return NextResponse.json(
        { success: false, error: "No active mission" },
        { status: 400 },
      );
    }

    const mission = player.currentMission;
    let resultsText = "";
    const rewards: Record<string, number> = {};
    let xpGained = 0;
    let isSuccessfulAction = false;

    // Process mission based on type (simplified version for API)
    if (mission.type === "gathering") {
      rewards[mission.resource!] = mission.amount!;
      resultsText = `You successfully gathered ${mission.amount} ${mission.resource?.replace(/_/g, " ")}.`;
      xpGained = 1;
      isSuccessfulAction = true;
    } else if (mission.type === "combat") {
      const playerPower = player.strength;
      const success =
        Math.random() < playerPower / (playerPower + mission.level * 3);

      if (success) {
        const coinsFound = Math.floor(Math.random() * 5) + 1;
        rewards["coins"] = coinsFound;
        resultsText = `You defeated the ${mission.enemy} and found ${coinsFound} coins!`;
        xpGained = 1;
        isSuccessfulAction = true;
      } else {
        resultsText = `You were defeated by the ${mission.enemy} and fled back to town.`;
      }
    }

    // Calculate updates
    const newCoins = (player.coins || 0) + (rewards.coins || 0);
    const newInventory = { ...player.inventory };
    const newSkills = { ...player.skills };

    // Add inventory rewards
    for (const [item, quantity] of Object.entries(rewards)) {
      if (item !== "coins") {
        newInventory[item] = (newInventory[item] || 0) + quantity;
      }
    }

    // Add XP
    if (xpGained > 0 && mission.skill) {
      if (!newSkills[mission.skill]) {
        newSkills[mission.skill] = { level: 1, xp: 0 };
      }
      newSkills[mission.skill].xp += xpGained;

      // Level up logic
      while (
        newSkills[mission.skill].xp >=
        newSkills[mission.skill].level * 10
      ) {
        newSkills[mission.skill].xp -= newSkills[mission.skill].level * 10;
        newSkills[mission.skill].level += 1;
      }
    }

    const newMissionsCompleted = isSuccessfulAction
      ? (player.missionsCompleted || 0) + 1
      : player.missionsCompleted;

    await repository.player.completeMission(session.user.id, {
      coins: newCoins,
      inventory: newInventory,
      skills: newSkills,
      missionsCompleted: newMissionsCompleted,
    });

    // Add log entry
    await repository.gameLog.create({
      playerId: session.user.id,
      message: resultsText,
      type: "action",
    });

    return NextResponse.json({
      success: true,
      data: {
        resultsText,
        rewards,
        xpGained:
          xpGained > 0 ? { skill: mission.skill, amount: xpGained } : null,
      },
    });
  } catch (error) {
    console.error("Failed to resolve mission:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
