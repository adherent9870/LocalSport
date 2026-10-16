import { db } from "@/db";
import { playingSpots } from "@/db/schema";
import { getViewer } from "@/lib/current-user";
import { getPlayingSpots } from "@/lib/server-data";

export const dynamic = "force-dynamic";

function isValidCoordinate(value: unknown) {
  return typeof value === "number" && Number.isFinite(value);
}

export async function GET() {
  const data = await getPlayingSpots();
  return Response.json(data);
}

export async function POST(request: Request) {
  try {
    const viewer = await getViewer();
    if (!viewer?.player) {
      return Response.json({ error: "Please login and complete your profile first." }, { status: 401 });
    }

    const body = await request.json();

    if (
      typeof body?.name !== "string" ||
      typeof body?.sport !== "string" ||
      typeof body?.area !== "string" ||
      typeof body?.address !== "string" ||
      !isValidCoordinate(body?.latitude) ||
      !isValidCoordinate(body?.longitude)
    ) {
      return Response.json({ error: "Invalid spot payload." }, { status: 400 });
    }

    const [created] = await db
      .insert(playingSpots)
      .values({
        name: body.name.trim(),
        sport: body.sport.trim(),
        area: body.area.trim(),
        address: body.address.trim(),
        latitude: body.latitude,
        longitude: body.longitude,
        createdByPlayerId: viewer.player.id,
      })
      .returning();

    return Response.json(created, { status: 201 });
  } catch {
    return Response.json({ error: "Unable to create spot." }, { status: 500 });
  }
}
