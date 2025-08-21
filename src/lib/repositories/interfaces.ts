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

// Core repository interfaces for enterprise-grade game data management
export interface IPlayerRepository {
  findById(userId: string): Promise<Player | null>;
  findByIdOrThrow(userId: string): Promise<Player>;
  create(userId: string): Promise<Player>;
  update(userId: string, data: PlayerUpdate): Promise<Player | null>;
  updateMission(userId: string, mission: any): Promise<void>;
  completeMission(userId: string, updates: MissionUpdate): Promise<Player>;
  contributeResources(
    userId: string,
    updates: {
      inventory: Record<string, number>;
      coins: number;
      reputation: number;
    },
  ): Promise<void>;
  reset(userId: string): Promise<void>;
}

export interface ITownRepository {
  find(): Promise<Town | null>;
  findOrThrow(): Promise<Town>;
  create(): Promise<Town>;
  update(townId: string, data: TownUpdate): Promise<Town | null>;
  updateTreasury(
    townId: string,
    treasury: Record<string, number>,
  ): Promise<void>;
  updateSlayCounts(
    townId: string,
    slayCounts: Record<string, number>,
  ): Promise<void>;
  unlockMissions(townId: string, missions: string[]): Promise<void>;
  completeObjective(
    townId: string,
    updates: {
      completedObjectives: string[];
      unlockedMissions?: string[];
      upgrades?: Record<string, boolean>;
    },
  ): Promise<void>;
  reset(townId: string): Promise<void>;
}

export interface IGameLogRepository {
  findMany(options: { playerId?: string; limit?: number }): Promise<GameLog[]>;
  create(data: {
    playerId: string;
    message: string;
    type: string;
  }): Promise<GameLog>;
  createMany(
    logs: Array<{
      playerId: string;
      message: string;
      type: string;
    }>,
  ): Promise<GameLog[]>;
  deleteByPlayer(playerId: string): Promise<void>;
}

export interface IUtilRepository {
  clearAll(): Promise<void>;
}

// Main game data repository interface
export interface IGameDataRepository {
  player: IPlayerRepository;
  town: ITownRepository;
  gameLog: IGameLogRepository;
  util: IUtilRepository;

  // Batch operations for performance
  batch: {
    getGameState(userId: string): Promise<ApiResponse<GameState>>;
    initializeGame(userId: string): Promise<ApiResponse<GameState>>;
  };
}

// Repository factory interface
export interface IRepositoryFactory {
  createRepository(): IGameDataRepository;
}

// Error types for repositories
export class RepositoryError extends Error {
  constructor(
    message: string,
    public cause?: unknown,
  ) {
    super(message);
    this.name = "RepositoryError";
  }
}

export class NotFoundError extends RepositoryError {
  constructor(resource: string, id: string) {
    super(`${resource} with id '${id}' not found`);
    this.name = "NotFoundError";
  }
}
