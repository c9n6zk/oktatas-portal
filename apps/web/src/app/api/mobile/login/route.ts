// Mobil auth endpoint: JWT-t ad vissza Expo kliensnek.
// Külön a NextAuth web flow-tól, hogy a mobil egyszerű Bearer tokent használjon.
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { prisma } from "@repo/db";
import { loginSchema } from "@repo/shared";

const SECRET = new TextEncoder().encode(process.env.AUTH_SECRET ?? "dev-secret-change-me");

export async function POST(req: Request) {
  try {
    const parsed = loginSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Érvénytelen adatok" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
      return NextResponse.json({ error: "Hibás email vagy jelszó" }, { status: 401 });
    }

    const token = await new SignJWT({ sub: user.id, role: user.role })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(SECRET);

    return NextResponse.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (e) {
    console.error("mobile login error", e);
    return NextResponse.json({ error: "Belső hiba" }, { status: 500 });
  }
}
