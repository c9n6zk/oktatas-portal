import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@repo/db";
import { requireRole } from "@/lib/rbac";

const patchSchema = z.object({
  substituteTeacherId: z.string().nullable().optional(),
  room: z.string().nullable().optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireRole("ADMIN");
  const { id } = await params;
  try {
    const parsed = patchSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const updated = await prisma.scheduleEntry.update({
      where: { id },
      data: parsed.data,
    });
    return NextResponse.json({ entry: updated });
  } catch (e) {
    console.error("schedule patch error:", e);
    return NextResponse.json({ error: "Belső hiba" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireRole("ADMIN");
  const { id } = await params;
  try {
    await prisma.scheduleEntry.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("schedule delete error:", e);
    return NextResponse.json({ error: "Belső hiba" }, { status: 500 });
  }
}
