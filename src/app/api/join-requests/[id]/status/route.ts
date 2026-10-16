import { db } from "@/db";
import { events, joinRequests } from "@/db/schema";
import { getViewer } from "@/lib/current-user";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const viewer = await getViewer();
    if (!viewer?.player) {
      return Response.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await context.params;
    const requestId = Number(id);
    const body = (await request.json()) as { status?: string };

    if (!Number.isInteger(requestId)) {
      return Response.json({ error: "Invalid request id." }, { status: 400 });
    }

    if (body.status !== "approved" && body.status !== "rejected") {
      return Response.json({ error: "Status must be approved or rejected." }, { status: 400 });
    }

    const [candidate] = await db
      .select({
        id: joinRequests.id,
        hostPlayerId: events.hostPlayerId,
      })
      .from(joinRequests)
      .innerJoin(events, eq(joinRequests.eventId, events.id))
      .where(eq(joinRequests.id, requestId))
      .limit(1);

    if (!candidate) {
      return Response.json({ error: "Join request not found." }, { status: 404 });
    }

    if (candidate.hostPlayerId !== viewer.player.id) {
      return Response.json({ error: "Only event hosts can update request status." }, { status: 403 });
    }

    const [updated] = await db
      .update(joinRequests)
      .set({ status: body.status })
      .where(eq(joinRequests.id, requestId))
      .returning();

    return Response.json(updated);
  } catch {
    return Response.json({ error: "Unable to update request status." }, { status: 500 });
  }
}
