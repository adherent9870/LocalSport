import { db } from "@/db";
import { events } from "@/db/schema";
import { getViewer } from "@/lib/current-user";
import { getEvents } from "@/lib/server-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getEvents();
  return Response.json(data);
}

export async function POST(request: Request) {
  try {
    const viewer = await getViewer();
    if (!viewer?.player) {
      return Response.json({ error: "Please login and complete your profile first." }, { status: 401 });
    }

    const body = await request.json();

    const spotId = Number(body?.spotId);
    const maxPlayers = Number(body?.maxPlayers);
    const startTime = new Date(body?.startTime);

    if (
      typeof body?.title !== "string" ||
      typeof body?.sport !== "string" ||
      !Number.isInteger(spotId) ||
      !Number.isFinite(maxPlayers) ||
      Number.isNaN(startTime.getTime())
    ) {
      return Response.json({ error: "Invalid event payload." }, { status: 400 });
    }

    const [created] = await db
      .insert(events)
      .values({
        title: body.title.trim(),
        sport: body.sport.trim(),
        description: typeof body.description === "string" ? body.description.trim() : "",
        startTime,
        maxPlayers,
        hostPlayerId: viewer.player.id,
        spotId,
      })
      .returning();

    return Response.json(created, { status: 201 });
  } catch {
    return Response.json({ error: "Unable to create event." }, { status: 500 });
  }
}
