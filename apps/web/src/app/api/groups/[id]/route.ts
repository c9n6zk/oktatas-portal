import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@repo/db";
import { requireRole } from "@/lib/rbac";

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().nullable().optional(),
  memberIds: z.array(z.string()).optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireRole("ADMIN");
  const { id } = await params;
  try {
    const parsed = updateSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const data: {
      name?: string;
      description?: string | null;
      members?: { set: { id: string }[] };
    } = {};
    if (parsed.data.name !== undefined) data.name = parsed.data.name;
    if (parsed.data.description !== undefined) data.description = parsed.data.description;
    if (parsed.data.memberIds !== undefined) {
      data.members = { set: parsed.data.memberIds.map((mid) => ({ id: mid })) };
    }
    const updated = await prisma.group.update({
      where: { id },
      data,
      include: {
        members: { select: { id: true, name: true, email: true, role: true } },
      },
    });
    return NextResponse.json({ group: updated });
  } catch (e) {
    console.error("group patch error:", e);
    return NextResponse.json({ error: "Belső hiba" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireRole("ADMIN");
  const { id } = await params;
  try {
    await prisma.group.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("group delete error:", e);
    return NextResponse.json({ error: "Belső hiba" }, { status: 500 });
  }
}
