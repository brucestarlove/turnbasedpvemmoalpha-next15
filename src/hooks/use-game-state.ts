"use client";

import { useEffect, useState } from "react";

import { getGameState } from "@/actions/game-actions";
import type { Player, Town } from "@/lib/schema";

type GameLogData = {
  id: string;
  playerId: string;
  message: string;
  type: string;
  timestamp: Date;
};

export function useGameState(userId: string) {
  const [playerData, setPlayerData] = useState<Player | null>(null);
  const [townData, setTownData] = useState<Town | null>(null);
  const [gameLogs, setGameLogs] = useState<GameLogData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadGameData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Single batched call instead of multiple requests
        const result = await getGameState(userId);

        if (!mounted) return;

        if (!result.success) {
          setError(result.error || "Failed to load game data");
          return;
        }

        setPlayerData(result.data.player);
        setTownData(result.data.town);
        setGameLogs(result.data.logs);
      } catch (err) {
        if (!mounted) return;
        setError("Failed to load game data");
        console.error("Error loading game data:", err);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadGameData();

    // Set up polling for real-time updates (every 10 seconds, reduced frequency)
    const interval = setInterval(async () => {
      if (!mounted) return;

      try {
        // Single batched call for updates
        const result = await getGameState(userId);

        if (mounted && result.success) {
          setPlayerData(result.data.player);
          setTownData(result.data.town);
          setGameLogs(result.data.logs);
        }
      } catch (err) {
        console.error("Error updating game data:", err);
      }
    }, 10000); // Increased from 5s to 10s

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [userId]);

  const refreshData = async () => {
    try {
      // Single batched call for manual refresh
      const result = await getGameState(userId);

      if (result.success) {
        setPlayerData(result.data.player);
        setTownData(result.data.town);
        setGameLogs(result.data.logs);
      }
    } catch (err) {
      console.error("Error refreshing game data:", err);
    }
  };

  return {
    playerData,
    townData,
    gameLogs,
    isLoading,
    error,
    refreshData,
  };
}
