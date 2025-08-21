// Database wrapper that switches between remote DB and local store
import { eq } from "drizzle-orm";

import { isLocalhost, localStore } from "@/lib/local-store";
import { db, gameLogs, players, towns } from "@/lib/schema";

// Fallback function for when localhost detection fails
function shouldUseLocalStore(): boolean {
  try {
    return isLocalhost();
  } catch (error) {
    console.warn(
      "Failed to detect localhost, falling back to remote DB:",
      error,
    );
    return false;
  }
}

// Unified database interface
export const dbWrapper = {
  // Player operations
  players: {
    async findFirst(where: { id: string }) {
      if (shouldUseLocalStore()) {
        return await localStore.players.findFirst(where);
      }
      return await db.query.players.findFirst({
        where: eq(players.id, where.id),
      });
    },

    async insert(data: any) {
      if (shouldUseLocalStore()) {
        return await localStore.players.insert(data);
      }
      await db.insert(players).values(data);
      return data;
    },

    async update(where: { id: string }, data: any) {
      if (shouldUseLocalStore()) {
        return await localStore.players.update(where, data);
      }
      await db.update(players).set(data).where(eq(players.id, where.id));
      return data;
    },
  },

  // Town operations
  towns: {
    async findFirst() {
      if (shouldUseLocalStore()) {
        return await localStore.towns.findFirst();
      }
      return await db.query.towns.findFirst();
    },

    async insert(data: any) {
      if (shouldUseLocalStore()) {
        return await localStore.towns.insert({ ...data, id: "default-town" });
      }
      await db.insert(towns).values(data);
      return data;
    },

    async update(where: { id: string }, data: any) {
      if (shouldUseLocalStore()) {
        return await localStore.towns.update(where, data);
      }
      await db.update(towns).set(data).where(eq(towns.id, where.id));
      return data;
    },
  },

  // Game logs operations
  gameLogs: {
    async findMany(options: { where?: any; orderBy?: any; limit?: number }) {
      if (shouldUseLocalStore()) {
        return await localStore.gameLogs.findMany(options);
      }

      // Convert options for drizzle
      let query = db.query.gameLogs.findMany({
        limit: options.limit,
      });

      // Handle where clause - look for OR conditions
      if (options.where) {
        query = db.query.gameLogs.findMany({
          where: options.where,
          orderBy: options.orderBy,
          limit: options.limit,
        });
      }

      return await query;
    },

    async insert(data: { playerId: string; message: string; type: string }) {
      if (shouldUseLocalStore()) {
        return await localStore.gameLogs.insert(data);
      }
      await db.insert(gameLogs).values(data);
      return data;
    },

    async insertMany(
      dataArray: { playerId: string; message: string; type: string }[],
    ) {
      if (shouldUseLocalStore()) {
        return await localStore.gameLogs.insertMany(dataArray);
      }
      await db.insert(gameLogs).values(dataArray);
      return dataArray;
    },

    async delete(where: { playerId: string }) {
      if (shouldUseLocalStore()) {
        return await localStore.gameLogs.delete(where);
      }
      await db.delete(gameLogs).where(eq(gameLogs.playerId, where.playerId));
    },
  },

  // Clear all data (local only)
  async clearAll() {
    if (shouldUseLocalStore()) {
      return await localStore.clearAll();
    }
    throw new Error("clearAll is only available in local development");
  },
};
