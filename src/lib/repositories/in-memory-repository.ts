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

// In-memory storage for development/testing
class InMemoryStorage {
  private players = new Map<string, Player>();
  private towns = new Map<string, Town>();
  private gameLogs: GameLog[] = [];
  private idCounter = 1;

  // Player operations
  getPlayer(id: string): Player | null {
    return this.players.get(id) || null;
  }

  setPlayer(id: string, player: Player): void {
    this.players.set(id, { ...player, updatedAt: new Date() });
  }

  deletePlayer(id: string): void {
    this.players.delete(id);
  }

  // Town operations
  getTown(id?: string): Town | null {
    if (id) {
      return this.towns.get(id) || null;
    }
    // Return first town if no ID specified
    const towns = Array.from(this.towns.values());
    return towns.length > 0 ? towns[0] : null;
  }

  setTown(id: string, town: Town): void {
    this.towns.set(id, { ...town, updatedAt: new Date() });
  }

  deleteTown(id: string): void {
    this.towns.delete(id);
  }

  // Game log operations
  getLogs(): GameLog[] {
    return [...this.gameLogs].sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
    );
  }

  addLog(log: Omit<GameLog, "id" | "timestamp">): GameLog {
    const newLog: GameLog = {
      ...log,
      id: `log-${this.idCounter++}`,
      timestamp: new Date(),
    };
    this.gameLogs.push(newLog);
    return newLog;
  }

  addLogs(logs: Array<Omit<GameLog, "id" | "timestamp">>): GameLog[] {
    return logs.map((log) => this.addLog(log));
  }

  deleteLogsByPlayer(playerId: string): void {
    this.gameLogs = this.gameLogs.filter((log) => log.playerId !== playerId);
  }

  // Utility operations
  clearAll(): void {
    this.players.clear();
    this.towns.clear();
    this.gameLogs = [];
    this.idCounter = 1;
  }
}

// Singleton storage instance
const storage = new InMemoryStorage();

// Player repository implementation
class InMemoryPlayerRepository implements IPlayerRepository {
  async findById(userId: string): Promise<Player | null> {
    try {
      return storage.getPlayer(userId);
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
      const player: Player = {
        id: userId,
        strength: 5,
        stamina: 5,
        coins: 10,
        reputation: 0,
        inventory: { ...DEFAULT_INVENTORY },
        skills: { ...DEFAULT_SKILLS },
        missionsCompleted: 0,
        lastActionTimestamp: new Date(0),
        currentMission: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      storage.setPlayer(userId, player);
      return player;
    } catch (error) {
      throw new RepositoryError(`Failed to create player ${userId}`, error);
    }
  }

  async update(userId: string, data: PlayerUpdate): Promise<Player | null> {
    try {
      const existing = storage.getPlayer(userId);
      if (!existing) return null;

      const updated = { ...existing, ...data, updatedAt: new Date() };
      storage.setPlayer(userId, updated);
      return updated;
    } catch (error) {
      throw new RepositoryError(`Failed to update player ${userId}`, error);
    }
  }

  async updateMission(userId: string, mission: any): Promise<void> {
    try {
      const existing = storage.getPlayer(userId);
      if (!existing) throw new NotFoundError("Player", userId);

      const updated = {
        ...existing,
        lastActionTimestamp: new Date(),
        currentMission: mission,
        updatedAt: new Date(),
      };
      storage.setPlayer(userId, updated);
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
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
      const existing = storage.getPlayer(userId);
      if (!existing) throw new NotFoundError("Player", userId);

      const updated = {
        ...existing,
        currentMission: null,
        lastActionTimestamp: new Date(),
        ...updates,
        updatedAt: new Date(),
      };
      storage.setPlayer(userId, updated);
      return updated;
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
      const existing = storage.getPlayer(userId);
      if (!existing) throw new NotFoundError("Player", userId);

      const updated = { ...existing, ...updates, updatedAt: new Date() };
      storage.setPlayer(userId, updated);
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new RepositoryError(
        `Failed to contribute resources for ${userId}`,
        error,
      );
    }
  }

  async reset(userId: string): Promise<void> {
    try {
      const resetData: Player = {
        id: userId,
        strength: 5,
        stamina: 5,
        coins: 10,
        reputation: 0,
        inventory: { ...DEFAULT_INVENTORY },
        skills: { ...DEFAULT_SKILLS },
        missionsCompleted: 0,
        lastActionTimestamp: new Date(0),
        currentMission: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      storage.setPlayer(userId, resetData);
    } catch (error) {
      throw new RepositoryError(`Failed to reset player ${userId}`, error);
    }
  }
}

// Town repository implementation
class InMemoryTownRepository implements ITownRepository {
  async find(): Promise<Town | null> {
    try {
      return storage.getTown();
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
      const town: Town = {
        id: "default-town",
        name: "Starscape Village",
        level: 1,
        treasury: {},
        upgrades: { ...DEFAULT_TOWN_UPGRADES },
        unlockedMissions: [],
        completedObjectives: [],
        slayCounts: {},
        unlockedTerritories: ["t1"],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      storage.setTown(town.id, town);
      return town;
    } catch (error) {
      throw new RepositoryError("Failed to create town", error);
    }
  }

  async update(townId: string, data: TownUpdate): Promise<Town | null> {
    try {
      const existing = storage.getTown(townId);
      if (!existing) return null;

      const updated = { ...existing, ...data, updatedAt: new Date() };
      storage.setTown(townId, updated);
      return updated;
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
      const resetData: Omit<Town, "id" | "createdAt" | "updatedAt"> = {
        name: "Starscape Village",
        level: 1,
        treasury: {},
        upgrades: { ...DEFAULT_TOWN_UPGRADES },
        unlockedMissions: [],
        completedObjectives: [],
        slayCounts: {},
        unlockedTerritories: ["t1"],
      };
      await this.update(townId, resetData);
    } catch (error) {
      throw new RepositoryError(`Failed to reset town ${townId}`, error);
    }
  }
}

// Game log repository implementation
class InMemoryGameLogRepository implements IGameLogRepository {
  async findMany(options: {
    playerId?: string;
    limit?: number;
  }): Promise<GameLog[]> {
    try {
      let logs = storage.getLogs();

      if (options.playerId) {
        logs = logs.filter((log) => log.playerId === options.playerId);
      }

      if (options.limit) {
        logs = logs.slice(0, options.limit);
      }

      return logs;
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
      return storage.addLog(data);
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
      return storage.addLogs(logs);
    } catch (error) {
      throw new RepositoryError("Failed to create game logs", error);
    }
  }

  async deleteByPlayer(playerId: string): Promise<void> {
    try {
      storage.deleteLogsByPlayer(playerId);
    } catch (error) {
      throw new RepositoryError(
        `Failed to delete logs for player ${playerId}`,
        error,
      );
    }
  }
}

// Utility repository implementation
class InMemoryUtilRepository implements IUtilRepository {
  async clearAll(): Promise<void> {
    try {
      storage.clearAll();
    } catch (error) {
      throw new RepositoryError("Failed to clear all data", error);
    }
  }
}

// Main repository implementation
export class InMemoryGameRepository implements IGameDataRepository {
  public readonly player: IPlayerRepository;
  public readonly town: ITownRepository;
  public readonly gameLog: IGameLogRepository;
  public readonly util: IUtilRepository;

  constructor() {
    this.player = new InMemoryPlayerRepository();
    this.town = new InMemoryTownRepository();
    this.gameLog = new InMemoryGameLogRepository();
    this.util = new InMemoryUtilRepository();
  }

  batch = {
    getGameState: async (userId: string): Promise<ApiResponse<GameState>> => {
      try {
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
              : "Unknown repository error",
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
