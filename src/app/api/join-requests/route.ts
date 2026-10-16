import { db } from "@/db";
import { events, joinRequests } from "@/db/schema";
import { getViewer } from "@/lib/current-user";
import { and, eq, inArray, sql } from "drizzle-orm";
import { getJoinRequests } from "@/lib/server-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getJoinRequests();
  return Response.json(data);
}

export async function POST(request: Request) {
  try {
    const viewer = await getViewer();
    if (!viewer?.player) {
      return Response.json({ error: "Please login and complete your profile first." }, { status: 401 });
    }

    const body = await request.json();
    const eventId = Number(body?.eventId);

    if (!Number.isInteger(eventId)) {
      return Response.json({ error: "Invalid join request payload." }, { status: 400 });
    }

    const [eventInfo] = await db
      .select({ id: events.id, maxPlayers: events.maxPlayers })
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    if (!eventInfo) {
      return Response.json({ error: "Event not found." }, { status: 404 });
    }

    const existing = await db
      .select({ id: joinRequests.id })
      .from(joinRequests)
      .where(and(eq(joinRequests.eventId, eventId), eq(joinRequests.playerId, viewer.player.id)))
      .limit(1);

    if (existing.length > 0) {
      return Response.json({ error: "Join request already exists for this player and event." }, { status: 409 });
    }

    const [countRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(joinRequests)
      .where(
        and(
          eq(joinRequests.eventId, eventId),
          inArray(joinRequests.status, ["pending", "approved"]),
        ),
      );

    const currentCount = Number(countRow?.count ?? 0);
    if (currentCount >= eventInfo.maxPlayers) {
      return Response.json({ error: "Event is already full." }, { status: 409 });
    }

    const [created] = await db
      .insert(joinRequests)
      .values({
        eventId,
        playerId: viewer.player.id,
        message: typeof body?.message === "string" ? body.message.trim() : "",
        status: "pending",
      })
      .returning();

    return Response.json(created, { status: 201 });
  } catch {
    return Response.json({ error: "Unable to create join request." }, { status: 500 });
  }
}
