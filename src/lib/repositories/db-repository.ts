import { CACHE_KEYS, gameCache } from "../cache";
import { dbWrapper } from "../db-wrapper";
import {
  DEFAULT_INVENTORY,
  DEFAULT_SKILLS,
  DEFAULT_TOWN_UPGRADES,
} from "../game-config";
import type {
  ApiResponse,
  GameLog,
  GameState,
  MissionUpdate,
  Player,
  PlayerUpdate,
  Town,
  TownUpdate,
} from "../types";
import {
  IGameDataRepository,
  IGameLogRepository,
  IPlayerRepository,
  ITownRepository,
  IUtilRepository,
  NotFoundError,
  RepositoryError,
} from "./interfaces";

// Database-backed player repository
class DbPlayerRepository implements IPlayerRepository {
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
      throw new RepositoryError(`Failed to find player ${userId}`, error);
    }
  }

  async findByIdOrThrow(userId: string): Promise<Player> {
    const player = await this.findById(userId);
    if (!player) {
      throw new NotFoundError("Player", userId);
    }
    return player;
  }

  async create(userId: string): Promise<Player> {
    try {
      const player = await dbWrapper.players.insert({
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

      // Cache the new player
      if (player) {
        gameCache.set(CACHE_KEYS.PLAYER(userId), player, 30000);
      }

      return player;
    } catch (error) {
      throw new RepositoryError(`Failed to create player ${userId}`, error);
    }
  }

  async update(userId: string, data: PlayerUpdate): Promise<Player | null> {
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
      throw new RepositoryError(`Failed to update player ${userId}`, error);
    }
  }

  async updateMission(userId: string, mission: any): Promise<void> {
    try {
      await dbWrapper.players.update(
        { id: userId },
        {
          lastActionTimestamp: new Date(),
          currentMission: mission,
        },
      );

      // Invalidate cache
      gameCache.delete(CACHE_KEYS.PLAYER(userId));
    } catch (error) {
      throw new RepositoryError(
        `Failed to update mission for ${userId}`,
        error,
      );
    }
  }

  async completeMission(
    userId: string,
    updates: MissionUpdate,
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
      if (error instanceof NotFoundError) throw error;
      throw new RepositoryError(
        `Failed to complete mission for ${userId}`,
        error,
      );
    }
  }

  async contributeResources(
    userId: string,
    updates: {
      inventory: Record<string, number>;
      coins: number;
      reputation: number;
    },
  ): Promise<void> {
    try {
      await dbWrapper.players.update({ id: userId }, updates);

      // Invalidate cache
      gameCache.delete(CACHE_KEYS.PLAYER(userId));
    } catch (error) {
      throw new RepositoryError(
        `Failed to contribute resources for ${userId}`,
        error,
      );
    }
  }

  async reset(userId: string): Promise<void> {
    try {
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

      // Invalidate cache
      gameCache.delete(CACHE_KEYS.PLAYER(userId));
    } catch (error) {
      throw new RepositoryError(`Failed to reset player ${userId}`, error);
    }
  }
}

// Database-backed town repository
class DbTownRepository implements ITownRepository {
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
      throw new RepositoryError("Failed to find town", error);
    }
  }

  async findOrThrow(): Promise<Town> {
    const town = await this.find();
    if (!town) {
      throw new NotFoundError("Town", "default");
    }
    return town;
  }

  async create(): Promise<Town> {
    try {
      const town = await dbWrapper.towns.insert({
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

      // Cache the new town
      if (town) {
        gameCache.set(CACHE_KEYS.TOWN(), town, 60000);
      }

      return town;
    } catch (error) {
      throw new RepositoryError("Failed to create town", error);
    }
  }

  async update(townId: string, data: TownUpdate): Promise<Town | null> {
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
      throw new RepositoryError(`Failed to update town ${townId}`, error);
    }
  }

  async updateTreasury(
    townId: string,
    treasury: Record<string, number>,
  ): Promise<void> {
    await this.update(townId, { treasury });
  }

  async updateSlayCounts(
    townId: string,
    slayCounts: Record<string, number>,
  ): Promise<void> {
    await this.update(townId, { slayCounts });
  }

  async unlockMissions(townId: string, missions: string[]): Promise<void> {
    await this.update(townId, { unlockedMissions: missions });
  }

  async completeObjective(
    townId: string,
    updates: {
      completedObjectives: string[];
      unlockedMissions?: string[];
      upgrades?: Record<string, boolean>;
    },
  ): Promise<void> {
    await this.update(townId, updates);
  }

  async reset(townId: string): Promise<void> {
    try {
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

      // Invalidate cache
      gameCache.delete(CACHE_KEYS.TOWN());
    } catch (error) {
      throw new RepositoryError(`Failed to reset town ${townId}`, error);
    }
  }
}

// Database-backed game log repository
class DbGameLogRepository implements IGameLogRepository {
  async findMany(options: {
    playerId?: string;
    limit?: number;
  }): Promise<GameLog[]> {
    try {
      // For player-specific logs, include both player and system logs
      const where = options.playerId
        ? { playerId: options.playerId }
        : undefined;
      return await dbWrapper.gameLogs.findMany({
        where,
        limit: options.limit || 30,
      });
    } catch (error) {
      throw new RepositoryError("Failed to find game logs", error);
    }
  }

  async create(data: {
    playerId: string;
    message: string;
    type: string;
  }): Promise<GameLog> {
    try {
      return await dbWrapper.gameLogs.insert(data);
    } catch (error) {
      throw new RepositoryError("Failed to create game log", error);
    }
  }

  async createMany(
    logs: Array<{
      playerId: string;
      message: string;
      type: string;
    }>,
  ): Promise<GameLog[]> {
    try {
      return await dbWrapper.gameLogs.insertMany(logs);
    } catch (error) {
      throw new RepositoryError("Failed to create game logs", error);
    }
  }

  async deleteByPlayer(playerId: string): Promise<void> {
    try {
      await dbWrapper.gameLogs.delete({ playerId });
    } catch (error) {
      throw new RepositoryError(
        `Failed to delete logs for player ${playerId}`,
        error,
      );
    }
  }
}

// Database-backed utility repository
class DbUtilRepository implements IUtilRepository {
  async clearAll(): Promise<void> {
    try {
      await dbWrapper.clearAll();
    } catch (error) {
      throw new RepositoryError("Failed to clear all data", error);
    }
  }
}

// Main database repository implementation
export class DbGameRepository implements IGameDataRepository {
  public readonly player: IPlayerRepository;
  public readonly town: ITownRepository;
  public readonly gameLog: IGameLogRepository;
  public readonly util: IUtilRepository;

  constructor() {
    this.player = new DbPlayerRepository();
    this.town = new DbTownRepository();
    this.gameLog = new DbGameLogRepository();
    this.util = new DbUtilRepository();
  }

  batch = {
    async getGameState(userId: string): Promise<ApiResponse<GameState>> {
      try {
        // Execute all queries in parallel
        const [player, town, logs] = await Promise.all([
          this.player.findById(userId),
          this.town.find(),
          this.gameLog.findMany({ playerId: userId, limit: 30 }),
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
            error instanceof RepositoryError
              ? error.message
              : "Unknown database error",
        };
      }
    },

    initializeGame: async (userId: string): Promise<ApiResponse<GameState>> => {
      try {
        // Check if player exists
        let player = await this.player.findById(userId);

        if (!player) {
          player = await this.player.create(userId);
          await this.gameLog.create({
            playerId: userId,
            message: "Welcome to Starscape! Your journey begins.",
            type: "system",
          });
        }

        // Check if town exists
        let town = await this.town.find();
        if (!town) {
          town = await this.town.create();
        }

        // Get recent logs
        const logs = await this.gameLog.findMany({
          playerId: userId,
          limit: 30,
        });

        return {
          success: true,
          data: { player, town, logs },
        };
      } catch (error) {
        console.error("Failed to initialize game:", error);
        return {
          success: false,
          error:
            error instanceof RepositoryError
              ? error.message
              : "Failed to initialize game",
        };
      }
    },
  };
}
