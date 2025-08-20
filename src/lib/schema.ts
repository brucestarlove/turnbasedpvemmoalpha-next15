import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

const sql = neon(process.env.DATABASE_URL!);

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  stripeCustomerId: text("stripeCustomerId").unique(),
  isActive: boolean("isActive").default(false).notNull(),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    {
      compoundKey: primaryKey({
        columns: [account.provider, account.providerAccountId],
      }),
    },
  ],
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => [
    {
      compositePk: primaryKey({
        columns: [verificationToken.identifier, verificationToken.token],
      }),
    },
  ],
);

export const authenticators = pgTable(
  "authenticator",
  {
    credentialID: text("credentialID").notNull().unique(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerAccountId: text("providerAccountId").notNull(),
    credentialPublicKey: text("credentialPublicKey").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credentialDeviceType").notNull(),
    credentialBackedUp: boolean("credentialBackedUp").notNull(),
    transports: text("transports"),
  },
  (authenticator) => [
    {
      compositePK: primaryKey({
        columns: [authenticator.userId, authenticator.credentialID],
      }),
    },
  ],
);

// Game Schema - Integrated with existing auth system

export const players = pgTable(
  "player",
  {
    id: text("id")
      .primaryKey()
      .references(() => users.id, { onDelete: "cascade" }),
    strength: integer("strength").default(5).notNull(),
    stamina: integer("stamina").default(5).notNull(),
    coins: integer("coins").default(10).notNull(),
    reputation: integer("reputation").default(0).notNull(),
    inventory: jsonb("inventory")
      .$type<Record<string, number>>()
      .default({})
      .notNull(),
    skills: jsonb("skills")
      .$type<Record<string, { level: number; xp: number }>>()
      .default({})
      .notNull(),
    missionsCompleted: integer("missionsCompleted").default(0).notNull(),
    lastActionTimestamp: timestamp("lastActionTimestamp", { mode: "date" })
      .default(new Date(0))
      .notNull(),
    currentMission: jsonb("currentMission").$type<any>().default(null),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
  },
  (player) => ({
    userIdIdx: index("player_user_id_idx").on(player.id),
  }),
);

export const towns = pgTable("town", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").default("Starscape Village").notNull(),
  level: integer("level").default(1).notNull(),
  treasury: jsonb("treasury")
    .$type<Record<string, number>>()
    .default({})
    .notNull(),
  upgrades: jsonb("upgrades")
    .$type<Record<string, boolean>>()
    .default({})
    .notNull(),
  unlockedMissions: jsonb("unlockedMissions")
    .$type<string[]>()
    .default([])
    .notNull(),
  completedObjectives: jsonb("completedObjectives")
    .$type<string[]>()
    .default([])
    .notNull(),
  slayCounts: jsonb("slayCounts")
    .$type<Record<string, number>>()
    .default({})
    .notNull(),
  unlockedTerritories: jsonb("unlockedTerritories")
    .$type<string[]>()
    .default(["t1"])
    .notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
});

export const gameLogs = pgTable(
  "gameLog",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    playerId: text("playerId")
      .notNull()
      .references(() => players.id, { onDelete: "cascade" }),
    message: text("message").notNull(),
    type: text("type").default("action").notNull(), // action, town, system
    timestamp: timestamp("timestamp", { mode: "date" }).defaultNow().notNull(),
  },
  (log) => ({
    playerIdIdx: index("game_log_player_id_idx").on(log.playerId),
    timestampIdx: index("game_log_timestamp_idx").on(log.timestamp),
  }),
);

export const chatRooms = pgTable("chatRoom", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  description: text("description"),
  isPublic: boolean("isPublic").default(true).notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
});

export const chatMessages = pgTable(
  "chatMessage",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    roomId: text("roomId")
      .notNull()
      .references(() => chatRooms.id, { onDelete: "cascade" }),
    playerId: text("playerId")
      .notNull()
      .references(() => players.id, { onDelete: "cascade" }),
    message: text("message").notNull(),
    timestamp: timestamp("timestamp", { mode: "date" }).defaultNow().notNull(),
  },
  (message) => ({
    roomIdIdx: index("chat_message_room_id_idx").on(message.roomId),
    timestampIdx: index("chat_message_timestamp_idx").on(message.timestamp),
  }),
);

export const directMessages = pgTable(
  "directMessage",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    senderId: text("senderId")
      .notNull()
      .references(() => players.id, { onDelete: "cascade" }),
    receiverId: text("receiverId")
      .notNull()
      .references(() => players.id, { onDelete: "cascade" }),
    message: text("message").notNull(),
    isRead: boolean("isRead").default(false).notNull(),
    timestamp: timestamp("timestamp", { mode: "date" }).defaultNow().notNull(),
  },
  (dm) => ({
    senderIdIdx: index("dm_sender_id_idx").on(dm.senderId),
    receiverIdIdx: index("dm_receiver_id_idx").on(dm.receiverId),
    timestampIdx: index("dm_timestamp_idx").on(dm.timestamp),
  }),
);

// Mission and crafting data (static data, could be moved to a config file)
export const missions = pgTable("mission", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // gathering, combat, crafting
  category: text("category").notNull(), // skill, combat
  description: text("description").notNull(),
  requirements: jsonb("requirements").$type<any>().notNull(),
  rewards: jsonb("rewards").$type<any>().notNull(),
  skill: text("skill"),
  level: integer("level").default(1).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
});

export const craftingRecipes = pgTable("craftingRecipe", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  cost: jsonb("cost").$type<Record<string, number>>().notNull(),
  result: jsonb("result").$type<Record<string, number>>().notNull(),
  skill: text("skill"),
  level: integer("level").default(1).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
});

// Export types for use in components
export type Player = typeof players.$inferSelect;
export type NewPlayer = typeof players.$inferInsert;
export type Town = typeof towns.$inferSelect;
export type NewTown = typeof towns.$inferInsert;
export type GameLog = typeof gameLogs.$inferSelect;
export type NewGameLog = typeof gameLogs.$inferInsert;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type NewChatMessage = typeof chatMessages.$inferInsert;
export type DirectMessage = typeof directMessages.$inferSelect;
export type NewDirectMessage = typeof directMessages.$inferInsert;
export type Mission = typeof missions.$inferSelect;
export type CraftingRecipe = typeof craftingRecipes.$inferSelect;

// Configure database with schema for query builder
export const db = drizzle({
  client: sql,
  schema: {
    users,
    accounts,
    sessions,
    verificationTokens,
    players,
    towns,
    gameLogs,
    chatMessages,
    directMessages,
    missions,
    craftingRecipes,
  },
});
