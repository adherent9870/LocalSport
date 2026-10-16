import {
  boolean,
  doublePrecision,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  fullName: varchar("full_name", { length: 140 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).unique(),
  name: varchar("name", { length: 120 }).notNull(),
  sports: text("sports").notNull(),
  area: varchar("area", { length: 160 }).notNull(),
  bio: text("bio").notNull().default(""),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  lookingForGame: boolean("looking_for_game").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const playingSpots = pgTable("playing_spots", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  sport: varchar("sport", { length: 80 }).notNull(),
  area: varchar("area", { length: 160 }).notNull(),
  address: text("address").notNull(),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  createdByPlayerId: integer("created_by_player_id").references(() => players.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 180 }).notNull(),
  sport: varchar("sport", { length: 80 }).notNull(),
  description: text("description").notNull().default(""),
  startTime: timestamp("start_time", { withTimezone: true }).notNull(),
  maxPlayers: integer("max_players").notNull().default(10),
  hostPlayerId: integer("host_player_id")
    .notNull()
    .references(() => players.id, { onDelete: "cascade" }),
  spotId: integer("spot_id")
    .notNull()
    .references(() => playingSpots.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const joinRequests = pgTable("join_requests", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  playerId: integer("player_id")
    .notNull()
    .references(() => players.id, { onDelete: "cascade" }),
  message: text("message").notNull().default(""),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const groups = pgTable("groups", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  sport: varchar("sport", { length: 80 }).notNull(),
  area: varchar("area", { length: 160 }).notNull(),
  description: text("description").notNull().default(""),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  createdByPlayerId: integer("created_by_player_id")
    .notNull()
    .references(() => players.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
