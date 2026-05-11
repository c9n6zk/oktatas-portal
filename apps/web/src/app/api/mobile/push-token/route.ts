import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@repo/db";
import { requireMobileAuth, handleMobileAuthError } from "@/lib/mobile-auth";

const bodySchema = z.object({
  token: z.string().min(10),
  platform: z.enum(["ios", "android", "web", "unknown"]).optional(),
});

export async function POST(req: Request) {
  try {
    const user = await requireMobileAuth(req);
    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const { token, platform } = parsed.data;
    await prisma.pushToken.upsert({
      where: { token },
      create: { token, platform: platform ?? "unknown", userId: user.id },
      update: { userId: user.id, lastUsedAt: new Date(), platform: platform ?? "unknown" },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const r = handleMobileAuthError(e);
    if (r) return r;
    console.error("mobile/push-token error:", e);
    return NextResponse.json({ error: "Belső hiba" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await requireMobileAuth(req);
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    if (!token) {
      return NextResponse.json({ error: "Token query param szükséges" }, { status: 400 });
    }
    await prisma.pushToken.deleteMany({ where: { token, userId: user.id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const r = handleMobileAuthError(e);
    if (r) return r;
    return NextResponse.json({ error: "Belső hiba" }, { status: 500 });
  }
}
