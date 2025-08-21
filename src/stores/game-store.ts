// Game State Management with Zustand
"use client";

import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";

import { getGameState as fetchGameState } from "@/actions/game-actions";
import type { GameLog, Player, Town } from "@/lib/types";
import type { ApiResponse, GameState } from "@/lib/types";

interface GameStoreState {
  // Core game data
  player: Player | null;
  town: Town | null;
  logs: GameLog[];

  // UI state
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;

  // Connection status for future real-time features
  connectionStatus: "connected" | "disconnected" | "reconnecting";

  // Actions
  initializeGame: (userId: string) => Promise<void>;
  refreshGameData: (userId: string) => Promise<void>;
  setPlayer: (player: Player) => void;
  setTown: (town: Town) => void;
  addLog: (log: GameLog) => void;
  addLogs: (logs: GameLog[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;

  // Optimistic updates for better UX
  updatePlayerOptimistic: (updates: Partial<Player>) => void;
  updateTownOptimistic: (updates: Partial<Town>) => void;

  // Reset state
  resetGame: () => void;
}

// Initial state for SSR consistency
const initialState = {
  player: null,
  town: null,
  logs: [],
  isLoading: false,
  error: null,
  lastUpdated: null,
  connectionStatus: "disconnected" as const,
};

export const useGameStore = create<GameStoreState>()(
  subscribeWithSelector(
    devtools(
      (set, get) => ({
        // Use spread to maintain reference stability for SSR
        ...initialState,

        // Initialize game data
        initializeGame: async (userId: string) => {
          set({ isLoading: true, error: null });

          try {
            const response = await fetchGameState(userId);

            if (response.success && response.data) {
              set({
                player: response.data.player,
                town: response.data.town,
                logs: response.data.logs || [],
                lastUpdated: new Date(),
                isLoading: false,
                connectionStatus: "connected",
              });
            } else {
              set({
                error: response.error || "Failed to initialize game",
                isLoading: false,
                connectionStatus: "disconnected",
              });
            }
          } catch (error) {
            console.error("Failed to initialize game:", error);
            set({
              error: "Failed to initialize game",
              isLoading: false,
              connectionStatus: "disconnected",
            });
          }
        },

        // Refresh all game data
        refreshGameData: async (userId: string) => {
          const currentState = get();

          // Don't show loading if we already have data
          if (!currentState.player) {
            set({ isLoading: true });
          }

          try {
            const response = await fetchGameState(userId);

            if (response.success && response.data) {
              set({
                player: response.data.player,
                town: response.data.town,
                logs: response.data.logs || [],
                lastUpdated: new Date(),
                isLoading: false,
                error: null,
                connectionStatus: "connected",
              });
            } else {
              set({
                error: response.error || "Failed to refresh game data",
                isLoading: false,
                connectionStatus: "disconnected",
              });
            }
          } catch (error) {
            console.error("Failed to refresh game data:", error);
            set({
              error: "Failed to refresh game data",
              isLoading: false,
              connectionStatus: "disconnected",
            });
          }
        },

        // Direct state setters
        setPlayer: (player: Player) => {
          set({ player, lastUpdated: new Date() });
        },

        setTown: (town: Town) => {
          set({ town, lastUpdated: new Date() });
        },

        addLog: (log: GameLog) => {
          set((state) => ({
            logs: [log, ...state.logs.slice(0, 29)], // Keep only 30 logs
            lastUpdated: new Date(),
          }));
        },

        addLogs: (newLogs: GameLog[]) => {
          set((state) => ({
            logs: [...newLogs, ...state.logs].slice(0, 30),
            lastUpdated: new Date(),
          }));
        },

        setLoading: (isLoading: boolean) => {
          set({ isLoading });
        },

        setError: (error: string | null) => {
          set({ error });
        },

        clearError: () => {
          set({ error: null });
        },

        // Optimistic updates for immediate UI feedback
        updatePlayerOptimistic: (updates: Partial<Player>) => {
          set((state) => ({
            player: state.player ? { ...state.player, ...updates } : null,
            lastUpdated: new Date(),
          }));
        },

        updateTownOptimistic: (updates: Partial<Town>) => {
          set((state) => ({
            town: state.town ? { ...state.town, ...updates } : null,
            lastUpdated: new Date(),
          }));
        },

        // Reset all game state
        resetGame: () => {
          set({
            player: null,
            town: null,
            logs: [],
            isLoading: false,
            error: null,
            lastUpdated: null,
            connectionStatus: "disconnected",
          });
        },
      }),
      {
        name: "game-store", // Name for Redux DevTools
        partialize: (state) => ({
          // Only persist essential data
          player: state.player,
          town: state.town,
          logs: state.logs.slice(0, 10), // Persist fewer logs
          lastUpdated: state.lastUpdated,
        }),
      },
    ),
  ),
);

// Stable selectors for SSR compatibility - prevent infinite re-renders
export const usePlayer = () => useGameStore((state) => state.player);
export const useTown = () => useGameStore((state) => state.town);
export const useGameLogs = () => useGameStore((state) => state.logs);
export const useGameLoading = () => useGameStore((state) => state.isLoading);
export const useGameError = () => useGameStore((state) => state.error);
export const useConnectionStatus = () =>
  useGameStore((state) => state.connectionStatus);

// Memoized computed selectors to prevent object recreation
const emptySkills = {};
const emptyInventory = {};

export const usePlayerSkills = () =>
  useGameStore((state) => state.player?.skills || emptySkills);
export const usePlayerInventory = () =>
  useGameStore((state) => state.player?.inventory || emptyInventory);

// Stable object for player stats
export const usePlayerStats = () =>
  useGameStore((state) => {
    if (!state.player) return null;
    return {
      strength: state.player.strength,
      stamina: state.player.stamina,
      coins: state.player.coins,
      reputation: state.player.reputation,
    };
  });

// Stable action selectors - cache the action object
let cachedActions: any = null;

export const useGameActions = () => {
  return useGameStore((state) => {
    // Only recreate actions object if functions have changed
    if (
      !cachedActions ||
      cachedActions.initializeGame !== state.initializeGame ||
      cachedActions.refreshGameData !== state.refreshGameData
    ) {
      cachedActions = {
        initializeGame: state.initializeGame,
        refreshGameData: state.refreshGameData,
        setPlayer: state.setPlayer,
        setTown: state.setTown,
        addLog: state.addLog,
        addLogs: state.addLogs,
        setLoading: state.setLoading,
        setError: state.setError,
        clearError: state.clearError,
        updatePlayerOptimistic: state.updatePlayerOptimistic,
        updateTownOptimistic: state.updateTownOptimistic,
        resetGame: state.resetGame,
      };
    }
    return cachedActions;
  });
};
