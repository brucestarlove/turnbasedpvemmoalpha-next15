"use client";

import Link from "next/link";
import { useState } from "react";

import { resetGameData } from "@/actions/game-actions";
import { ActionPanel } from "@/components/game/action-panel";
import { CooldownTimer } from "@/components/game/cooldown-timer";
import { GameLogPanel } from "@/components/game/game-log";
import { PlayerPanel } from "@/components/game/player-panel";
import { SkillsPanel } from "@/components/game/skills-panel";
import { TownPanel } from "@/components/game/town-panel";
import { Icons } from "@/components/icons";
import { buttonVariants } from "@/components/ui/button";
import { useGameState } from "@/hooks/use-game-state";

type GameLayoutProps = {
  userId: string;
};

type ActivePane =
  | "info"
  | "skills"
  | "inventory"
  | "skills-missions"
  | "combat-missions"
  | "crafting"
  | "map";

export const GameLayout = ({ userId }: GameLayoutProps) => {
  const [activeLeftPane, setActiveLeftPane] = useState<ActivePane>("info");
  const [activeRightPane, setActiveRightPane] =
    useState<ActivePane>("skills-missions");
  const [isResetting, setIsResetting] = useState(false);

  const { playerData, townData, gameLogs, isLoading, error, refreshData } =
    useGameState(userId);

  const handleReset = async () => {
    if (
      !confirm(
        "Are you sure you want to reset all game data? This cannot be undone!",
      )
    ) {
      return;
    }

    setIsResetting(true);
    try {
      await resetGameData(userId);
    } catch (error) {
      console.error("Failed to reset game data:", error);
    } finally {
      setIsResetting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
        <div className="text-center">
          <Icons.loading className="text-starlight mx-auto mb-4 h-10 w-10 animate-spin" />
          <p className="text-lg font-semibold">Loading Game Data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center">
          <p className="text-destructive">Error loading game data: {error}</p>
          <Link
            href="/"
            className={buttonVariants({
              variant: "starlight",
              className: "mt-4",
            })}
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl p-4">
      {/* Game Header */}
      <header className="border-border/40 bg-background/80 mb-4 w-full rounded-lg border-b backdrop-blur-sm">
        <div className="flex h-16 items-center justify-between px-4">
          <Link href="/" className="text-starlight font-mono text-lg font-bold">
            Starscape
          </Link>
          <div className="flex items-center gap-2">
            <CooldownTimer
              userId={userId}
              playerData={playerData}
              onRefresh={refreshData}
            />
            <button
              onClick={handleReset}
              disabled={isResetting}
              className={buttonVariants({ variant: "destructive", size: "sm" })}
            >
              {isResetting ? (
                <Icons.loading className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Icons.refresh className="mr-2 h-4 w-4" />
              )}
              {isResetting ? "Resetting..." : "Reset Game"}
            </button>
            <Link
              href="/"
              className={buttonVariants({ variant: "glass", size: "sm" })}
            >
              <Icons.home className="mr-2 h-4 w-4" />
              Exit Game
            </Link>
          </div>
        </div>
      </header>

      <div className="flex gap-4">
        {/* Left-hand Navigation */}
        <div className="bg-card/50 flex flex-col space-y-2 rounded-lg border p-2 backdrop-blur-sm">
          {/* Player Info Navigation */}
          <button
            onClick={() => setActiveLeftPane("info")}
            className={`nav-btn hover:bg-accent rounded-md p-2 transition-all ${
              activeLeftPane === "info"
                ? "bg-accent text-accent-foreground"
                : ""
            }`}
            title="Player Info"
          >
            <Icons.user className="h-5 w-5" />
          </button>

          <button
            onClick={() => setActiveLeftPane("skills")}
            className={`nav-btn hover:bg-accent rounded-md p-2 transition-all ${
              activeLeftPane === "skills"
                ? "bg-accent text-accent-foreground"
                : ""
            }`}
            title="Skills"
          >
            <Icons.star className="h-5 w-5" />
          </button>

          <button
            onClick={() => setActiveLeftPane("inventory")}
            className={`nav-btn hover:bg-accent rounded-md p-2 transition-all ${
              activeLeftPane === "inventory"
                ? "bg-accent text-accent-foreground"
                : ""
            }`}
            title="Inventory"
          >
            <Icons.package className="h-5 w-5" />
          </button>

          <hr className="border-border/50 my-2" />

          {/* Game Features Navigation */}
          <button
            onClick={() => setActiveRightPane("skills-missions")}
            className={`nav-btn hover:bg-accent rounded-md p-2 transition-all ${
              activeRightPane === "skills-missions"
                ? "bg-accent text-accent-foreground"
                : ""
            }`}
            title="Skills Mission Board"
          >
            <Icons.clipboard className="h-5 w-5" />
          </button>

          {townData?.unlockedMissions?.includes("m103") && (
            <button
              onClick={() => setActiveRightPane("combat-missions")}
              className={`nav-btn hover:bg-accent rounded-md p-2 transition-all ${
                activeRightPane === "combat-missions"
                  ? "bg-accent text-accent-foreground"
                  : ""
              }`}
              title="Combat Mission Board"
            >
              <Icons.sword className="h-5 w-5" />
            </button>
          )}

          {townData?.upgrades?.crafting_station_unlocked && (
            <button
              onClick={() => setActiveRightPane("crafting")}
              className={`nav-btn hover:bg-accent rounded-md p-2 transition-all ${
                activeRightPane === "crafting"
                  ? "bg-accent text-accent-foreground"
                  : ""
              }`}
              title="Crafting Station"
            >
              <Icons.hammer className="h-5 w-5" />
            </button>
          )}

          {townData?.upgrades?.map_unlocked && (
            <button
              onClick={() => setActiveRightPane("map")}
              className={`nav-btn hover:bg-accent rounded-md p-2 transition-all ${
                activeRightPane === "map"
                  ? "bg-accent text-accent-foreground"
                  : ""
              }`}
              title="Map"
            >
              <Icons.map className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Main Content Area */}
        <div className="grid flex-grow grid-cols-1 gap-4 md:grid-cols-3">
          {/* Left Column: Player Info & Town */}
          <div className="space-y-4 md:col-span-1">
            {/* Player Panel */}
            {activeLeftPane === "info" && (
              <PlayerPanel playerData={playerData} />
            )}

            {activeLeftPane === "skills" && (
              <SkillsPanel playerData={playerData} />
            )}

            {activeLeftPane === "inventory" && (
              <div className="bg-card/50 rounded-lg border p-4 shadow-lg backdrop-blur-sm">
                <h2 className="border-border mb-2 border-b pb-2 text-xl font-bold">
                  Inventory
                </h2>
                <div className="h-64 space-y-1 overflow-y-auto text-sm">
                  {playerData?.inventory &&
                  Object.keys(playerData.inventory).length > 0 ? (
                    Object.entries(playerData.inventory).map(
                      ([item, quantity]) => (
                        <p key={item}>
                          {item
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                          : {quantity}
                        </p>
                      ),
                    )
                  ) : (
                    <p className="text-muted-foreground">
                      Your inventory is empty.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Town Panel */}
            <TownPanel
              townData={townData}
              playerData={playerData}
              userId={userId}
              onRefresh={refreshData}
            />
          </div>

          {/* Right Column: Actions, Missions, Logs */}
          <div className="space-y-4 md:col-span-2">
            {/* Action Panel */}
            <ActionPanel
              activePane={activeRightPane}
              playerData={playerData}
              townData={townData}
              userId={userId}
              onRefresh={refreshData}
            />

            {/* Game Log */}
            <GameLogPanel logs={gameLogs} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </div>
  );
};
