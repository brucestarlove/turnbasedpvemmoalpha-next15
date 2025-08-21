// Database API - Clean interface for all game database operations
import { dbWrapper } from "./db-wrapper";
import {
  DEFAULT_INVENTORY,
  DEFAULT_SKILLS,
  DEFAULT_TOWN_UPGRADES,
} from "./game-config";

export type PlayerData = {
  id: string;
  strength: number;
  stamina: number;
  coins: number;
  reputation: number;
  inventory: Record<string, number>;
  skills: Record<string, { level: number; xp: number }>;
  missionsCompleted: number;
  lastActionTimestamp: Date;
  currentMission: any;
};

export type TownData = {
  id: string;
  name: string;
  level: number;
  treasury: Record<string, number>;
  upgrades: Record<string, boolean>;
  unlockedMissions: string[];
  completedObjectives: string[];
  slayCounts: Record<string, number>;
  unlockedTerritories: string[];
};

export type GameLogData = {
  id: string;
  playerId: string;
  message: string;
  type: string;
  timestamp: Date;
};

// Player operations
export const playerApi = {
  async findById(userId: string): Promise<PlayerData | null> {
    return await dbWrapper.players.findFirst({ id: userId });
  },

  async create(userId: string): Promise<PlayerData> {
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
  },

  async update(
    userId: string,
    data: Partial<PlayerData>,
  ): Promise<PlayerData | null> {
    return await dbWrapper.players.update({ id: userId }, data);
  },

  async updateMission(userId: string, mission: any): Promise<void> {
    await dbWrapper.players.update(
      { id: userId },
      {
        lastActionTimestamp: new Date(),
        currentMission: mission,
      },
    );
  },

  async completeMission(
    userId: string,
    updates: {
      coins?: number;
      inventory?: Record<string, number>;
      skills?: Record<string, { level: number; xp: number }>;
      missionsCompleted?: number;
    },
  ): Promise<void> {
    await dbWrapper.players.update(
      { id: userId },
      {
        currentMission: null,
        ...updates,
      },
    );
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
  async find(): Promise<TownData | null> {
    return await dbWrapper.towns.findFirst();
  },

  async create(): Promise<TownData> {
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
  },

  async update(
    townId: string,
    data: Partial<TownData>,
  ): Promise<TownData | null> {
    return await dbWrapper.towns.update({ id: townId }, data);
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
  }): Promise<GameLogData[]> {
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
  }): Promise<GameLogData> {
    return await dbWrapper.gameLogs.insert(data);
  },

  async createMany(
    logs: Array<{
      playerId: string;
      message: string;
      type: string;
    }>,
  ): Promise<GameLogData[]> {
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
    async getGameState(userId: string) {
      try {
        // Execute all queries in parallel
        const [player, town, logs] = await Promise.all([
          playerApi.findById(userId),
          townApi.find(),
          gameLogApi.findMany({ playerId: userId, limit: 30 }),
        ]);

        return { player, town, logs: logs || [] };
      } catch (error) {
        console.error("Error in getGameState:", error);
        throw error;
      }
    },

    async initializeGame(userId: string) {
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
        return { success: false, error: "Failed to initialize game" };
      }
    },
  },
};
