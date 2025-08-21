import { GameLog, Player, Town } from "./schema";

// Centralized type definitions for the game
export type { GameLog, Player, Town } from "./schema";

// Extended types for API responses
export type PlayerWithComputed = Player & {
  // Add computed fields if needed
  totalSkillLevels?: number;
  powerLevel?: number;
};

export type TownWithComputed = Town & {
  // Add computed fields if needed
  currentObjective?: string;
  completionPercentage?: number;
};

// API Response types
export type ApiResponse<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: string;
    };

export type GameState = {
  player: Player | null;
  town: Town | null;
  logs: GameLog[];
};

// Game action types
export type MissionUpdate = {
  coins?: number;
  inventory?: Record<string, number>;
  skills?: Record<string, { level: number; xp: number }>;
  missionsCompleted?: number;
};

export type PlayerUpdate = Partial<
  Omit<Player, "id" | "createdAt" | "updatedAt">
>;
export type TownUpdate = Partial<Omit<Town, "id" | "createdAt" | "updatedAt">>;
