import { NextResponse } from "next/server";
import { jwtVerify, type JWTPayload } from "jose";
import { prisma } from "@repo/db";
import type { Role } from "@repo/shared";

const SECRET = new TextEncoder().encode(process.env.AUTH_SECRET ?? "dev-secret-change-me");

export interface MobileUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  classId: string | null;
}

/**
 * Bearer token validation a mobil API endpointokhoz.
 * Sikertelen auth esetén throw-ol, amit a hívó NextResponse-ra fordít.
 */
export async function requireMobileAuth(req: Request): Promise<MobileUser> {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    throw new MobileAuthError("Nincs token", 401);
  }
  let payload: JWTPayload;
  try {
    const result = await jwtVerify(auth.slice(7), SECRET);
    payload = result.payload;
  } catch {
    throw new MobileAuthError("Érvénytelen token", 401);
  }
  const user = await prisma.user.findUnique({
    where: { id: payload.sub as string },
    select: { id: true, email: true, name: true, role: true, classId: true },
  });
  if (!user) throw new MobileAuthError("Felhasználó nem található", 404);
  return user;
}

export class MobileAuthError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

export function handleMobileAuthError(e: unknown): NextResponse | null {
  if (e instanceof MobileAuthError) {
    return NextResponse.json({ error: e.message }, { status: e.status });
  }
  return null;
}
