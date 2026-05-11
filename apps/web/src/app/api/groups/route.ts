import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@repo/db";
import { requireRole, requireAuth } from "@/lib/rbac";

const groupSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional().nullable(),
  memberIds: z.array(z.string()).default([]),
});

export async function GET() {
  await requireAuth();
  const groups = await prisma.group.findMany({
    orderBy: { name: "asc" },
    include: {
      members: { select: { id: true, name: true, email: true, role: true } },
      _count: { select: { assignments: true } },
    },
  });
  return NextResponse.json({ groups });
}

export async function POST(req: Request) {
  await requireRole("ADMIN");
  try {
    const parsed = groupSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const created = await prisma.group.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description ?? null,
        members: {
          connect: parsed.data.memberIds.map((id) => ({ id })),
        },
      },
      include: {
        members: { select: { id: true, name: true, email: true, role: true } },
      },
    });
    return NextResponse.json({ group: created }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("Unique")) {
      return NextResponse.json({ error: "Már létezik ilyen nevű csoport" }, { status: 409 });
    }
    console.error("group create error:", msg);
    return NextResponse.json({ error: "Belső hiba" }, { status: 500 });
  }
}
