"use client";

import { Icons } from "@/components/icons";
import type { Player } from "@/lib/schema";

type PlayerPanelProps = {
  playerData: Player | null;
};

export const PlayerPanel = ({ playerData }: PlayerPanelProps) => {
  if (!playerData) {
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
                {playerData.coins.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-400"></div>
              <span className="text-sm">Rep:</span>
              <span className="font-bold text-green-400">
                {playerData.reputation}
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
                {playerData.strength}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Stamina:</span>
              <span className="font-medium text-blue-400">
                {playerData.stamina}
              </span>
            </div>
          </div>
        </div>

        {/* Skills Section */}
        <div className="bg-background/30 rounded-lg border p-3">
          <h3 className="mb-2 flex items-center gap-2 text-base font-semibold">
            <Icons.sword className="h-4 w-4 text-purple-400" />
            Combat Skills
          </h3>
          <div className="space-y-1 text-xs">
            {[
              { key: "unarmed", name: "Unarmed", icon: "👊" },
              { key: "weapons", name: "Weapons", icon: "⚔️" },
              { key: "archery", name: "Archery", icon: "🏹" },
              { key: "traps", name: "Traps", icon: "🪤" },
            ].map((skill) => {
              const skillData =
                playerData.skills?.[
                  skill.key as keyof typeof playerData.skills
                ];
              return (
                <div
                  key={skill.key}
                  className="flex items-center justify-between"
                >
                  <span className="flex items-center gap-1">
                    <span>{skill.icon}</span>
                    {skill.name}:
                  </span>
                  <div className="font-medium text-cyan-400">
                    Lv.{skillData?.level || 1}
                    <span className="text-muted-foreground ml-1">
                      ({skillData?.xp || 0} xp)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gathering Skills Section */}
        <div className="bg-background/30 rounded-lg border p-3">
          <h3 className="mb-2 flex items-center gap-2 text-base font-semibold">
            <Icons.package className="h-4 w-4 text-green-400" />
            Gathering Skills
          </h3>
          <div className="space-y-1 text-xs">
            {[
              { key: "fishing", name: "Fishing", icon: "🎣" },
              { key: "foraging", name: "Foraging", icon: "🍄" },
              { key: "hunting", name: "Hunting", icon: "🦌" },
              { key: "mining", name: "Mining", icon: "⛏️" },
              { key: "woodcutting", name: "Woodcutting", icon: "🪓" },
            ].map((skill) => {
              const skillData =
                playerData.skills?.[
                  skill.key as keyof typeof playerData.skills
                ];
              return (
                <div
                  key={skill.key}
                  className="flex items-center justify-between"
                >
                  <span className="flex items-center gap-1">
                    <span>{skill.icon}</span>
                    {skill.name}:
                  </span>
                  <div className="font-medium text-emerald-400">
                    Lv.{skillData?.level || 1}
                    <span className="text-muted-foreground ml-1">
                      ({skillData?.xp || 0} xp)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Production Skills Section */}
        <div className="bg-background/30 rounded-lg border p-3">
          <h3 className="mb-2 flex items-center gap-2 text-base font-semibold">
            <Icons.hammer className="h-4 w-4 text-orange-400" />
            Production Skills
          </h3>
          <div className="space-y-1 text-xs">
            {[
              { key: "crafting", name: "Crafting", icon: "🔨" },
              { key: "cooking", name: "Cooking", icon: "👨‍🍳" },
            ].map((skill) => {
              const skillData =
                playerData.skills?.[
                  skill.key as keyof typeof playerData.skills
                ];
              return (
                <div
                  key={skill.key}
                  className="flex items-center justify-between"
                >
                  <span className="flex items-center gap-1">
                    <span>{skill.icon}</span>
                    {skill.name}:
                  </span>
                  <div className="font-medium text-orange-400">
                    Lv.{skillData?.level || 1}
                    <span className="text-muted-foreground ml-1">
                      ({skillData?.xp || 0} xp)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Status */}
        {playerData.currentMission && (
          <div className="from-starlight/20 to-cosmic/20 border-starlight/30 rounded-lg border bg-gradient-to-r p-3">
            <h3 className="text-starlight mb-1 text-base font-semibold">
              Current Mission
            </h3>
            <p className="text-foreground/90 text-sm">
              {playerData.currentMission.name}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
