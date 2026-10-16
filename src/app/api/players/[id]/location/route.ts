import { db } from "@/db";
import { players } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

function toNumber(value: unknown) {
  return typeof value === "number" ? value : Number.NaN;
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const playerId = Number(id);
    const body = await request.json();

    const latitude = toNumber(body?.latitude);
    const longitude = toNumber(body?.longitude);

    if (!Number.isInteger(playerId) || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return Response.json({ error: "Invalid location payload." }, { status: 400 });
    }

    const [updated] = await db
      .update(players)
      .set({ latitude, longitude, updatedAt: new Date() })
      .where(eq(players.id, playerId))
      .returning();

    if (!updated) {
      return Response.json({ error: "Player not found." }, { status: 404 });
    }

    return Response.json(updated);
  } catch {
    return Response.json({ error: "Unable to update location." }, { status: 500 });
  }
}
