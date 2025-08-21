import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { getGameRepository } from "@/lib/repositories";

const repository = getGameRepository();

// POST /api/admin - Admin actions
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    // TODO: Add proper admin authorization check
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { action, userId, ...params } = body;

    if (!action || !userId) {
      return NextResponse.json(
        { success: false, error: "Action and userId are required" },
        { status: 400 },
      );
    }

    switch (action) {
      case "giveResources": {
        const { resources } = params;
        if (!resources || typeof resources !== "object") {
          return NextResponse.json(
            { success: false, error: "Resources object is required" },
            { status: 400 },
          );
        }

        const player = await repository.player.findByIdOrThrow(userId);
        const newInventory = { ...player.inventory };

        // Add the specified resources
        for (const [resource, amount] of Object.entries(resources)) {
          newInventory[resource] =
            (newInventory[resource] || 0) + (amount as number);
        }

        await repository.player.update(userId, { inventory: newInventory });

        // Add log entry
        const resourceList = Object.entries(resources)
          .map(
            ([resource, amount]) => `${amount} ${resource.replace(/_/g, " ")}`,
          )
          .join(", ");

        await repository.gameLog.create({
          playerId: userId,
          message: `🎁 Admin granted: ${resourceList}`,
          type: "system",
        });

        return NextResponse.json({
          success: true,
          message: `Gave ${resourceList} to player`,
        });
      }

      case "giveCoins": {
        const { amount } = params;
        if (!amount || typeof amount !== "number") {
          return NextResponse.json(
            { success: false, error: "Amount (number) is required" },
            { status: 400 },
          );
        }

        const player = await repository.player.findById(userId);
        if (!player) {
          return NextResponse.json(
            { success: false, error: "Player not found" },
            { status: 404 },
          );
        }

        const newCoins = (player.coins || 0) + amount;
        await repository.player.update(userId, { coins: newCoins });

        await repository.gameLog.create({
          playerId: userId,
          message: `💰 Admin granted: ${amount} coins`,
          type: "system",
        });

        return NextResponse.json({
          success: true,
          message: `Gave ${amount} coins to player`,
        });
      }

      case "setStats": {
        const { stats } = params;
        if (!stats || typeof stats !== "object") {
          return NextResponse.json(
            { success: false, error: "Stats object is required" },
            { status: 400 },
          );
        }

        const player = await repository.player.findById(userId);
        if (!player) {
          return NextResponse.json(
            { success: false, error: "Player not found" },
            { status: 404 },
          );
        }

        await repository.player.update(userId, stats);

        const statsList = Object.entries(stats)
          .map(([stat, value]) => `${stat}: ${value}`)
          .join(", ");

        await repository.gameLog.create({
          playerId: userId,
          message: `⚡ Admin set stats: ${statsList}`,
          type: "system",
        });

        return NextResponse.json({
          success: true,
          message: `Set player stats: ${statsList}`,
        });
      }

      case "giveXP": {
        const { skill, xp } = params;
        if (
          !skill ||
          !xp ||
          typeof skill !== "string" ||
          typeof xp !== "number"
        ) {
          return NextResponse.json(
            {
              success: false,
              error: "Skill (string) and xp (number) are required",
            },
            { status: 400 },
          );
        }

        const player = await repository.player.findById(userId);
        if (!player) {
          return NextResponse.json(
            { success: false, error: "Player not found" },
            { status: 404 },
          );
        }

        const newSkills = { ...player.skills };

        if (!newSkills[skill]) {
          newSkills[skill] = { level: 1, xp: 0 };
        }

        newSkills[skill].xp += xp;

        // Handle level ups
        while (newSkills[skill].xp >= newSkills[skill].level * 10) {
          newSkills[skill].xp -= newSkills[skill].level * 10;
          newSkills[skill].level += 1;
        }

        await repository.player.update(userId, { skills: newSkills });

        await repository.gameLog.create({
          playerId: userId,
          message: `📚 Admin granted: ${xp} XP in ${skill.replace(/_/g, " ")} (Level ${newSkills[skill].level})`,
          type: "system",
        });

        return NextResponse.json({
          success: true,
          message: `Gave ${xp} XP in ${skill}. New level: ${newSkills[skill].level}`,
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: "Unknown action" },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error("Admin action failed:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
