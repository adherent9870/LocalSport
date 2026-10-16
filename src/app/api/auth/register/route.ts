import { db } from "@/db";
import { players, users } from "@/db/schema";
import { createSessionToken, hashPassword, setSessionCookie } from "@/lib/auth";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const fullName = String(body?.fullName ?? "").trim();
    const email = String(body?.email ?? "").trim().toLowerCase();
    const password = String(body?.password ?? "");

    const playerName = String(body?.playerName ?? fullName).trim();
    const sports = String(body?.sports ?? "").trim();
    const area = String(body?.area ?? "").trim();
    const bio = String(body?.bio ?? "").trim();
    const latitude = Number(body?.latitude);
    const longitude = Number(body?.longitude);
    const lookingForGame = Boolean(body?.lookingForGame);

    if (!fullName || !validEmail(email) || password.length < 8) {
      return Response.json({ error: "Please provide valid name, email and password (8+ chars)." }, { status: 400 });
    }

    if (!playerName || !sports || !area || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return Response.json({ error: "Complete your sports profile details." }, { status: 400 });
    }

    const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
    if (existing) {
      return Response.json({ error: "Email is already registered." }, { status: 409 });
    }

    const passwordHash = hashPassword(password);

    const createdUser = await db.transaction(async (tx) => {
      const [user] = await tx
        .insert(users)
        .values({ fullName, email, passwordHash })
        .returning();

      await tx.insert(players).values({
        userId: user.id,
        name: playerName,
        sports,
        area,
        bio,
        latitude,
        longitude,
        lookingForGame,
      });

      return user;
    });

    const token = await createSessionToken({
      userId: createdUser.id,
      email: createdUser.email,
      fullName: createdUser.fullName,
    });
    await setSessionCookie(token);

    return Response.json({ ok: true, user: { id: createdUser.id, fullName, email } }, { status: 201 });
  } catch {
    return Response.json({ error: "Registration failed." }, { status: 500 });
  }
}
