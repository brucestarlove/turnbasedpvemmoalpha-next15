"use client";

import { useEffect, useState } from "react";

import { getPlayerData, getTownData } from "@/actions/game-actions";
import type { Player, Town } from "@/lib/schema";

export function useGameState(userId: string) {
  const [playerData, setPlayerData] = useState<Player | null>(null);
  const [townData, setTownData] = useState<Town | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadGameData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [playerResult, townResult] = await Promise.all([
          getPlayerData(userId),
          getTownData(),
        ]);

        if (!mounted) return;

        if (!playerResult.success) {
          setError(playerResult.error || "Failed to load player data");
          return;
        }

        if (!townResult.success) {
          setError(townResult.error || "Failed to load town data");
          return;
        }

        setPlayerData(playerResult.data);
        setTownData(townResult.data);
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

    // Set up polling for real-time updates (every 5 seconds)
    const interval = setInterval(async () => {
      if (!mounted) return;

      try {
        const [playerResult, townResult] = await Promise.all([
          getPlayerData(userId),
          getTownData(),
        ]);

        if (mounted && playerResult.success) {
          setPlayerData(playerResult.data);
        }

        if (mounted && townResult.success) {
          setTownData(townResult.data);
        }
      } catch (err) {
        console.error("Error updating game data:", err);
      }
    }, 5000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [userId]);

  const refreshData = async () => {
    try {
      const [playerResult, townResult] = await Promise.all([
        getPlayerData(userId),
        getTownData(),
      ]);

      if (playerResult.success) {
        setPlayerData(playerResult.data);
      }

      if (townResult.success) {
        setTownData(townResult.data);
      }
    } catch (err) {
      console.error("Error refreshing game data:", err);
    }
  };

  return {
    playerData,
    townData,
    isLoading,
    error,
    refreshData,
  };
}
