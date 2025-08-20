"use client";

import { useState } from "react";

import { contributeToTown } from "@/actions/game-actions";
import { Icons } from "@/components/icons";
import { buttonVariants } from "@/components/ui/button";
import { getCurrentObjective } from "@/lib/game-config";
import type { Player, Town } from "@/lib/schema";

type TownPanelProps = {
  townData: Town | null;
  playerData: Player | null;
  userId: string;
};

export const TownPanel = ({ townData, playerData, userId }: TownPanelProps) => {
  const [resourceName, setResourceName] = useState("");
  const [resourceAmount, setResourceAmount] = useState("");
  const [isContributing, setIsContributing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!townData) {
    return (
      <div className="bg-card/50 rounded-lg border p-4 shadow-lg backdrop-blur-sm">
        <h2 className="border-border mb-2 flex items-center gap-2 border-b pb-2 text-xl font-bold">
          <Icons.home className="h-5 w-5" />
          Town Center
        </h2>
        <div className="flex h-32 items-center justify-center">
          <Icons.loading className="text-starlight h-6 w-6 animate-spin" />
        </div>
      </div>
    );
  }

  const currentObjective = getCurrentObjective(
    townData.completedObjectives || [],
  );

  const availableItems = playerData?.inventory
    ? Object.entries(playerData.inventory).filter(
        ([, quantity]) => quantity > 0,
      )
    : [];

  const handleContribute = async () => {
    setError(null);

    if (!resourceName) {
      setError("Please select a resource");
      return;
    }

    if (!resourceAmount.trim()) {
      setError("Please enter an amount");
      return;
    }

    const amount = parseInt(resourceAmount);
    if (isNaN(amount)) {
      setError("Amount must be a valid number");
      return;
    }

    if (amount <= 0) {
      setError("Amount must be greater than 0");
      return;
    }

    const availableAmount = playerData?.inventory?.[resourceName] || 0;
    if (amount > availableAmount) {
      setError(
        `You only have ${availableAmount} ${resourceName.replace(/_/g, " ")}`,
      );
      return;
    }

    setIsContributing(true);
    try {
      const result = await contributeToTown(userId, resourceName, amount);
      if (result.success) {
        setResourceName("");
        setResourceAmount("");
        setError(null);
      } else {
        setError(result.error || "Failed to contribute");
      }
    } catch (error) {
      console.error("Failed to contribute:", error);
      setError("Failed to contribute to town");
    } finally {
      setIsContributing(false);
    }
  };

  const calculateObjectiveProgress = (
    objective: { type: string; requirements: Record<string, number> } | null,
  ) => {
    if (!objective) return 0;

    if (objective.type === "contribution") {
      const totalRequired = Object.values(objective.requirements).reduce(
        (sum: number, req: number) => sum + req,
        0,
      );
      const totalCurrent = Object.entries(objective.requirements).reduce(
        (sum, [resource, required]: [string, number]) => {
          return sum + Math.min(townData.treasury?.[resource] || 0, required);
        },
        0,
      );
      return totalRequired > 0 ? (totalCurrent / totalRequired) * 100 : 0;
    }

    if (objective.type === "slay") {
      const totalRequired = Object.values(objective.requirements).reduce(
        (sum: number, req: number) => sum + req,
        0,
      );
      const totalCurrent = Object.entries(objective.requirements).reduce(
        (sum, [enemy, required]: [string, number]) => {
          return sum + Math.min(townData.slayCounts?.[enemy] || 0, required);
        },
        0,
      );
      return totalRequired > 0 ? (totalCurrent / totalRequired) * 100 : 0;
    }

    return 0;
  };

  const objectiveProgress = calculateObjectiveProgress(currentObjective);

  return (
    <div className="bg-card/50 rounded-lg border p-4 shadow-lg backdrop-blur-sm">
      <h2 className="border-border mb-3 flex items-center gap-2 border-b pb-2 text-xl font-bold">
        <Icons.home className="text-starlight h-5 w-5" />
        Town Center
      </h2>

      <div className="space-y-4">
        {/* Town Level */}
        <div className="bg-background/30 flex items-center justify-between rounded-lg border p-3">
          <div className="flex items-center gap-2">
            <div className="bg-starlight h-3 w-3 rounded-full"></div>
            <span className="font-medium">Town Level</span>
          </div>
          <span className="text-starlight text-lg font-bold">
            {townData.level}
          </span>
        </div>

        {/* Current Objective */}
        <div className="bg-background/30 rounded-lg border p-3">
          <h3 className="mb-3 flex items-center gap-2 text-base font-semibold">
            <Icons.target className="h-4 w-4 text-yellow-400" />
            Current Objective
          </h3>

          {currentObjective ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">{currentObjective.name}</span>
                <span className="text-muted-foreground text-sm">
                  {Math.round(objectiveProgress)}%
                </span>
              </div>

              <div className="bg-muted/30 h-2 w-full rounded-full">
                <div
                  className="from-starlight to-cosmic h-2 rounded-full bg-gradient-to-r transition-all duration-300"
                  style={{ width: `${objectiveProgress}%` }}
                />
              </div>

              <div className="space-y-1 text-sm">
                {currentObjective.type === "contribution" &&
                  Object.entries(currentObjective.requirements).map(
                    ([resource, amount]) => {
                      const currentAmount = townData.treasury?.[resource] || 0;
                      const isComplete = currentAmount >= amount;
                      return (
                        <div
                          key={resource}
                          className="flex items-center justify-between"
                        >
                          <span className="flex items-center gap-1">
                            {isComplete ? "✅" : "📦"}
                            {resource
                              .replace(/_/g, " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                            :
                          </span>
                          <span
                            className={
                              isComplete ? "text-green-400" : "text-foreground"
                            }
                          >
                            {currentAmount} / {amount}
                          </span>
                        </div>
                      );
                    },
                  )}
                {currentObjective.type === "slay" &&
                  Object.entries(currentObjective.requirements).map(
                    ([enemy, count]) => {
                      const currentCount = townData.slayCounts?.[enemy] || 0;
                      const isComplete = currentCount >= count;
                      return (
                        <div
                          key={enemy}
                          className="flex items-center justify-between"
                        >
                          <span className="flex items-center gap-1">
                            {isComplete ? "✅" : "⚔️"}
                            Slay {enemy}:
                          </span>
                          <span
                            className={
                              isComplete ? "text-green-400" : "text-foreground"
                            }
                          >
                            {currentCount} / {count}
                          </span>
                        </div>
                      );
                    },
                  )}
              </div>
            </div>
          ) : (
            <div className="py-4 text-center">
              <div className="mb-2 text-green-400">🎉</div>
              <p className="font-medium text-green-400">
                All objectives complete!
              </p>
              <p className="text-muted-foreground text-sm">
                Great work, citizens!
              </p>
            </div>
          )}
        </div>

        {/* Treasury */}
        <div className="bg-background/30 rounded-lg border p-3">
          <h3 className="mb-3 flex items-center gap-2 text-base font-semibold">
            <Icons.package className="h-4 w-4 text-amber-400" />
            Treasury
          </h3>

          <div className="max-h-32 space-y-1 overflow-y-auto">
            {townData.treasury && Object.keys(townData.treasury).length > 0 ? (
              Object.entries(townData.treasury)
                .sort(([, a], [, b]) => b - a)
                .map(([item, quantity]) => (
                  <div
                    key={item}
                    className="flex items-center justify-between py-1 text-sm"
                  >
                    <span className="capitalize">
                      {item.replace(/_/g, " ")}
                    </span>
                    <span className="font-medium text-amber-400">
                      {quantity.toLocaleString()}
                    </span>
                  </div>
                ))
            ) : (
              <div className="text-muted-foreground py-4 text-center">
                <Icons.package className="mx-auto mb-2 h-8 w-8 opacity-50" />
                <p className="text-sm">Treasury is empty</p>
              </div>
            )}
          </div>
        </div>

        {/* Contribution Form */}
        <div className="bg-background/30 rounded-lg border p-3">
          <h3 className="mb-3 flex items-center gap-2 text-base font-semibold">
            <Icons.gift className="h-4 w-4 text-green-400" />
            Contribute Resources
          </h3>

          {error && (
            <div className="bg-destructive/20 border-destructive/30 mb-3 rounded-md border p-2">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          {availableItems.length > 0 ? (
            <div className="space-y-3">
              <select
                value={resourceName}
                onChange={(e) => setResourceName(e.target.value)}
                className="bg-background/50 border-border focus:ring-starlight/50 focus:border-starlight w-full rounded-md border px-3 py-2 text-sm transition-colors focus:ring-2"
                disabled={isContributing}
              >
                <option value="">Select a resource to contribute</option>
                {availableItems.map(([item, quantity]) => (
                  <option key={item} value={item}>
                    {item
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}{" "}
                    ({quantity} available)
                  </option>
                ))}
              </select>

              {resourceName && (
                <input
                  type="number"
                  value={resourceAmount}
                  onChange={(e) => setResourceAmount(e.target.value)}
                  placeholder="Amount"
                  min="1"
                  max={playerData?.inventory?.[resourceName] || 0}
                  className="bg-background/50 border-border focus:ring-starlight/50 focus:border-starlight w-full rounded-md border px-3 py-2 text-sm transition-colors focus:ring-2"
                  disabled={isContributing}
                />
              )}

              <button
                onClick={handleContribute}
                disabled={
                  isContributing || !resourceName || !resourceAmount.trim()
                }
                className={buttonVariants({
                  variant: "starlight",
                  size: "sm",
                  className: "w-full",
                })}
              >
                {isContributing ? (
                  <div className="flex items-center gap-2">
                    <Icons.loading className="h-4 w-4 animate-spin" />
                    Contributing...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Icons.gift className="h-4 w-4" />
                    Contribute
                  </div>
                )}
              </button>
            </div>
          ) : (
            <div className="py-4 text-center">
              <Icons.package className="mx-auto mb-2 h-8 w-8 opacity-50" />
              <p className="text-muted-foreground text-sm">
                No items available to contribute
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                Complete missions to gather resources
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
