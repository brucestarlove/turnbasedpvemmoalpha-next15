CREATE TABLE "chatMessage" (
	"id" text PRIMARY KEY NOT NULL,
	"roomId" text NOT NULL,
	"playerId" text NOT NULL,
	"message" text NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chatRoom" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"isPublic" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "craftingRecipe" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"cost" jsonb NOT NULL,
	"result" jsonb NOT NULL,
	"skill" text,
	"level" integer DEFAULT 1 NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "directMessage" (
	"id" text PRIMARY KEY NOT NULL,
	"senderId" text NOT NULL,
	"receiverId" text NOT NULL,
	"message" text NOT NULL,
	"isRead" boolean DEFAULT false NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gameLog" (
	"id" text PRIMARY KEY NOT NULL,
	"playerId" text NOT NULL,
	"message" text NOT NULL,
	"type" text DEFAULT 'action' NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mission" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"category" text NOT NULL,
	"description" text NOT NULL,
	"requirements" jsonb NOT NULL,
	"rewards" jsonb NOT NULL,
	"skill" text,
	"level" integer DEFAULT 1 NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "player" (
	"id" text PRIMARY KEY NOT NULL,
	"strength" integer DEFAULT 5 NOT NULL,
	"stamina" integer DEFAULT 5 NOT NULL,
	"coins" integer DEFAULT 10 NOT NULL,
	"reputation" integer DEFAULT 0 NOT NULL,
	"inventory" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"skills" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"missionsCompleted" integer DEFAULT 0 NOT NULL,
	"lastActionTimestamp" timestamp DEFAULT '1970-01-01 00:00:00.000' NOT NULL,
	"currentMission" jsonb DEFAULT 'null'::jsonb,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "town" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text DEFAULT 'Starscape Village' NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"treasury" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"upgrades" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"unlockedMissions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"completedObjectives" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"slayCounts" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"unlockedTerritories" jsonb DEFAULT '["t1"]'::jsonb NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "chatMessage" ADD CONSTRAINT "chatMessage_roomId_chatRoom_id_fk" FOREIGN KEY ("roomId") REFERENCES "public"."chatRoom"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chatMessage" ADD CONSTRAINT "chatMessage_playerId_player_id_fk" FOREIGN KEY ("playerId") REFERENCES "public"."player"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "directMessage" ADD CONSTRAINT "directMessage_senderId_player_id_fk" FOREIGN KEY ("senderId") REFERENCES "public"."player"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "directMessage" ADD CONSTRAINT "directMessage_receiverId_player_id_fk" FOREIGN KEY ("receiverId") REFERENCES "public"."player"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gameLog" ADD CONSTRAINT "gameLog_playerId_player_id_fk" FOREIGN KEY ("playerId") REFERENCES "public"."player"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player" ADD CONSTRAINT "player_id_user_id_fk" FOREIGN KEY ("id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "chat_message_room_id_idx" ON "chatMessage" USING btree ("roomId");--> statement-breakpoint
CREATE INDEX "chat_message_timestamp_idx" ON "chatMessage" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "dm_sender_id_idx" ON "directMessage" USING btree ("senderId");--> statement-breakpoint
CREATE INDEX "dm_receiver_id_idx" ON "directMessage" USING btree ("receiverId");--> statement-breakpoint
CREATE INDEX "dm_timestamp_idx" ON "directMessage" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "game_log_player_id_idx" ON "gameLog" USING btree ("playerId");--> statement-breakpoint
CREATE INDEX "game_log_timestamp_idx" ON "gameLog" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "player_user_id_idx" ON "player" USING btree ("id");