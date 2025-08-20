"use client";

import { useState } from "react";

import { Icons } from "@/components/icons";
import type { Player } from "@/lib/schema";

type SkillsPanelProps = {
  playerData: Player | null;
};

// Define skill categories and level thresholds
const SKILL_CATEGORIES = {
  combat: {
    name: "Combat Skills",
    skills: ["unarmed", "weapons", "archery", "traps"],
    icon: <Icons.sword className="h-4 w-4" />,
  },
  gathering: {
    name: "Gathering Skills",
    skills: ["logging", "mining", "farming", "gathering", "fishing"],
    icon: <Icons.package className="h-4 w-4" />,
  },
};

const LEVEL_THRESHOLDS = [
  { level: 1, xp: 0, unlock: "Basic training unlocked" },
  { level: 2, xp: 100, unlock: "Improved efficiency" },
  { level: 3, xp: 300, unlock: "Advanced techniques" },
  { level: 4, xp: 600, unlock: "Expert mastery" },
  { level: 5, xp: 1000, unlock: "Legendary status" },
];

export const SkillsPanel = ({ playerData }: SkillsPanelProps) => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([
    "combat",
    "gathering",
  ]);

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  };

  if (!playerData) {
    return (
      <div className="bg-card/50 rounded-lg border p-4 shadow-lg backdrop-blur-sm">
        <h2 className="border-border mb-2 border-b pb-2 text-xl font-bold">
          Skills
        </h2>
        <div className="flex h-32 items-center justify-center">
          <Icons.loading className="text-starlight h-6 w-6 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card/50 rounded-lg border p-4 shadow-lg backdrop-blur-sm">
      <h2 className="border-border mb-3 border-b pb-2 text-xl font-bold">
        Skills
      </h2>

      <div className="space-y-3">
        {Object.entries(SKILL_CATEGORIES).map(([categoryKey, category]) => {
          const isExpanded = expandedCategories.includes(categoryKey);

          return (
            <div
              key={categoryKey}
              className="bg-background/30 rounded-lg border"
            >
              <button
                onClick={() => toggleCategory(categoryKey)}
                className="hover:bg-background/50 flex w-full items-center justify-between p-3 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {category.icon}
                  <span className="font-medium">{category.name}</span>
                </div>
                <Icons.arrowLeft
                  className={`h-4 w-4 transition-transform ${
                    isExpanded ? "rotate-[-90deg]" : "rotate-[180deg]"
                  }`}
                />
              </button>

              {isExpanded && (
                <div className="space-y-3 px-3 pb-3">
                  {category.skills.map((skillName) => {
                    const skillData = playerData.skills?.[skillName] || {
                      level: 1,
                      xp: 0,
                    };
                    const currentLevel = skillData.level;
                    const currentXp = skillData.xp;

                    // Calculate progress to next level
                    const nextLevelXp = currentLevel * 100;
                    const progressPercent =
                      currentLevel >= 5 ? 100 : (currentXp / nextLevelXp) * 100;

                    return (
                      <div key={skillName} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium capitalize">
                            {skillName.replace(/_/g, " ")}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            Level {currentLevel}
                          </span>
                        </div>

                        {/* XP Progress Bar */}
                        <div className="space-y-1">
                          <div className="bg-muted/30 h-2 w-full rounded-full">
                            <div
                              className="from-starlight to-cosmic h-2 rounded-full bg-gradient-to-r transition-all duration-300"
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                          <div className="text-muted-foreground flex justify-between text-xs">
                            <span>{currentXp} XP</span>
                            <span>
                              {currentLevel >= 5 ? "MAX" : `${nextLevelXp} XP`}
                            </span>
                          </div>
                        </div>

                        {/* Level Thresholds */}
                        <div className="space-y-1">
                          {LEVEL_THRESHOLDS.map((threshold) => {
                            const isUnlocked = currentLevel >= threshold.level;
                            const isCurrent = currentLevel === threshold.level;

                            return (
                              <div
                                key={threshold.level}
                                className={`flex items-center gap-2 rounded p-1 text-xs ${
                                  isCurrent
                                    ? "bg-starlight/20 text-starlight"
                                    : isUnlocked
                                      ? "text-green-400"
                                      : "text-muted-foreground"
                                }`}
                              >
                                <div
                                  className={`h-2 w-2 rounded-full ${
                                    isUnlocked
                                      ? "bg-green-400"
                                      : "bg-muted-foreground/30"
                                  }`}
                                />
                                <span>Level {threshold.level}:</span>
                                <span className="italic">
                                  {threshold.unlock}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
