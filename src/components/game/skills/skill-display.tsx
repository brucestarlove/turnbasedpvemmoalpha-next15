// Individual Skill Display Component
"use client";

import { SkillDefinition } from "@/lib/skills-config";

interface SkillDisplayProps {
  skill: SkillDefinition;
  level: number;
  xp: number;
  showXP?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "compact" | "detailed";
}

export const SkillDisplay = ({
  skill,
  level,
  xp,
  showXP = true,
  size = "md",
  variant = "detailed",
}: SkillDisplayProps) => {
  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const xpForNextLevel = level * 10;
  const xpProgress =
    level > 1 ? ((xp - (level - 1) * 10) / 10) * 100 : (xp / 10) * 100;

  if (variant === "compact") {
    return (
      <div className={`flex items-center justify-between ${sizeClasses[size]}`}>
        <span className="flex items-center gap-1">
          <span className="text-base">{skill.emoji}</span>
          <span className="truncate">{skill.name}:</span>
        </span>
        <div className={`font-medium ${skill.color}`}>
          Lv.{level}
          {showXP && (
            <span className="text-muted-foreground ml-1">({xp} xp)</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-1 ${sizeClasses[size]}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{skill.emoji}</span>
          <div>
            <div className="font-medium">{skill.name}</div>
            {size === "lg" && (
              <div className="text-muted-foreground text-xs">
                {skill.description}
              </div>
            )}
          </div>
        </div>
        <div className={`text-right font-medium ${skill.color}`}>
          <div>Level {level}</div>
          {showXP && (
            <div className="text-muted-foreground text-xs">
              {xp} / {xpForNextLevel} XP
            </div>
          )}
        </div>
      </div>

      {showXP && size !== "sm" && (
        <div className="bg-muted h-1.5 w-full rounded-full">
          <div
            className={`h-1.5 rounded-full bg-gradient-to-r transition-all duration-300 from-${skill.color.replace("text-", "")} to-${skill.color.replace("text-", "")}/80`}
            style={{ width: `${Math.min(xpProgress, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
};
