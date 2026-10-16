import { db } from "@/db";
import { players, users } from "@/db/schema";
import { getSessionUser } from "@/lib/auth";
import { eq } from "drizzle-orm";
import type { Viewer } from "@/lib/types";

function toIso(value: Date | string | null | undefined) {
  if (!value) return new Date().toISOString();
  if (value instanceof Date) return value.toISOString();
  return new Date(value).toISOString();
}

export async function getViewer(): Promise<Viewer> {
  const session = await getSessionUser();
  if (!session) return null;

  const [user] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);
  if (!user) return null;

  const [player] = await db.select().from(players).where(eq(players.userId, user.id)).limit(1);

  return {
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      createdAt: toIso(user.createdAt),
    },
    player: player
      ? {
          ...player,
          createdAt: toIso(player.createdAt),
          updatedAt: toIso(player.updatedAt),
        }
      : null,
  };
}
