import { SignJWT, jwtVerify } from "jose";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const SESSION_COOKIE = "playlocal_session";

type SessionPayload = {
  userId: number;
  email: string;
  fullName: string;
};

function getAuthSecret() {
  const raw = process.env.AUTH_SECRET ?? "dev-only-auth-secret-change-in-production";
  return new TextEncoder().encode(raw);
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const key = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${key}`;
}

export function verifyPassword(password: string, hash: string) {
  const [salt, originalKey] = hash.split(":");
  if (!salt || !originalKey) return false;
  const key = scryptSync(password, salt, 64).toString("hex");
  return timingSafeEqual(Buffer.from(originalKey, "hex"), Buffer.from(key, "hex"));
}

export async function createSessionToken(payload: SessionPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getAuthSecret());
}

export async function readSessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getAuthSecret());
    return {
      userId: Number(payload.userId),
      email: String(payload.email),
      fullName: String(payload.fullName),
    } satisfies SessionPayload;
  } catch {
    return null;
  }
}

export async function getSessionUser() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return await readSessionToken(token);
}

export async function setSessionCookie(token: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}
