import { NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { subjectSchema } from "@repo/shared";
import { requireRole } from "@/lib/rbac";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireRole("ADMIN");
  const { id } = await params;
  try {
    const parsed = subjectSchema.partial().safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const updated = await prisma.subject.update({ where: { id }, data: parsed.data });
    return NextResponse.json({ subject: updated });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("subject patch error:", msg);
    return NextResponse.json({ error: "Belső hiba" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireRole("ADMIN");
  const { id } = await params;
  try {
    await prisma.subject.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("subject delete error:", msg);
    return NextResponse.json({ error: "Belső hiba" }, { status: 500 });
  }
}
