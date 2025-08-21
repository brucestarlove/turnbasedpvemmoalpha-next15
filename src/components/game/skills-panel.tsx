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
  const [expandedSkills, setExpandedSkills] = useState<string[]>([]);

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  };

  const toggleSkill = (skillName: string) => {
    setExpandedSkills((prev) =>
      prev.includes(skillName)
        ? prev.filter((s) => s !== skillName)
        : [...prev, skillName],
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
                className="hover:bg-background/50 flex w-full cursor-pointer items-center justify-between p-3 transition-colors"
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
                <div className="space-y-2 px-3 pb-3">
                  {category.skills.map((skillName) => {
                    const skillData = playerData.skills?.[skillName] || {
                      level: 1,
                      xp: 0,
                    };
                    const currentLevel = skillData.level;
                    const currentXp = skillData.xp;
                    const isSkillExpanded = expandedSkills.includes(skillName);

                    // Calculate progress to next level
                    const nextLevelXp = currentLevel * 100;
                    const progressPercent =
                      currentLevel >= 5 ? 100 : (currentXp / nextLevelXp) * 100;

                    return (
                      <div
                        key={skillName}
                        className="bg-background/20 rounded-lg border"
                      >
                        {/* Skill Header (clickable) */}
                        <button
                          onClick={() => toggleSkill(skillName)}
                          className="hover:bg-background/30 flex w-full cursor-pointer items-center justify-between p-2 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium capitalize">
                              {skillName.replace(/_/g, " ")}
                            </span>
                            <span className="text-muted-foreground text-xs">
                              Level {currentLevel}
                            </span>
                          </div>
                          <Icons.arrowLeft
                            className={`h-3 w-3 transition-transform ${
                              isSkillExpanded
                                ? "rotate-[-90deg]"
                                : "rotate-[180deg]"
                            }`}
                          />
                        </button>

                        {/* Always show XP progress bar */}
                        <div className="px-2 pb-1">
                          <div className="bg-muted/30 h-1.5 w-full rounded-full">
                            <div
                              className="from-starlight to-cosmic h-1.5 rounded-full bg-gradient-to-r transition-all duration-300"
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                          <div className="text-muted-foreground mt-0.5 flex justify-between text-xs">
                            <span>{currentXp} XP</span>
                            <span>
                              {currentLevel >= 5 ? "MAX" : `${nextLevelXp} XP`}
                            </span>
                          </div>
                        </div>

                        {/* Expandable Level Thresholds */}
                        {isSkillExpanded && (
                          <div className="space-y-1 px-2 pb-2">
                            <div className="text-muted-foreground mb-1 text-xs font-medium">
                              Level Progression:
                            </div>
                            {LEVEL_THRESHOLDS.map((threshold) => {
                              const isUnlocked =
                                currentLevel >= threshold.level;
                              const isCurrent =
                                currentLevel === threshold.level;

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
                                    className={`h-1.5 w-1.5 rounded-full ${
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
                        )}
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
