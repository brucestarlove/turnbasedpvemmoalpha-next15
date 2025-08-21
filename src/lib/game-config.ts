// Game Configuration - Static data from the original game

export const COOLDOWN_SECONDS = 10;
export const COOLDOWN_MS = COOLDOWN_SECONDS * 1000;

// Game types and interfaces
export interface Mission {
  id?: string;
  name: string;
  type: "gathering" | "combat" | "crafting";
  category: "skill" | "combat";
  description: string;
  requirements: Record<string, any>;
  rewards: Record<string, any>;
  skill?: string;
  level: number;
  resource?: string;
  amount?: number;
  enemy?: string;
}

export interface CraftingRecipe {
  id?: string;
  name: string;
  type: "crafting";
  description: string;
  cost: Record<string, number>;
  result: Record<string, number>;
  skill?: string;
  level: number;
}

export interface TownObjective {
  id: string;
  name: string;
  type: "contribution" | "slay";
  requirements: Record<string, number>;
  unlocks: {
    upgrades?: string[];
    missions?: string[];
  };
  dependsOn?: string;
}

// Mission Pool - All available missions
export const ALL_MISSIONS_POOL: Record<string, Mission> = {
  m101: {
    name: "Gather Sturdy Wood",
    type: "gathering",
    category: "skill",
    resource: "sturdy_wood",
    amount: 1,
    skill: "logging",
    description: "Collect wood from the nearby thicket.",
    requirements: {},
    rewards: { sturdy_wood: 1 },
    level: 1,
  },
  m102: {
    name: "Forage for Berries",
    type: "gathering",
    category: "skill",
    resource: "berries",
    amount: 2,
    skill: "gathering",
    description: "Find edible berries in the undergrowth.",
    requirements: {},
    rewards: { berries: 2 },
    level: 1,
  },
  m103: {
    name: "Hunt Rabid Wolf",
    type: "combat",
    category: "combat",
    enemy: "Rabid Wolf",
    skill: "unarmed",
    description: "A rabid wolf is menacing the area. Take it down.",
    requirements: {},
    rewards: { coins: 1 }, // Random 1-5 coins
    level: 1,
  },
};

// Crafting Recipes
export const CRAFTING_RECIPES: Record<string, CraftingRecipe> = {
  craft001: {
    name: "Strong Wooden Sword",
    type: "crafting",
    cost: { sturdy_wood: 4 },
    result: { strong_wooden_sword: 1 },
    skill: "weapons",
    description: "Craft a basic but sturdy sword.",
    level: 1,
  },
};

// Territory Missions - Which missions are available in which territories
export const TERRITORY_MISSIONS = {
  t1: ["m101", "m102"],
};

// Town Objectives - Progressive town goals
export const TOWN_OBJECTIVES: TownObjective[] = [
  {
    id: "build_notice_board",
    name: "Build Map & Notice Board",
    type: "contribution",
    requirements: { sturdy_wood: 2, stone: 2 },
    unlocks: {
      upgrades: ["map_unlocked"],
      missions: ["m103"],
    },
  },
  {
    id: "clear_wolves",
    name: "Clear the Wolf Menace",
    type: "slay",
    requirements: { "Rabid Wolf": 1 },
    unlocks: {},
    dependsOn: "build_notice_board",
  },
  {
    id: "build_crafting_station",
    name: "Build a Crafting Station",
    type: "contribution",
    requirements: { sturdy_wood: 6 },
    unlocks: { upgrades: ["crafting_station_unlocked"] },
    dependsOn: "clear_wolves",
  },
];

// Default player skills structure
export const DEFAULT_SKILLS = {
  unarmed: { level: 1, xp: 0 },
  weapons: { level: 1, xp: 0 },
  archery: { level: 1, xp: 0 },
  traps: { level: 1, xp: 0 },
  logging: { level: 1, xp: 0 },
  mining: { level: 1, xp: 0 },
  farming: { level: 1, xp: 0 },
  gathering: { level: 1, xp: 0 },
  fishing: { level: 1, xp: 0 },
};

// Default player inventory
export const DEFAULT_INVENTORY = {
  stone: 2,
};

// Default town upgrades
export const DEFAULT_TOWN_UPGRADES = {
  map_unlocked: false,
  combat_board_unlocked: false,
  crafting_station_unlocked: false,
};

// Game types
export type MissionId = keyof typeof ALL_MISSIONS_POOL;
export type CraftingRecipeId = keyof typeof CRAFTING_RECIPES;
export type TerritoryId = keyof typeof TERRITORY_MISSIONS;
export type ObjectiveId = (typeof TOWN_OBJECTIVES)[number]["id"];
export type SkillName = keyof typeof DEFAULT_SKILLS;

// Utility functions
export function getAvailableMissions(
  unlockedTerritories: string[],
  unlockedMissions: string[],
): Mission[] {
  const availableMissionIds = new Set<string>();

  // Add territory missions
  unlockedTerritories.forEach((territoryId) => {
    const territoryMissions = TERRITORY_MISSIONS[territoryId as TerritoryId];
    if (territoryMissions) {
      territoryMissions.forEach((id) => availableMissionIds.add(id));
    }
  });

  // Add unlocked missions
  unlockedMissions.forEach((id) => availableMissionIds.add(id));

  return Array.from(availableMissionIds)
    .map((id) => ({ id, ...ALL_MISSIONS_POOL[id] }))
    .filter(Boolean);
}

export function getAvailableCraftingRecipes(
  craftingStationUnlocked: boolean,
): CraftingRecipe[] {
  if (!craftingStationUnlocked) return [];

  return Object.entries(CRAFTING_RECIPES).map(([id, recipe]) => ({
    id,
    ...recipe,
  }));
}

export function getCurrentObjective(
  completedObjectives: string[],
): TownObjective | null {
  for (const objective of TOWN_OBJECTIVES) {
    if (!completedObjectives.includes(objective.id)) {
      if (
        !objective.dependsOn ||
        completedObjectives.includes(objective.dependsOn)
      ) {
        return objective;
      }
    }
  }
  return null;
}
