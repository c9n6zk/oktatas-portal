import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { prisma } from "@repo/db";

const SECRET = new TextEncoder().encode(process.env.AUTH_SECRET ?? "dev-secret-change-me");

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Nincs token" }, { status: 401 });
  }

  try {
    const { payload } = await jwtVerify(auth.slice(7), SECRET);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub as string },
      select: { id: true, email: true, name: true, role: true },
    });
    if (!user) return NextResponse.json({ error: "Felhasználó nem található" }, { status: 404 });
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "Érvénytelen token" }, { status: 401 });
  }
}
