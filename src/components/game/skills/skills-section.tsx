// Skills Section Component - Groups skills by category
"use client";

import { Icons } from "@/components/icons";
import { SKILL_CATEGORIES, SkillDefinition } from "@/lib/skills-config";

import { SkillDisplay } from "./skill-display";

interface SkillsSectionProps {
  category: keyof typeof SKILL_CATEGORIES;
  skills: SkillDefinition[];
  playerSkills: Record<string, { level: number; xp: number }>;
  variant?: "compact" | "detailed";
  showXP?: boolean;
}

export const SkillsSection = ({
  category,
  skills,
  playerSkills,
  variant = "detailed",
  showXP = true,
}: SkillsSectionProps) => {
  const categoryInfo = SKILL_CATEGORIES[category];

  if (skills.length === 0) return null;

  const getIcon = () => {
    switch (category) {
      case "combat":
        return <Icons.sword className="h-4 w-4 text-red-400" />;
      case "gathering":
        return <Icons.package className="h-4 w-4 text-green-400" />;
      case "production":
        return <Icons.hammer className="h-4 w-4 text-orange-400" />;
      default:
        return <Icons.star className="h-4 w-4" />;
    }
  };

  return (
    <div className="bg-background/30 space-y-2 rounded-lg border p-3">
      <h3
        className={`flex items-center gap-2 text-base font-semibold ${categoryInfo.color}`}
      >
        {getIcon()}
        <span>{categoryInfo.name}</span>
        <span className="text-sm">{categoryInfo.emoji}</span>
      </h3>

      <div className={`space-y-${variant === "compact" ? "1" : "3"}`}>
        {skills.map((skill) => {
          const skillData = playerSkills[skill.key] || { level: 1, xp: 0 };

          return (
            <SkillDisplay
              key={skill.key}
              skill={skill}
              level={skillData.level}
              xp={skillData.xp}
              variant={variant}
              showXP={showXP}
            />
          );
        })}
      </div>
    </div>
  );
};
