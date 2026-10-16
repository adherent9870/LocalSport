import { db } from "@/db";
import { groups } from "@/db/schema";
import { getViewer } from "@/lib/current-user";
import { getGroups } from "@/lib/server-data";

export const dynamic = "force-dynamic";

function isValidCoordinate(value: unknown) {
  return typeof value === "number" && Number.isFinite(value);
}

export async function GET() {
  const data = await getGroups();
  return Response.json(data);
}

export async function POST(request: Request) {
  try {
    const viewer = await getViewer();
    if (!viewer?.player) {
      return Response.json({ error: "Please login and complete profile first." }, { status: 401 });
    }

    const body = await request.json();

    if (
      typeof body?.name !== "string" ||
      typeof body?.sport !== "string" ||
      typeof body?.area !== "string" ||
      !isValidCoordinate(body?.latitude) ||
      !isValidCoordinate(body?.longitude)
    ) {
      return Response.json({ error: "Invalid group payload." }, { status: 400 });
    }

    const [created] = await db
      .insert(groups)
      .values({
        name: body.name.trim(),
        sport: body.sport.trim(),
        area: body.area.trim(),
        description: typeof body?.description === "string" ? body.description.trim() : "",
        latitude: body.latitude,
        longitude: body.longitude,
        createdByPlayerId: viewer.player.id,
      })
      .returning();

    return Response.json(created, { status: 201 });
  } catch {
    return Response.json({ error: "Unable to create group." }, { status: 500 });
  }
}
