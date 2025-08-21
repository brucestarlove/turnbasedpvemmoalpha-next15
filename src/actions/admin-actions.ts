"use server";

import { getGameRepository } from "@/lib/repositories";

// Get the appropriate repository based on environment
const repository = getGameRepository();

// Admin function to give resources to a player
export async function giveResources(
  userId: string,
  resources: Record<string, number>,
) {
  try {
    const player = await repository.player.findByIdOrThrow(userId);

    const newInventory = { ...player.inventory };

    // Add the specified resources
    for (const [resource, amount] of Object.entries(resources)) {
      newInventory[resource] = (newInventory[resource] || 0) + amount;
    }

    await repository.player.update(userId, { inventory: newInventory });

    // Add log entry
    const resourceList = Object.entries(resources)
      .map(([resource, amount]) => `${amount} ${resource.replace(/_/g, " ")}`)
      .join(", ");

    await repository.gameLog.create({
      playerId: userId,
      message: `🎁 Admin granted: ${resourceList}`,
      type: "system",
    });

    return { success: true, message: `Gave ${resourceList} to player` };
  } catch (error) {
    console.error("Failed to give resources:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to give resources";
    return { success: false, error: errorMessage };
  }
}

// Admin function to give coins to a player
export async function giveCoins(userId: string, amount: number) {
  try {
    const player = await repository.player.findById(userId);

    if (!player) {
      return { success: false, error: "Player not found" };
    }

    const newCoins = (player.coins || 0) + amount;

    await repository.player.update(userId, { coins: newCoins });

    // Add log entry
    await repository.gameLog.create({
      playerId: userId,
      message: `💰 Admin granted: ${amount} coins`,
      type: "system",
    });

    return { success: true, message: `Gave ${amount} coins to player` };
  } catch (error) {
    console.error("Failed to give coins:", error);
    return { success: false, error: "Failed to give coins" };
  }
}

// Admin function to set player stats
export async function setPlayerStats(
  userId: string,
  stats: {
    strength?: number;
    stamina?: number;
    coins?: number;
    reputation?: number;
  },
) {
  try {
    const player = await repository.player.findById(userId);

    if (!player) {
      return { success: false, error: "Player not found" };
    }

    await repository.player.update(userId, stats);

    // Add log entry
    const statsList = Object.entries(stats)
      .map(([stat, value]) => `${stat}: ${value}`)
      .join(", ");

    await repository.gameLog.create({
      playerId: userId,
      message: `⚡ Admin set stats: ${statsList}`,
      type: "system",
    });

    return { success: true, message: `Set player stats: ${statsList}` };
  } catch (error) {
    console.error("Failed to set player stats:", error);
    return { success: false, error: "Failed to set player stats" };
  }
}

// Admin function to advance player skills
export async function giveSkillXP(userId: string, skill: string, xp: number) {
  try {
    const player = await repository.player.findById(userId);

    if (!player) {
      return { success: false, error: "Player not found" };
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

    // Add log entry
    await repository.gameLog.create({
      playerId: userId,
      message: `📚 Admin granted: ${xp} XP in ${skill.replace(/_/g, " ")} (Level ${newSkills[skill].level})`,
      type: "system",
    });

    return {
      success: true,
      message: `Gave ${xp} XP in ${skill}. New level: ${newSkills[skill].level}`,
    };
  } catch (error) {
    console.error("Failed to give skill XP:", error);
    return { success: false, error: "Failed to give skill XP" };
  }
}

// Get all players (for admin use) - placeholder for now
export async function getAllPlayers() {
  try {
    // This would need to be implemented in repository if needed
    // For now, just return a placeholder
    return { success: true, data: [] };
  } catch (error) {
    console.error("Failed to get all players:", error);
    return { success: false, error: "Failed to get all players" };
  }
}
