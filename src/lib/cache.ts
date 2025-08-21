// Simple in-memory cache for frequently accessed data
type CacheEntry<T> = {
  data: T;
  timestamp: number;
  ttl: number;
};

class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly defaultTTL = 30000; // 30 seconds

  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

export const gameCache = new MemoryCache();

// Auto cleanup every 5 minutes
if (typeof window === "undefined") {
  // Server-side only
  setInterval(
    () => {
      gameCache.cleanup();
    },
    5 * 60 * 1000,
  );
}

// Cache keys for common data
export const CACHE_KEYS = {
  PLAYER: (userId: string) => `player:${userId}`,
  TOWN: () => "town:default",
  GAME_LOGS: (userId: string) => `logs:${userId}`,
  GAME_STATE: (userId: string) => `gamestate:${userId}`,
} as const;
