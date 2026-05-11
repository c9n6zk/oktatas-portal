import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@repo/db";
import { requireAuth, requireRole } from "@/lib/rbac";

const voteSchema = z.object({
  optionId: z.string().min(1),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth();
  const { id } = await params;
  try {
    const parsed = voteSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    // Ellenőrizzük hogy a poll még nyitva van-e
    const poll = await prisma.poll.findUnique({
      where: { id },
      select: { closesAt: true },
    });
    if (!poll) {
      return NextResponse.json({ error: "A szavazás nem található" }, { status: 404 });
    }
    if (poll.closesAt && poll.closesAt < new Date()) {
      return NextResponse.json({ error: "A szavazás már lezárult" }, { status: 410 });
    }

    // Upsert response (egy user egy szavazásra egyszer szavaz, de módosíthatja)
    const response = await prisma.pollResponse.upsert({
      where: { pollId_userId: { pollId: id, userId: session.user.id } },
      update: { optionId: parsed.data.optionId },
      create: {
        pollId: id,
        userId: session.user.id,
        optionId: parsed.data.optionId,
      },
    });
    return NextResponse.json({ response });
  } catch (e) {
    console.error("poll vote error:", e);
    return NextResponse.json({ error: "Belső hiba" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireRole("ADMIN");
  const { id } = await params;
  try {
    await prisma.poll.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("poll delete error:", e);
    return NextResponse.json({ error: "Belső hiba" }, { status: 500 });
  }
}
