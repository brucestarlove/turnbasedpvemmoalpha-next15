"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import {
  ALL_MISSIONS_POOL,
  COOLDOWN_MS,
  DEFAULT_INVENTORY,
  DEFAULT_SKILLS,
  DEFAULT_TOWN_UPGRADES,
  getCurrentObjective,
  TOWN_OBJECTIVES,
} from "@/lib/game-config";
import { db, gameLogs, players, towns } from "@/lib/schema";

// Initialize player data for new users
export async function initializePlayer(userId: string) {
  try {
    const existingPlayer = await db.query.players.findFirst({
      where: eq(players.id, userId),
    });

    if (!existingPlayer) {
      await db.insert(players).values({
        id: userId,
        strength: 5,
        stamina: 5,
        coins: 10,
        reputation: 0,
        inventory: DEFAULT_INVENTORY,
        skills: DEFAULT_SKILLS,
        missionsCompleted: 0,
        lastActionTimestamp: new Date(0),
        currentMission: null,
      });

      // Add welcome log entry
      await db.insert(gameLogs).values({
        playerId: userId,
        message: "Welcome to Starscape! Your journey begins.",
        type: "system",
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to initialize player:", error);
    return { success: false, error: "Failed to initialize player" };
  }
}

// Initialize town data
export async function initializeTown() {
  try {
    const existingTown = await db.query.towns.findFirst();

    if (!existingTown) {
      await db.insert(towns).values({
        name: "Starscape Village",
        level: 1,
        treasury: {},
        upgrades: DEFAULT_TOWN_UPGRADES,
        unlockedMissions: [],
        completedObjectives: [],
        slayCounts: {},
        unlockedTerritories: ["t1"],
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to initialize town:", error);
    return { success: false, error: "Failed to initialize town" };
  }
}

// Get player data
export async function getPlayerData(userId: string) {
  try {
    const player = await db.query.players.findFirst({
      where: eq(players.id, userId),
    });

    if (!player) {
      return { success: false, error: "Player not found" };
    }

    return { success: true, data: player };
  } catch (error) {
    console.error("Failed to get player data:", error);
    return { success: false, error: "Failed to get player data" };
  }
}

// Get town data
export async function getTownData() {
  try {
    const town = await db.query.towns.findFirst();

    if (!town) {
      return { success: false, error: "Town not found" };
    }

    return { success: true, data: town };
  } catch (error) {
    console.error("Failed to get town data:", error);
    return { success: false, error: "Failed to get town data" };
  }
}

// Start a mission
export async function startMission(userId: string, missionId: string) {
  try {
    const player = await db.query.players.findFirst({
      where: eq(players.id, userId),
    });

    if (!player) {
      return { success: false, error: "Player not found" };
    }

    const now = Date.now();
    const lastAction = player.lastActionTimestamp?.getTime() || 0;

    if (now - lastAction < COOLDOWN_MS) {
      return { success: false, error: "Action is still on cooldown" };
    }

    if (player.currentMission) {
      return { success: false, error: "Already on a mission" };
    }

    const mission = ALL_MISSIONS_POOL[missionId];
    if (!mission) {
      return { success: false, error: "Mission not found" };
    }

    // Update player with new mission
    await db
      .update(players)
      .set({
        lastActionTimestamp: new Date(now),
        currentMission: mission,
      })
      .where(eq(players.id, userId));

    // Add log entry
    await db.insert(gameLogs).values({
      playerId: userId,
      message: `You have started: ${mission.name}.`,
      type: "action",
    });

    revalidatePath("/game");
    return { success: true };
  } catch (error) {
    console.error("Failed to start mission:", error);
    return { success: false, error: "Failed to start mission" };
  }
}

// Resolve a mission (called when cooldown expires)
export async function resolveMission(userId: string) {
  try {
    const player = await db.query.players.findFirst({
      where: eq(players.id, userId),
    });

    if (!player || !player.currentMission) {
      return { success: false, error: "No active mission" };
    }

    const mission = player.currentMission;
    let resultsText = "";
    let rewards: Record<string, number> = {};
    let xpGained = 0;
    let isSuccessfulAction = false;

    // Process mission based on type
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
        // Update slay count - we'll handle this separately later
        isSuccessfulAction = true;
      } else {
        resultsText = `You were defeated by the ${mission.enemy} and fled back to town.`;
      }
    } else if (mission.type === "crafting") {
      const currentInventory = player.inventory;
      let canCraft = true;

      for (const [item, amount] of Object.entries(mission.cost || {})) {
        if ((currentInventory[item] || 0) < amount) {
          canCraft = false;
          break;
        }
      }

      if (canCraft) {
        // Remove crafting costs
        for (const [item, amount] of Object.entries(mission.cost || {})) {
          currentInventory[item] = (currentInventory[item] || 0) - amount;
        }
        rewards = mission.result || {};
        resultsText = `You successfully crafted a ${mission.name}.`;
        xpGained = 5;
        isSuccessfulAction = true;
      } else {
        resultsText = `You don't have the resources to craft a ${mission.name}.`;
      }
    }

    // Update player data by reading current values and incrementing
    const currentPlayer = await db.query.players.findFirst({
      where: eq(players.id, userId),
    });

    if (!currentPlayer) {
      throw new Error("Player not found");
    }

    const newCoins = (currentPlayer.coins || 0) + (rewards.coins || 0);
    const newInventory = { ...currentPlayer.inventory };
    const newSkills = { ...currentPlayer.skills };

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
        newSkills[mission.skill].level * 100
      ) {
        newSkills[mission.skill].xp -= newSkills[mission.skill].level * 100;
        newSkills[mission.skill].level += 1;
      }
    }

    const newMissionsCompleted = isSuccessfulAction
      ? (currentPlayer.missionsCompleted || 0) + 1
      : currentPlayer.missionsCompleted;

    await db
      .update(players)
      .set({
        currentMission: null,
        coins: newCoins,
        inventory: newInventory,
        skills: newSkills,
        missionsCompleted: newMissionsCompleted,
      })
      .where(eq(players.id, userId));

    // Update town slay counts if this was a combat mission
    if (isSuccessfulAction && mission.type === "combat" && mission.enemy) {
      const town = await db.query.towns.findFirst();
      if (town) {
        const newSlayCounts = { ...town.slayCounts };
        newSlayCounts[mission.enemy] = (newSlayCounts[mission.enemy] || 0) + 1;

        await db
          .update(towns)
          .set({ slayCounts: newSlayCounts })
          .where(eq(towns.id, town.id));
      }
    }

    // Add log entry
    await db.insert(gameLogs).values({
      playerId: userId,
      message: resultsText,
      type: "action",
    });

    // Check if any objectives are now complete
    await checkAndCompleteObjectives();

    revalidatePath("/game");
    return {
      success: true,
      resultsText,
      rewards,
      xpGained:
        xpGained > 0 ? { skill: mission.skill, amount: xpGained } : null,
    };
  } catch (error) {
    console.error("Failed to resolve mission:", error);
    return { success: false, error: "Failed to resolve mission" };
  }
}

// Contribute resources to town
export async function contributeToTown(
  userId: string,
  resourceName: string,
  amount: number,
) {
  try {
    const player = await db.query.players.findFirst({
      where: eq(players.id, userId),
    });

    if (!player) {
      return { success: false, error: "Player not found" };
    }

    const currentInventory = player.inventory;
    if ((currentInventory[resourceName] || 0) < amount) {
      return {
        success: false,
        error: `Not enough ${resourceName} to contribute.`,
      };
    }

    const repGain = amount;

    // Update player inventory and stats
    const newInventory = { ...currentInventory };
    newInventory[resourceName] = (newInventory[resourceName] || 0) - amount;

    await db
      .update(players)
      .set({
        inventory: newInventory,
        coins: (player.coins || 0) + amount,
        reputation: (player.reputation || 0) + repGain,
      })
      .where(eq(players.id, userId));

    // Update town treasury
    const town = await db.query.towns.findFirst();
    if (town) {
      const newTreasury = { ...town.treasury };
      newTreasury[resourceName] = (newTreasury[resourceName] || 0) + amount;

      await db
        .update(towns)
        .set({
          treasury: newTreasury,
        })
        .where(eq(towns.id, town.id));
    }

    // Add log entry
    await db.insert(gameLogs).values({
      playerId: userId,
      message: `You contributed ${amount} ${resourceName}, receiving ${amount} coins and ${repGain} reputation.`,
      type: "action",
    });

    // Check if any objectives are now complete
    await checkAndCompleteObjectives();

    revalidatePath("/game");
    return { success: true };
  } catch (error) {
    console.error("Failed to contribute to town:", error);
    return { success: false, error: "Failed to contribute to town" };
  }
}

// Get game logs for a player
export async function getGameLogs(userId: string, limit = 30) {
  try {
    const logs = await db.query.gameLogs.findMany({
      where: eq(gameLogs.playerId, userId),
      orderBy: (gameLogs, { desc }) => [desc(gameLogs.timestamp)],
      limit,
    });

    return { success: true, data: logs };
  } catch (error) {
    console.error("Failed to get game logs:", error);
    return { success: false, error: "Failed to get game logs" };
  }
}

// Reset player and town data (temporary for testing)
export async function resetGameData(userId: string) {
  try {
    // Reset player data
    await db
      .update(players)
      .set({
        strength: 5,
        stamina: 5,
        coins: 10,
        reputation: 0,
        inventory: DEFAULT_INVENTORY,
        skills: DEFAULT_SKILLS,
        missionsCompleted: 0,
        lastActionTimestamp: new Date(0),
        currentMission: null,
      })
      .where(eq(players.id, userId));

    // Reset town data
    const town = await db.query.towns.findFirst();
    if (town) {
      await db
        .update(towns)
        .set({
          name: "Starscape Village",
          level: 1,
          treasury: {},
          upgrades: DEFAULT_TOWN_UPGRADES,
          unlockedMissions: [],
          completedObjectives: [],
          slayCounts: {},
          unlockedTerritories: ["t1"],
        })
        .where(eq(towns.id, town.id));
    }

    // Clear game logs for this user
    await db.delete(gameLogs).where(eq(gameLogs.playerId, userId));

    // Add welcome log entry
    await db.insert(gameLogs).values({
      playerId: userId,
      message: "Game data reset! Welcome back to Starscape.",
      type: "system",
    });

    revalidatePath("/game");
    return { success: true };
  } catch (error) {
    console.error("Failed to reset game data:", error);
    return { success: false, error: "Failed to reset game data" };
  }
}

// Check and complete town objectives
export async function checkAndCompleteObjectives() {
  try {
    const town = await db.query.towns.findFirst();
    if (!town) {
      return { success: false, error: "Town not found" };
    }

    const completedObjectives = town.completedObjectives || [];
    const currentObjective = getCurrentObjective(completedObjectives);

    if (!currentObjective) {
      return { success: true, message: "No active objectives" };
    }

    let isObjectiveMet = false;

    if (currentObjective.type === "contribution") {
      // Check if all required resources are in treasury
      isObjectiveMet = Object.entries(currentObjective.requirements).every(
        ([resource, amount]) => (town.treasury?.[resource] || 0) >= amount,
      );
    } else if (currentObjective.type === "slay") {
      // Check if all required enemies have been slain
      isObjectiveMet = Object.entries(currentObjective.requirements).every(
        ([enemy, count]) => (town.slayCounts?.[enemy] || 0) >= count,
      );
    }

    if (isObjectiveMet) {
      // Complete the objective
      const newCompletedObjectives = [
        ...completedObjectives,
        currentObjective.id,
      ];
      const updates: any = {
        completedObjectives: newCompletedObjectives,
      };

      // Apply unlocks
      if (currentObjective.unlocks.upgrades) {
        currentObjective.unlocks.upgrades.forEach((upgrade) => {
          updates[`upgrades.${upgrade}`] = true;
        });
      }

      if (currentObjective.unlocks.missions) {
        const currentUnlockedMissions = town.unlockedMissions || [];
        const newUnlockedMissions = [
          ...currentUnlockedMissions,
          ...currentObjective.unlocks.missions.filter(
            (mission) => !currentUnlockedMissions.includes(mission),
          ),
        ];
        updates.unlockedMissions = newUnlockedMissions;
      }

      await db.update(towns).set(updates).where(eq(towns.id, town.id));

      // Add log entries about the completion
      const systemLogs = [
        {
          playerId: "system",
          message: `🎉 Town Objective Complete: ${currentObjective.name}!`,
          type: "system",
        },
      ];

      if (currentObjective.unlocks.upgrades) {
        currentObjective.unlocks.upgrades.forEach((upgrade) => {
          systemLogs.push({
            playerId: "system",
            message: `🔓 Unlocked: ${upgrade.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}`,
            type: "system",
          });
        });
      }

      // Insert all log entries
      await db.insert(gameLogs).values(systemLogs);

      revalidatePath("/game");
      return {
        success: true,
        completed: true,
        objective: currentObjective.name,
        unlocks: currentObjective.unlocks,
      };
    }

    return { success: true, completed: false };
  } catch (error) {
    console.error("Failed to check objectives:", error);
    return { success: false, error: "Failed to check objectives" };
  }
}
