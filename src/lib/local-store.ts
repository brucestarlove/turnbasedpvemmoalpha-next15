// In-memory store for local development
import { DEFAULT_TOWN_UPGRADES } from "@/lib/game-config";

// Types for our in-memory store
type StoredPlayer = {
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

type StoredTown = {
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

type StoredGameLog = {
  id: string;
  playerId: string;
  message: string;
  type: string;
  timestamp: Date;
};

// In-memory storage - initialize with empty structures
let players: Map<string, StoredPlayer> = new Map();
let towns: Map<string, StoredTown> = new Map();
let gameLogs: StoredGameLog[] = [];
let logIdCounter = 1;

// Storage key for localStorage
const STORAGE_KEY = "starscape-game-data";

// Load data from localStorage on module initialization
function loadFromStorage() {
  if (typeof window === "undefined") return;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);

      // Convert Map data back with proper null checks
      if (data.players && Array.isArray(data.players)) {
        players = new Map(
          data.players.map((p: any) => [
            p.id,
            {
              ...p,
              lastActionTimestamp: new Date(p.lastActionTimestamp),
            },
          ]),
        );
      } else {
        players = new Map();
      }

      if (data.towns && Array.isArray(data.towns)) {
        towns = new Map(data.towns.map((t: any) => [t.id, t]));
      } else {
        towns = new Map();
      }

      if (data.gameLogs && Array.isArray(data.gameLogs)) {
        gameLogs = data.gameLogs.map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp),
        }));
      } else {
        gameLogs = [];
      }

      logIdCounter = data.logIdCounter || 1;
    } else {
      // Initialize empty data structures
      players = new Map();
      towns = new Map();
      gameLogs = [];
      logIdCounter = 1;
    }
  } catch (error) {
    console.warn("Failed to load from localStorage:", error);
    // Initialize empty data structures on error
    players = new Map();
    towns = new Map();
    gameLogs = [];
    logIdCounter = 1;
  }
}

// Save data to localStorage
function saveToStorage() {
  if (typeof window === "undefined") return;

  try {
    const data = {
      players: Array.from(players.values()),
      towns: Array.from(towns.values()),
      gameLogs,
      logIdCounter,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn("Failed to save to localStorage:", error);
  }
}

// Initialize storage
loadFromStorage();

// Helper to ensure town exists
function ensureTownExists() {
  if (towns.size === 0) {
    const defaultTown: StoredTown = {
      id: "default-town",
      name: "Starscape Village",
      level: 1,
      treasury: {},
      upgrades: DEFAULT_TOWN_UPGRADES,
      unlockedMissions: [],
      completedObjectives: [],
      slayCounts: {},
      unlockedTerritories: ["t1"],
    };
    towns.set("default-town", defaultTown);
    saveToStorage();
  }
}

// Mock database operations
export const localStore = {
  // Player operations
  players: {
    async findFirst(where: { id: string }) {
      const player = players.get(where.id);
      return player || null;
    },

    async insert(data: Omit<StoredPlayer, "id"> & { id: string }) {
      const player: StoredPlayer = { ...data };
      players.set(data.id, player);
      saveToStorage();
      return player;
    },

    async update(where: { id: string }, data: Partial<StoredPlayer>) {
      const player = players.get(where.id);
      if (player) {
        Object.assign(player, data);
        players.set(where.id, player);
        saveToStorage();
      }
      return player;
    },
  },

  // Town operations
  towns: {
    async findFirst() {
      ensureTownExists();
      return Array.from(towns.values())[0] || null;
    },

    async insert(data: Omit<StoredTown, "id"> & { id: string }) {
      const town: StoredTown = { ...data };
      towns.set(data.id, town);
      saveToStorage();
      return town;
    },

    async update(where: { id: string }, data: Partial<StoredTown>) {
      const town = towns.get(where.id);
      if (town) {
        Object.assign(town, data);
        towns.set(where.id, town);
        saveToStorage();
      }
      return town;
    },
  },

  // Game logs operations
  gameLogs: {
    async findMany(options: {
      where?: { playerId?: string };
      orderBy?: any;
      limit?: number;
    }) {
      // Ensure gameLogs is an array
      if (!Array.isArray(gameLogs)) {
        console.warn("gameLogs is not an array, initializing as empty array");
        gameLogs = [];
      }

      let filtered = [...gameLogs];

      // Apply where clause
      if (options.where?.playerId) {
        filtered = filtered.filter(
          (log) =>
            log.playerId === options.where!.playerId ||
            log.playerId === "system",
        );
      }

      // Apply ordering (desc by timestamp)
      filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      // Apply limit
      if (options.limit) {
        filtered = filtered.slice(0, options.limit);
      }

      return filtered;
    },

    async insert(data: { playerId: string; message: string; type: string }) {
      const log: StoredGameLog = {
        id: `log-${logIdCounter++}`,
        playerId: data.playerId,
        message: data.message,
        type: data.type,
        timestamp: new Date(),
      };
      gameLogs.push(log);
      saveToStorage();
      return log;
    },

    async insertMany(
      dataArray: { playerId: string; message: string; type: string }[],
    ) {
      const logs = dataArray.map((data) => ({
        id: `log-${logIdCounter++}`,
        playerId: data.playerId,
        message: data.message,
        type: data.type,
        timestamp: new Date(),
      }));
      gameLogs.push(...logs);
      saveToStorage();
      return logs;
    },

    async delete(where: { playerId: string }) {
      gameLogs = gameLogs.filter((log) => log.playerId !== where.playerId);
      saveToStorage();
    },
  },

  // Clear all data
  async clearAll() {
    players.clear();
    towns.clear();
    gameLogs = [];
    logIdCounter = 1;
    saveToStorage();
  },
};

// Check if we're on localhost
export const isLocalhost = () => {
  // On server side, check environment or headers
  if (typeof window === "undefined") {
    // For server-side, we can check if we're in development mode
    return process.env.NODE_ENV === "development";
  }
  // On client side, check hostname
  return (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  );
};
