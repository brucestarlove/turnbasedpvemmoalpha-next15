"use client";

import { useState } from "react";

import { startMission } from "@/actions/game-actions";
import { Icons } from "@/components/icons";
import { buttonVariants } from "@/components/ui/button";
import {
  getAvailableCraftingRecipes,
  getAvailableMissions,
} from "@/lib/game-config";
import type { Player, Town } from "@/lib/schema";

type ActionPanelProps = {
  activePane: string;
  playerData: Player | null;
  townData: Town | null;
  userId: string;
};

export const ActionPanel = ({
  activePane,
  playerData,
  townData,
  userId,
}: ActionPanelProps) => {
  const [isStartingMission, setIsStartingMission] = useState<string | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const handleStartMission = async (missionId: string) => {
    setError(null);
    setIsStartingMission(missionId);
    try {
      const result = await startMission(userId, missionId);
      if (!result.success) {
        setError(result.error || "Failed to start mission");
      }
    } catch (error) {
      console.error("Failed to start mission:", error);
      setError("Failed to start mission");
    } finally {
      setIsStartingMission(null);
    }
  };

  const handleStartCrafting = async (recipeId: string) => {
    setError(null);
    setIsStartingMission(recipeId);
    try {
      const result = await startMission(userId, recipeId);
      if (!result.success) {
        setError(result.error || "Failed to start crafting");
      }
    } catch (error) {
      console.error("Failed to start crafting:", error);
      setError("Failed to start crafting");
    } finally {
      setIsStartingMission(null);
    }
  };

  // Skills Mission Board
  if (activePane === "skills-missions") {
    const availableMissions = getAvailableMissions(
      townData?.unlockedTerritories || [],
      townData?.unlockedMissions || [],
    ).filter((mission) => mission.category === "skill");

    return (
      <div className="bg-card/50 rounded-lg border p-4 shadow-lg backdrop-blur-sm">
        <h2 className="border-border mb-4 flex items-center gap-2 border-b pb-2 text-xl font-bold">
          <Icons.clipboard className="text-starlight h-5 w-5" />
          Skills Mission Board
        </h2>

        {error && (
          <div className="bg-destructive/20 border-destructive/30 mb-4 flex items-center gap-2 rounded-md border p-3">
            <Icons.alertTriangle className="text-destructive h-4 w-4" />
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        {playerData?.currentMission && (
          <div className="bg-starlight/20 border-starlight/30 mb-4 rounded-md border p-3">
            <p className="text-starlight text-sm font-medium">
              Currently on mission: {playerData.currentMission.name}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {availableMissions.map((mission) => {
            const rewards = mission.rewards;
            const skillRequired = mission.skill_required;

            return (
              <div
                key={mission.id}
                className="bg-background/30 hover:border-starlight/50 rounded-lg border p-4 transition-colors"
              >
                <div className="flex-1">
                  <div className="mb-2 flex items-start justify-between">
                    <h3 className="text-base font-bold">{mission.name}</h3>
                    <div className="text-starlight bg-starlight/20 rounded px-2 py-1 text-xs">
                      {mission.duration_minutes}min
                    </div>
                  </div>

                  <p className="text-muted-foreground mb-3 line-clamp-2 text-xs">
                    {mission.description}
                  </p>

                  {skillRequired && (
                    <div className="mb-3">
                      <p className="text-xs text-amber-400">
                        Requires: {skillRequired.skill} Level{" "}
                        {skillRequired.level}
                      </p>
                    </div>
                  )}

                  {rewards && (
                    <div className="mb-3 space-y-1">
                      <p className="text-xs font-medium text-green-400">
                        Rewards:
                      </p>
                      {rewards.xp &&
                        Object.entries(rewards.xp).map(([skill, amount]) => (
                          <p key={skill} className="text-xs text-emerald-300">
                            +{amount} {skill} XP
                          </p>
                        ))}
                      {rewards.items &&
                        Object.entries(rewards.items).map(([item, amount]) => (
                          <p key={item} className="text-xs text-blue-300">
                            +{amount} {item.replace(/_/g, " ")}
                          </p>
                        ))}
                      {rewards.coins && (
                        <p className="text-xs text-yellow-300">
                          +{rewards.coins} coins
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleStartMission(mission.id!)}
                  disabled={
                    isStartingMission === mission.id ||
                    !!playerData?.currentMission
                  }
                  className={buttonVariants({
                    variant: "starlight",
                    size: "sm",
                    className: "w-full",
                  })}
                >
                  {isStartingMission === mission.id ? (
                    <div className="flex items-center gap-2">
                      <Icons.loading className="h-4 w-4 animate-spin" />
                      Starting...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Icons.play className="h-4 w-4" />
                      Start Mission
                    </div>
                  )}
                </button>
              </div>
            );
          })}
          {availableMissions.length === 0 && (
            <div className="col-span-full py-12 text-center">
              <Icons.clipboard className="text-muted-foreground mx-auto mb-4 h-12 w-12 opacity-50" />
              <p className="text-muted-foreground font-medium">
                No skills missions available
              </p>
              <p className="text-muted-foreground mt-1 text-sm">
                Explore new territories to unlock more missions
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Combat Mission Board
  if (activePane === "combat-missions") {
    const availableMissions = getAvailableMissions(
      townData?.unlockedTerritories || [],
      townData?.unlockedMissions || [],
    ).filter((mission) => mission.category === "combat");

    return (
      <div className="bg-card/50 rounded-lg border p-4 shadow-lg backdrop-blur-sm">
        <h2 className="border-border mb-4 flex items-center gap-2 border-b pb-2 text-xl font-bold">
          <Icons.sword className="text-cosmic h-5 w-5" />
          Combat Mission Board
        </h2>

        {error && (
          <div className="bg-destructive/20 border-destructive/30 mb-4 flex items-center gap-2 rounded-md border p-3">
            <Icons.alertTriangle className="text-destructive h-4 w-4" />
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        {playerData?.currentMission && (
          <div className="bg-cosmic/20 border-cosmic/30 mb-4 rounded-md border p-3">
            <p className="text-cosmic text-sm font-medium">
              Currently on mission: {playerData.currentMission.name}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {availableMissions.map((mission) => {
            const rewards = mission.rewards;
            const skillRequired = mission.skill_required;

            return (
              <div
                key={mission.id}
                className="bg-background/30 hover:border-cosmic/50 rounded-lg border p-4 transition-colors"
              >
                <div className="flex-1">
                  <div className="mb-2 flex items-start justify-between">
                    <h3 className="text-base font-bold">{mission.name}</h3>
                    <div className="text-cosmic bg-cosmic/20 rounded px-2 py-1 text-xs">
                      {mission.duration_minutes}min
                    </div>
                  </div>

                  <p className="text-muted-foreground mb-3 line-clamp-2 text-xs">
                    {mission.description}
                  </p>

                  {skillRequired && (
                    <div className="mb-3">
                      <p className="text-xs text-red-400">
                        Requires: {skillRequired.skill} Level{" "}
                        {skillRequired.level}
                      </p>
                    </div>
                  )}

                  {rewards && (
                    <div className="mb-3 space-y-1">
                      <p className="text-xs font-medium text-green-400">
                        Rewards:
                      </p>
                      {rewards.xp &&
                        Object.entries(rewards.xp).map(([skill, amount]) => (
                          <p key={skill} className="text-xs text-emerald-300">
                            +{amount} {skill} XP
                          </p>
                        ))}
                      {rewards.items &&
                        Object.entries(rewards.items).map(([item, amount]) => (
                          <p key={item} className="text-xs text-blue-300">
                            +{amount} {item.replace(/_/g, " ")}
                          </p>
                        ))}
                      {rewards.coins && (
                        <p className="text-xs text-yellow-300">
                          +{rewards.coins} coins
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleStartMission(mission.id!)}
                  disabled={
                    isStartingMission === mission.id ||
                    !!playerData?.currentMission
                  }
                  className={buttonVariants({
                    variant: "cosmic",
                    size: "sm",
                    className: "w-full",
                  })}
                >
                  {isStartingMission === mission.id ? (
                    <div className="flex items-center gap-2">
                      <Icons.loading className="h-4 w-4 animate-spin" />
                      Starting...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Icons.sword className="h-4 w-4" />
                      Enter Combat
                    </div>
                  )}
                </button>
              </div>
            );
          })}
          {availableMissions.length === 0 && (
            <div className="col-span-full py-12 text-center">
              <Icons.sword className="text-muted-foreground mx-auto mb-4 h-12 w-12 opacity-50" />
              <p className="text-muted-foreground font-medium">
                No combat missions available
              </p>
              <p className="text-muted-foreground mt-1 text-sm">
                Complete more skills missions to unlock combat
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Crafting Station
  if (activePane === "crafting") {
    const availableRecipes = getAvailableCraftingRecipes(
      townData?.upgrades?.crafting_station_unlocked || false,
    );

    return (
      <div className="bg-card/50 rounded-lg border p-4 shadow-lg backdrop-blur-sm">
        <h2 className="border-border mb-4 flex items-center gap-2 border-b pb-2 text-xl font-bold">
          <Icons.hammer className="h-5 w-5 text-orange-400" />
          Crafting Station
        </h2>

        {error && (
          <div className="bg-destructive/20 border-destructive/30 mb-4 flex items-center gap-2 rounded-md border p-3">
            <Icons.alertTriangle className="text-destructive h-4 w-4" />
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        {!townData?.upgrades?.crafting_station_unlocked && (
          <div className="mb-4 rounded-md border border-amber-500/30 bg-amber-500/20 p-3">
            <p className="text-sm font-medium text-amber-400">
              Crafting station not unlocked yet. Complete town objectives to
              unlock.
            </p>
          </div>
        )}

        {playerData?.currentMission && (
          <div className="mb-4 rounded-md border border-orange-500/30 bg-orange-500/20 p-3">
            <p className="text-sm font-medium text-orange-400">
              Currently crafting: {playerData.currentMission.name}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {availableRecipes.map((recipe) => {
            const hasRequiredItems =
              recipe.cost &&
              Object.entries(recipe.cost).every(([item, amount]) => {
                const playerAmount = playerData?.inventory?.[item] || 0;
                return playerAmount >= amount;
              });

            return (
              <div
                key={recipe.id}
                className="bg-background/30 rounded-lg border p-4 transition-colors hover:border-orange-400/50"
              >
                <div className="flex-1">
                  <div className="mb-2 flex items-start justify-between">
                    <h3 className="text-base font-bold">{recipe.name}</h3>
                    <div className="rounded bg-orange-400/20 px-2 py-1 text-xs text-orange-400">
                      {recipe.duration_minutes || 5}min
                    </div>
                  </div>

                  <p className="text-muted-foreground mb-3 line-clamp-2 text-xs">
                    {recipe.description}
                  </p>

                  {recipe.cost && (
                    <div className="mb-3">
                      <p className="mb-1 text-xs font-medium text-red-400">
                        Required Materials:
                      </p>
                      <div className="space-y-1">
                        {Object.entries(recipe.cost).map(([item, amount]) => {
                          const playerAmount =
                            playerData?.inventory?.[item] || 0;
                          const hasEnough = playerAmount >= amount;

                          return (
                            <p
                              key={item}
                              className={`text-xs ${hasEnough ? "text-green-400" : "text-red-400"}`}
                            >
                              {amount} {item.replace(/_/g, " ")}
                              <span className="text-muted-foreground ml-1">
                                ({playerAmount} owned)
                              </span>
                            </p>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {recipe.result && (
                    <div className="mb-3">
                      <p className="mb-1 text-xs font-medium text-green-400">
                        Produces:
                      </p>
                      <p className="text-xs text-blue-300">
                        {recipe.result.amount}{" "}
                        {recipe.result.item.replace(/_/g, " ")}
                      </p>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleStartCrafting(recipe.id!)}
                  disabled={
                    isStartingMission === recipe.id ||
                    !!playerData?.currentMission ||
                    !hasRequiredItems
                  }
                  className={buttonVariants({
                    variant: hasRequiredItems ? "glass" : "ghost",
                    size: "sm",
                    className: "w-full",
                  })}
                >
                  {isStartingMission === recipe.id ? (
                    <div className="flex items-center gap-2">
                      <Icons.loading className="h-4 w-4 animate-spin" />
                      Crafting...
                    </div>
                  ) : !hasRequiredItems ? (
                    <div className="flex items-center gap-2">
                      <Icons.alertTriangle className="h-4 w-4" />
                      Need Materials
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Icons.hammer className="h-4 w-4" />
                      Start Crafting
                    </div>
                  )}
                </button>
              </div>
            );
          })}
          {availableRecipes.length === 0 && (
            <div className="col-span-full py-12 text-center">
              <Icons.hammer className="text-muted-foreground mx-auto mb-4 h-12 w-12 opacity-50" />
              <p className="text-muted-foreground font-medium">
                {townData?.upgrades?.crafting_station_unlocked
                  ? "No recipes available yet"
                  : "Crafting station locked"}
              </p>
              <p className="text-muted-foreground mt-1 text-sm">
                {townData?.upgrades?.crafting_station_unlocked
                  ? "Discover recipes through exploration"
                  : "Complete town objectives to unlock"}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Map
  if (activePane === "map") {
    return (
      <div className="bg-card/50 rounded-lg border p-4 shadow-lg backdrop-blur-sm">
        <h2 className="border-border mb-4 flex items-center gap-2 border-b pb-2 text-xl font-bold">
          <Icons.map className="h-5 w-5 text-blue-400" />
          World Map
        </h2>

        <div className="bg-background/30 rounded-lg border p-12 text-center">
          <Icons.map className="text-muted-foreground mx-auto mb-4 h-16 w-16 opacity-50" />
          <p className="mb-2 text-lg font-medium">
            The world is vast and unknown
          </p>
          <p className="text-muted-foreground mb-4 text-sm">
            More territories will be revealed as the town grows and explorers
            venture forth.
          </p>

          {townData?.unlockedTerritories &&
            townData.unlockedTerritories.length > 0 && (
              <div className="mt-6">
                <h3 className="mb-3 text-base font-semibold">
                  Discovered Territories:
                </h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {townData.unlockedTerritories.map((territory) => (
                    <div
                      key={territory}
                      className="bg-starlight/20 border-starlight/30 rounded-lg border px-3 py-1"
                    >
                      <span className="text-starlight text-sm capitalize">
                        {territory.replace(/_/g, " ")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card/50 rounded-lg border p-4 shadow-lg backdrop-blur-sm">
      <div className="py-12 text-center">
        <Icons.info className="text-muted-foreground mx-auto mb-4 h-12 w-12 opacity-50" />
        <p className="text-muted-foreground">
          Select an action from the navigation menu
        </p>
      </div>
    </div>
  );
};
