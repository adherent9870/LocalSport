import { db } from "@/db";
import { players } from "@/db/schema";
import { getPlayers } from "@/lib/server-data";

export const dynamic = "force-dynamic";

function isValidCoordinate(value: unknown) {
  return typeof value === "number" && Number.isFinite(value);
}

export async function GET() {
  const data = await getPlayers();
  return Response.json(data);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (
      typeof body?.name !== "string" ||
      typeof body?.sports !== "string" ||
      typeof body?.area !== "string" ||
      !isValidCoordinate(body?.latitude) ||
      !isValidCoordinate(body?.longitude)
    ) {
      return Response.json({ error: "Invalid player payload." }, { status: 400 });
    }

    const [created] = await db
      .insert(players)
      .values({
        name: body.name.trim(),
        sports: body.sports.trim(),
        area: body.area.trim(),
        bio: typeof body.bio === "string" ? body.bio.trim() : "",
        latitude: body.latitude,
        longitude: body.longitude,
        lookingForGame: Boolean(body.lookingForGame),
      })
      .returning();

    return Response.json(created, { status: 201 });
  } catch {
    return Response.json({ error: "Unable to create player." }, { status: 500 });
  }
}
