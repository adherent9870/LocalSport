import { db } from "@/db";
import { events, groups, joinRequests, players, playingSpots } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import type {
  EventItem,
  GroupItem,
  HomePayload,
  JoinRequestItem,
  Player,
  PlayingSpot,
} from "@/lib/types";

function isoOrNow(value: Date | string | null | undefined) {
  if (!value) return new Date().toISOString();
  if (value instanceof Date) return value.toISOString();
  return new Date(value).toISOString();
}

export async function getPlayers(): Promise<Player[]> {
  const rows = await db.select().from(players).orderBy(desc(players.createdAt));
  return rows.map((row) => ({
    ...row,
    createdAt: isoOrNow(row.createdAt),
    updatedAt: isoOrNow(row.updatedAt),
  }));
}

export async function getPlayingSpots(): Promise<PlayingSpot[]> {
  const rows = await db.select().from(playingSpots).orderBy(desc(playingSpots.createdAt));
  return rows.map((row) => ({
    ...row,
    createdAt: isoOrNow(row.createdAt),
  }));
}

export async function getEvents(): Promise<EventItem[]> {
  const rows = await db
    .select({
      id: events.id,
      title: events.title,
      sport: events.sport,
      description: events.description,
      startTime: events.startTime,
      maxPlayers: events.maxPlayers,
      hostPlayerId: events.hostPlayerId,
      hostName: players.name,
      spotId: events.spotId,
      spotName: playingSpots.name,
      spotArea: playingSpots.area,
      spotLatitude: playingSpots.latitude,
      spotLongitude: playingSpots.longitude,
      requestCount: sql<number>`count(${joinRequests.id})::int`,
      createdAt: events.createdAt,
    })
    .from(events)
    .leftJoin(players, eq(events.hostPlayerId, players.id))
    .leftJoin(playingSpots, eq(events.spotId, playingSpots.id))
    .leftJoin(joinRequests, eq(events.id, joinRequests.eventId))
    .groupBy(
      events.id,
      players.name,
      playingSpots.id,
      playingSpots.name,
      playingSpots.area,
      playingSpots.latitude,
      playingSpots.longitude,
    )
    .orderBy(events.startTime);

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    sport: row.sport,
    description: row.description,
    startTime: isoOrNow(row.startTime),
    maxPlayers: row.maxPlayers,
    hostPlayerId: row.hostPlayerId,
    hostName: row.hostName ?? "Unknown host",
    spotId: row.spotId,
    spotName: row.spotName ?? "Unknown spot",
    spotArea: row.spotArea ?? "Unknown area",
    spotLatitude: row.spotLatitude ?? 0,
    spotLongitude: row.spotLongitude ?? 0,
    requestCount: Number(row.requestCount ?? 0),
    createdAt: isoOrNow(row.createdAt),
  }));
}

export async function getJoinRequests(): Promise<JoinRequestItem[]> {
  const rows = await db
    .select({
      id: joinRequests.id,
      eventId: joinRequests.eventId,
      eventTitle: events.title,
      playerId: joinRequests.playerId,
      playerName: players.name,
      message: joinRequests.message,
      status: joinRequests.status,
      createdAt: joinRequests.createdAt,
    })
    .from(joinRequests)
    .leftJoin(events, eq(joinRequests.eventId, events.id))
    .leftJoin(players, eq(joinRequests.playerId, players.id))
    .orderBy(desc(joinRequests.createdAt));

  return rows.map((row) => ({
    id: row.id,
    eventId: row.eventId,
    eventTitle: row.eventTitle ?? "Unknown event",
    playerId: row.playerId,
    playerName: row.playerName ?? "Unknown player",
    message: row.message,
    status: row.status,
    createdAt: isoOrNow(row.createdAt),
  }));
}

export async function getGroups(): Promise<GroupItem[]> {
  const rows = await db
    .select({
      id: groups.id,
      name: groups.name,
      sport: groups.sport,
      area: groups.area,
      description: groups.description,
      latitude: groups.latitude,
      longitude: groups.longitude,
      createdByPlayerId: groups.createdByPlayerId,
      createdByPlayerName: players.name,
      createdAt: groups.createdAt,
    })
    .from(groups)
    .leftJoin(players, eq(groups.createdByPlayerId, players.id))
    .orderBy(desc(groups.createdAt));

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    sport: row.sport,
    area: row.area,
    description: row.description,
    latitude: row.latitude,
    longitude: row.longitude,
    createdByPlayerId: row.createdByPlayerId,
    createdByPlayerName: row.createdByPlayerName ?? "Unknown player",
    createdAt: isoOrNow(row.createdAt),
  }));
}

export async function getHomePayload(): Promise<HomePayload> {
  const [playersData, spotsData, eventsData, requestsData, groupsData] = await Promise.all([
    getPlayers(),
    getPlayingSpots(),
    getEvents(),
    getJoinRequests(),
    getGroups(),
  ]);

  return {
    players: playersData,
    spots: spotsData,
    events: eventsData,
    joinRequests: requestsData,
    groups: groupsData,
  };
}
