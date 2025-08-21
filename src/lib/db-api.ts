// Database API - Clean interface for all game database operations
import { CACHE_KEYS, gameCache } from "./cache";
import { dbWrapper } from "./db-wrapper";
import {
  DEFAULT_INVENTORY,
  DEFAULT_SKILLS,
  DEFAULT_TOWN_UPGRADES,
} from "./game-config";
import type { ApiResponse, GameLog, GameState, Player, Town } from "./types";

// Custom error classes
class DatabaseError extends Error {
  constructor(
    message: string,
    public cause?: unknown,
  ) {
    super(message);
    this.name = "DatabaseError";
  }
}

class NotFoundError extends DatabaseError {
  constructor(resource: string, id: string) {
    super(`${resource} with id '${id}' not found`);
    this.name = "NotFoundError";
  }
}

// Player operations
export const playerApi = {
  async findById(userId: string): Promise<Player | null> {
    try {
      // Check cache first
      const cached = gameCache.get<Player>(CACHE_KEYS.PLAYER(userId));
      if (cached) {
        return cached;
      }

      const player = await dbWrapper.players.findFirst({ id: userId });

      // Cache the result for 30 seconds
      if (player) {
        gameCache.set(CACHE_KEYS.PLAYER(userId), player, 30000);
      }

      return player;
    } catch (error) {
      throw new DatabaseError(`Failed to find player ${userId}`, error);
    }
  },

  async findByIdOrThrow(userId: string): Promise<Player> {
    const player = await this.findById(userId);
    if (!player) {
      throw new NotFoundError("Player", userId);
    }
    return player;
  },

  async create(userId: string): Promise<Player> {
    try {
      return await dbWrapper.players.insert({
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
    } catch (error) {
      throw new DatabaseError(`Failed to create player ${userId}`, error);
    }
  },

  async update(userId: string, data: Partial<Player>): Promise<Player | null> {
    try {
      const result = await dbWrapper.players.update({ id: userId }, data);

      // Invalidate cache on update
      gameCache.delete(CACHE_KEYS.PLAYER(userId));

      // Cache the updated result
      if (result) {
        gameCache.set(CACHE_KEYS.PLAYER(userId), result, 30000);
      }

      return result;
    } catch (error) {
      throw new DatabaseError(`Failed to update player ${userId}`, error);
    }
  },

  async updateMission(userId: string, mission: any): Promise<void> {
    try {
      await dbWrapper.players.update(
        { id: userId },
        {
          lastActionTimestamp: new Date(),
          currentMission: mission,
        },
      );
    } catch (error) {
      throw new DatabaseError(`Failed to update mission for ${userId}`, error);
    }
  },

  async completeMission(
    userId: string,
    updates: {
      coins?: number;
      inventory?: Record<string, number>;
      skills?: Record<string, { level: number; xp: number }>;
      missionsCompleted?: number;
    },
  ): Promise<Player> {
    try {
      const result = await dbWrapper.players.update(
        { id: userId },
        {
          currentMission: null,
          lastActionTimestamp: new Date(),
          ...updates,
        },
      );

      if (!result) {
        throw new NotFoundError("Player", userId);
      }

      // Invalidate cache on update
      gameCache.delete(CACHE_KEYS.PLAYER(userId));

      return result;
    } catch (error) {
      if (error instanceof DatabaseError || error instanceof NotFoundError)
        throw error;
      throw new DatabaseError(
        `Failed to complete mission for ${userId}`,
        error,
      );
    }
  },

  async contributeResources(
    userId: string,
    updates: {
      inventory: Record<string, number>;
      coins: number;
      reputation: number;
    },
  ): Promise<void> {
    await dbWrapper.players.update({ id: userId }, updates);
  },

  async reset(userId: string): Promise<void> {
    await dbWrapper.players.update(
      { id: userId },
      {
        strength: 5,
        stamina: 5,
        coins: 10,
        reputation: 0,
        inventory: DEFAULT_INVENTORY,
        skills: DEFAULT_SKILLS,
        missionsCompleted: 0,
        lastActionTimestamp: new Date(0),
        currentMission: null,
      },
    );
  },
};

// Town operations
export const townApi = {
  async find(): Promise<Town | null> {
    try {
      // Check cache first
      const cached = gameCache.get<Town>(CACHE_KEYS.TOWN());
      if (cached) {
        return cached;
      }

      const town = await dbWrapper.towns.findFirst();

      // Cache the result for 60 seconds (towns change less frequently)
      if (town) {
        gameCache.set(CACHE_KEYS.TOWN(), town, 60000);
      }

      return town;
    } catch (error) {
      throw new DatabaseError("Failed to find town", error);
    }
  },

  async findOrThrow(): Promise<Town> {
    const town = await this.find();
    if (!town) {
      throw new NotFoundError("Town", "default");
    }
    return town;
  },

  async create(): Promise<Town> {
    try {
      return await dbWrapper.towns.insert({
        id: "default-town",
        name: "Starscape Village",
        level: 1,
        treasury: {},
        upgrades: DEFAULT_TOWN_UPGRADES,
        unlockedMissions: [],
        completedObjectives: [],
        slayCounts: {},
        unlockedTerritories: ["t1"],
      });
    } catch (error) {
      throw new DatabaseError("Failed to create town", error);
    }
  },

  async update(townId: string, data: Partial<Town>): Promise<Town | null> {
    try {
      const result = await dbWrapper.towns.update({ id: townId }, data);

      // Invalidate cache on update
      gameCache.delete(CACHE_KEYS.TOWN());

      // Cache the updated result
      if (result) {
        gameCache.set(CACHE_KEYS.TOWN(), result, 60000);
      }

      return result;
    } catch (error) {
      throw new DatabaseError(`Failed to update town ${townId}`, error);
    }
  },

  async updateTreasury(
    townId: string,
    treasury: Record<string, number>,
  ): Promise<void> {
    await dbWrapper.towns.update({ id: townId }, { treasury });
  },

  async updateSlayCounts(
    townId: string,
    slayCounts: Record<string, number>,
  ): Promise<void> {
    await dbWrapper.towns.update({ id: townId }, { slayCounts });
  },

  async unlockMissions(townId: string, missions: string[]): Promise<void> {
    await dbWrapper.towns.update(
      { id: townId },
      { unlockedMissions: missions },
    );
  },

  async completeObjective(
    townId: string,
    updates: {
      completedObjectives: string[];
      unlockedMissions?: string[];
      upgrades?: Record<string, boolean>;
    },
  ): Promise<void> {
    await dbWrapper.towns.update({ id: townId }, updates);
  },

  async reset(townId: string): Promise<void> {
    await dbWrapper.towns.update(
      { id: townId },
      {
        name: "Starscape Village",
        level: 1,
        treasury: {},
        upgrades: DEFAULT_TOWN_UPGRADES,
        unlockedMissions: [],
        completedObjectives: [],
        slayCounts: {},
        unlockedTerritories: ["t1"],
      },
    );
  },
};

// Game log operations
export const gameLogApi = {
  async findMany(options: {
    playerId?: string;
    limit?: number;
  }): Promise<GameLog[]> {
    // For player-specific logs, include both player and system logs
    const where = options.playerId ? { playerId: options.playerId } : undefined;
    return await dbWrapper.gameLogs.findMany({
      where,
      limit: options.limit || 30,
    });
  },

  async create(data: {
    playerId: string;
    message: string;
    type: string;
  }): Promise<GameLog> {
    return await dbWrapper.gameLogs.insert(data);
  },

  async createMany(
    logs: Array<{
      playerId: string;
      message: string;
      type: string;
    }>,
  ): Promise<GameLog[]> {
    return await dbWrapper.gameLogs.insertMany(logs);
  },

  async deleteByPlayer(playerId: string): Promise<void> {
    await dbWrapper.gameLogs.delete({ playerId });
  },
};

// Utility operations
export const utilApi = {
  async clearAll(): Promise<void> {
    await dbWrapper.clearAll();
  },
};

// Combined API export
export const dbApi = {
  player: playerApi,
  town: townApi,
  gameLog: gameLogApi,
  util: utilApi,
  batch: {
    async getGameState(userId: string): Promise<ApiResponse<GameState>> {
      try {
        // Execute all queries in parallel
        const [player, town, logs] = await Promise.all([
          playerApi.findById(userId),
          townApi.find(),
          gameLogApi.findMany({ playerId: userId, limit: 30 }),
        ]);

        return {
          success: true,
          data: { player, town, logs: logs || [] },
        };
      } catch (error) {
        console.error("Error in getGameState:", error);
        return {
          success: false,
          error:
            error instanceof DatabaseError
              ? error.message
              : "Unknown database error",
        };
      }
    },

    async initializeGame(userId: string): Promise<ApiResponse<GameState>> {
      try {
        // Check if player exists
        let player = await playerApi.findById(userId);

        if (!player) {
          player = await playerApi.create(userId);
          await gameLogApi.create({
            playerId: userId,
            message: "Welcome to Starscape! Your journey begins.",
            type: "system",
          });
        }

        // Check if town exists
        let town = await townApi.find();
        if (!town) {
          town = await townApi.create();
        }

        // Get recent logs
        const logs = await gameLogApi.findMany({ playerId: userId, limit: 30 });

        return {
          success: true,
          data: { player, town, logs },
        };
      } catch (error) {
        console.error("Failed to initialize game:", error);
        return {
          success: false,
          error:
            error instanceof DatabaseError
              ? error.message
              : "Failed to initialize game",
        };
      }
    },
  },
};
