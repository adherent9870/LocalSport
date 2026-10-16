import { db } from "@/db";
import { players } from "@/db/schema";
import { getViewer } from "@/lib/current-user";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function PUT(request: Request) {
  try {
    const viewer = await getViewer();
    if (!viewer) {
      return Response.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await request.json();
    const name = String(body?.name ?? "").trim();
    const sports = String(body?.sports ?? "").trim();
    const area = String(body?.area ?? "").trim();
    const bio = String(body?.bio ?? "").trim();
    const latitude = Number(body?.latitude);
    const longitude = Number(body?.longitude);
    const lookingForGame = Boolean(body?.lookingForGame);

    if (!name || !sports || !area || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return Response.json({ error: "Invalid profile payload." }, { status: 400 });
    }

    if (viewer.player) {
      const [updated] = await db
        .update(players)
        .set({
          name,
          sports,
          area,
          bio,
          latitude,
          longitude,
          lookingForGame,
          updatedAt: new Date(),
        })
        .where(eq(players.id, viewer.player.id))
        .returning();
      return Response.json(updated);
    }

    const [created] = await db
      .insert(players)
      .values({
        userId: viewer.user.id,
        name,
        sports,
        area,
        bio,
        latitude,
        longitude,
        lookingForGame,
      })
      .returning();

    return Response.json(created, { status: 201 });
  } catch {
    return Response.json({ error: "Unable to save profile." }, { status: 500 });
  }
}
