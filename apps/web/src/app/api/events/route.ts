import { NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { eventSchema } from "@repo/shared";
import { requireAuth, requireRole } from "@/lib/rbac";

export async function GET() {
  await requireAuth(); // mindenki bejelentkezve nézheti
  const events = await prisma.event.findMany({
    orderBy: { startsAt: "asc" },
    include: { createdBy: { select: { name: true } } },
  });
  return NextResponse.json({ events });
}

export async function POST(req: Request) {
  const session = await requireRole("ADMIN");
  try {
    const parsed = eventSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const created = await prisma.event.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description ?? null,
        location: parsed.data.location ?? null,
        startsAt: new Date(parsed.data.startsAt),
        endsAt: parsed.data.endsAt ? new Date(parsed.data.endsAt) : null,
        createdById: session.user.id,
      },
    });
    return NextResponse.json({ event: created }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("event create error:", msg);
    return NextResponse.json({ error: "Belső hiba" }, { status: 500 });
  }
}
