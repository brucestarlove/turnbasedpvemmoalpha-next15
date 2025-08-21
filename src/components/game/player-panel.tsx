"use client";

import { SkillsSection } from "@/components/game/skills";
import { Icons } from "@/components/icons";
import { useClientOnly } from "@/hooks/use-client-only";
import { getSkillsByCategory, SKILL_CATEGORIES } from "@/lib/skills-config";
import { usePlayer, usePlayerSkills } from "@/stores/game-store";

type PlayerPanelProps = {
  playerData?: never; // Deprecated - using Zustand store instead
};

export const PlayerPanel = ({}: PlayerPanelProps) => {
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
          <Icons.user className="h-5 w-5" />
          Player Info
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
        <Icons.user className="text-starlight h-5 w-5" />
        Player Info
      </h2>

      <div className="space-y-4">
        {/* Resources Section */}
        <div className="bg-background/30 rounded-lg border p-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-yellow-400"></div>
              <span className="text-sm">Coins:</span>
              <span className="font-bold text-yellow-400">
                {safePlayer.coins.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-400"></div>
              <span className="text-sm">Rep:</span>
              <span className="font-bold text-green-400">
                {safePlayer.reputation}
              </span>
            </div>
          </div>
        </div>

        {/* Attributes Section */}
        <div className="bg-background/30 rounded-lg border p-3">
          <h3 className="mb-2 flex items-center gap-2 text-base font-semibold">
            <Icons.star className="h-4 w-4 text-amber-400" />
            Attributes
          </h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between">
              <span>Strength:</span>
              <span className="font-medium text-red-400">
                {safePlayer.strength}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Stamina:</span>
              <span className="font-medium text-blue-400">
                {safePlayer.stamina}
              </span>
            </div>
          </div>
        </div>

        {/* Combat Skills */}
        <SkillsSection
          category="combat"
          skills={getSkillsByCategory("combat")}
          playerSkills={safePlayerSkills}
          variant="compact"
        />

        {/* Gathering Skills */}
        <SkillsSection
          category="gathering"
          skills={getSkillsByCategory("gathering")}
          playerSkills={safePlayerSkills}
          variant="compact"
        />

        {/* Current Status */}
        {safePlayer.currentMission && (
          <div className="from-starlight/20 to-cosmic/20 border-starlight/30 rounded-lg border bg-gradient-to-r p-3">
            <h3 className="text-starlight mb-1 text-base font-semibold">
              Current Mission
            </h3>
            <p className="text-foreground/90 text-sm">
              {safePlayer.currentMission.name}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
