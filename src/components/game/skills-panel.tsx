"use client";

import { useState } from "react";

import { SkillsSection } from "@/components/game/skills";
import { Icons } from "@/components/icons";
import { useClientOnly } from "@/hooks/use-client-only";
import { getSkillsByCategory } from "@/lib/skills-config";
import { usePlayer, usePlayerSkills } from "@/stores/game-store";

type SkillsPanelProps = {
  playerData?: never; // Deprecated - using Zustand store instead
};

export const SkillsPanel = ({}: SkillsPanelProps) => {
  const [showChangeProfessions, setShowChangeProfessions] = useState(false);

  const isClient = useClientOnly();
  const player = usePlayer();
  const playerSkills = usePlayerSkills();

  // Use safe values for SSR
  const safePlayer = isClient ? player : null;
  const safePlayerSkills = isClient ? playerSkills : {};

  if (!safePlayer) {
    return (
      <div className="bg-card/50 rounded-lg border p-4 shadow-lg backdrop-blur-sm">
        <h2 className="border-border mb-2 flex items-center gap-2 border-b pb-2 text-xl font-bold">
          <Icons.star className="h-5 w-5" />
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
      <h2 className="border-border mb-3 flex items-center gap-2 border-b pb-2 text-xl font-bold">
        <Icons.star className="text-starlight h-5 w-5" />
        Skills Overview
      </h2>

      {/* Toggle for Change Professions */}
      <div className="mb-4">
        <button
          onClick={() => setShowChangeProfessions(!showChangeProfessions)}
          className="text-starlight hover:text-starlight/80 flex items-center gap-2 text-sm transition-colors"
        >
          <Icons.settings className="h-4 w-4" />
          {showChangeProfessions ? "Hide" : "Show"} Profession Details
        </button>
      </div>

      {showChangeProfessions && (
        <div className="border-starlight/20 from-cosmic/10 to-starlight/10 mb-4 rounded-lg border bg-gradient-to-r p-3">
          <h3 className="text-starlight mb-2 font-semibold">
            Change Professions
          </h3>
          <p className="text-foreground/80 mb-3 text-sm">
            Here you can specialize in different skill paths. Each profession
            offers unique bonuses and abilities.
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>🛡️ Warrior (Combat Focus)</span>
              <span className="text-muted-foreground">Coming Soon</span>
            </div>
            <div className="flex justify-between">
              <span>🌿 Gatherer (Resource Focus)</span>
              <span className="text-muted-foreground">Coming Soon</span>
            </div>
            <div className="flex justify-between">
              <span>🔨 Crafter (Production Focus)</span>
              <span className="text-muted-foreground">Coming Soon</span>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* Combat Skills */}
        <SkillsSection
          category="combat"
          skills={getSkillsByCategory("combat")}
          playerSkills={safePlayerSkills}
          variant="detailed"
          showXP={true}
        />

        {/* Gathering Skills */}
        <SkillsSection
          category="gathering"
          skills={getSkillsByCategory("gathering")}
          playerSkills={safePlayerSkills}
          variant="detailed"
          showXP={true}
        />
      </div>
    </div>
  );
};
