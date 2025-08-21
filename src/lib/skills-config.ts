// Skills Configuration - Centralized skill definitions with emojis and categories
import { DEFAULT_SKILLS } from "./game-config";

export interface SkillDefinition {
  key: string;
  name: string;
  emoji: string;
  category: "combat" | "gathering" | "production";
  color: string;
  description: string;
}

// Comprehensive skill definitions with emojis
export const SKILL_DEFINITIONS: Record<string, SkillDefinition> = {
  // Combat Skills
  unarmed: {
    key: "unarmed",
    name: "Unarmed Combat",
    emoji: "👊",
    category: "combat",
    color: "text-red-400",
    description: "Fighting without weapons using fists and martial arts",
  },
  weapons: {
    key: "weapons",
    name: "Weapons",
    emoji: "⚔️",
    category: "combat",
    color: "text-red-500",
    description: "Mastery of swords, axes, and other melee weapons",
  },
  archery: {
    key: "archery",
    name: "Archery",
    emoji: "🏹",
    category: "combat",
    color: "text-red-300",
    description: "Precision with bows and ranged combat",
  },
  traps: {
    key: "traps",
    name: "Traps",
    emoji: "🪤",
    category: "combat",
    color: "text-orange-400",
    description: "Setting and disarming traps and snares",
  },

  // Gathering Skills
  fishing: {
    key: "fishing",
    name: "Fishing",
    emoji: "🎣",
    category: "gathering",
    color: "text-blue-400",
    description: "Catching fish from rivers, lakes, and oceans",
  },
  gathering: {
    key: "gathering",
    name: "Foraging",
    emoji: "🍄",
    category: "gathering",
    color: "text-green-400",
    description: "Finding berries, herbs, and other natural resources",
  },
  logging: {
    key: "logging",
    name: "Logging",
    emoji: "🪓",
    category: "gathering",
    color: "text-amber-600",
    description: "Chopping trees and harvesting wood",
  },
  mining: {
    key: "mining",
    name: "Mining",
    emoji: "⛏️",
    category: "gathering",
    color: "text-stone-400",
    description: "Extracting ores and gems from underground",
  },
  farming: {
    key: "farming",
    name: "Farming",
    emoji: "🌾",
    category: "gathering",
    color: "text-green-500",
    description: "Growing crops and tending to plants",
  },
};

// Skill categories for organization
export const SKILL_CATEGORIES = {
  combat: {
    name: "Combat Skills",
    emoji: "⚔️",
    color: "text-red-400",
    skills: ["unarmed", "weapons", "archery", "traps"],
  },
  gathering: {
    name: "Gathering Skills",
    emoji: "🌿",
    color: "text-green-400",
    skills: ["fishing", "gathering", "logging", "mining", "farming"],
  },
  production: {
    name: "Production Skills",
    emoji: "🔨",
    color: "text-orange-400",
    skills: [], // Will add crafting, cooking, etc. later
  },
} as const;

// Utility functions
export function getSkillDefinition(skillKey: string): SkillDefinition | null {
  return SKILL_DEFINITIONS[skillKey] || null;
}

export function getSkillsByCategory(
  category: keyof typeof SKILL_CATEGORIES,
): SkillDefinition[] {
  return SKILL_CATEGORIES[category].skills
    .map((skillKey) => SKILL_DEFINITIONS[skillKey])
    .filter(Boolean);
}

export function calculateXPForLevel(level: number): number {
  // Reduced XP requirements (factor of 10 less than before)
  return level * 10;
}

export function calculateLevelFromXP(xp: number): number {
  return Math.floor(xp / 10) + 1;
}

// Get all skills that exist in the game config
export function getAllGameSkills(): SkillDefinition[] {
  return Object.keys(DEFAULT_SKILLS)
    .map((skillKey) => getSkillDefinition(skillKey))
    .filter(Boolean) as SkillDefinition[];
}
