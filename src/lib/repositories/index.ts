// Main repository exports
export * from "./db-repository";
export * from "./factory";
export * from "./in-memory-repository";
export * from "./interfaces";

// Convenience re-exports for common usage patterns
export { getGameRepository as gameRepository } from "./factory";
export type { IGameDataRepository } from "./interfaces";
