"use client";

import { useEffect, useState } from "react";

import { resolveMission } from "@/actions/game-actions";
import { Icons } from "@/components/icons";
import { COOLDOWN_MS } from "@/lib/game-config";
import type { Player } from "@/lib/schema";

type CooldownTimerProps = {
  userId: string;
  playerData: Player | null;
  onRefresh?: () => Promise<void>;
};

export const CooldownTimer = ({
  userId,
  playerData,
  onRefresh,
}: CooldownTimerProps) => {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isOnCooldown, setIsOnCooldown] = useState(false);
  const [currentMission, setCurrentMission] = useState<{
    name: string;
    id: string;
  } | null>(null);
  const [isResolving, setIsResolving] = useState(false);

  useEffect(() => {
    if (!playerData) return;

    const updateTimer = () => {
      const now = Date.now();
      const lastAction = playerData.lastActionTimestamp?.getTime() || 0;
      const timeSinceLastAction = now - lastAction;

      if (playerData.currentMission) {
        setCurrentMission(playerData.currentMission);
        const endTime = lastAction + COOLDOWN_MS;
        const remaining = Math.max(0, endTime - now);

        if (remaining <= 0 && !isResolving) {
          // Mission is complete, resolve it
          setIsResolving(true);
          resolveMission(userId)
            .then(() => {
              setCurrentMission(null);
              setIsOnCooldown(false);
              setTimeRemaining(0);
              // Refresh game state after mission resolution
              if (onRefresh) {
                onRefresh();
              }
            })
            .catch((error) => {
              console.error("Failed to resolve mission:", error);
            })
            .finally(() => {
              setIsResolving(false);
            });
        } else {
          setIsOnCooldown(true);
          setTimeRemaining(remaining);
        }
      } else if (timeSinceLastAction < COOLDOWN_MS) {
        setCurrentMission(null);
        setIsOnCooldown(true);
        setTimeRemaining(COOLDOWN_MS - timeSinceLastAction);
      } else {
        setCurrentMission(null);
        setIsOnCooldown(false);
        setTimeRemaining(0);
      }
    };

    // Update immediately
    updateTimer();

    // Only set up interval if there's actually a cooldown/mission running
    let interval: NodeJS.Timeout | null = null;
    if (isOnCooldown || playerData.currentMission) {
      interval = setInterval(updateTimer, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [userId, playerData, isResolving, isOnCooldown, onRefresh]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const progress = isOnCooldown
    ? ((COOLDOWN_MS - timeRemaining) / COOLDOWN_MS) * 100
    : 0;

  // Mission completing state
  if (isResolving) {
    return (
      <div className="bg-starlight/20 border-starlight/30 min-w-[160px] rounded-lg border px-4 py-2">
        <div className="mb-1 flex items-center gap-2">
          <Icons.loading className="text-starlight h-4 w-4 animate-spin" />
          <p className="text-starlight text-sm font-medium">
            Mission Complete!
          </p>
        </div>
        <p className="text-starlight/80 text-xs">Collecting rewards...</p>
      </div>
    );
  }

  // Ready state
  if (!isOnCooldown) {
    return (
      <div className="min-w-[160px] rounded-lg border border-green-500/30 bg-gradient-to-r from-green-500/20 to-emerald-500/20 px-4 py-2">
        <div className="flex items-center gap-2">
          <Icons.zap className="h-4 w-4 text-green-400" />
          <div>
            <p className="text-sm font-medium text-green-400">
              Ready for Action!
            </p>
            <p className="text-xs text-green-300">Select a mission to begin</p>
          </div>
        </div>
      </div>
    );
  }

  // Mission in progress or cooldown
  const isMissionActive = !!currentMission;
  const borderColor = isMissionActive
    ? "border-starlight/30"
    : "border-orange-500/30";
  const bgColor = isMissionActive ? "bg-starlight/20" : "bg-orange-500/20";
  const textColor = isMissionActive ? "text-starlight" : "text-orange-400";
  const progressColor = isMissionActive ? "bg-starlight" : "bg-orange-400";
  const progressBgColor = isMissionActive
    ? "bg-starlight/30"
    : "bg-orange-500/30";

  return (
    <div
      className={`${bgColor} border ${borderColor} min-w-[160px] rounded-lg px-4 py-2`}
    >
      <div className="mb-1 flex items-center gap-2">
        <Icons.clock className={`h-4 w-4 ${textColor}`} />
        <div className="flex-1">
          <p className={`${textColor} text-sm font-medium`}>
            {isMissionActive ? "On Mission" : "Cooldown"}
          </p>
          {isMissionActive && currentMission && (
            <p className={`${textColor}/80 max-w-[120px] truncate text-xs`}>
              {currentMission.name}
            </p>
          )}
        </div>
      </div>

      <div className="mb-2 flex items-center gap-2">
        <p className={`${textColor}/90 font-mono text-sm`}>
          {formatTime(timeRemaining)}
        </p>
        <div className="flex-1">
          <div className={`w-full ${progressBgColor} h-2 rounded-full`}>
            <div
              className={`${progressColor} h-2 rounded-full transition-all duration-1000 ease-linear`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* {isMissionActive && progress > 50 && (
        <p className={`${textColor}/70 text-center text-xs`}>
          Nearly complete...
        </p>
      )} */}
    </div>
  );
};
