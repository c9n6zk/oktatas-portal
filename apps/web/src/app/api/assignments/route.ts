import { NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { subjectAssignmentSchema } from "@repo/shared";
import { requireRole } from "@/lib/rbac";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const year = url.searchParams.get("year");
  const teacherId = url.searchParams.get("teacherId");
  const classId = url.searchParams.get("classId");
  const groupId = url.searchParams.get("groupId");

  const assignments = await prisma.subjectAssignment.findMany({
    where: {
      ...(year ? { year: Number(year) } : {}),
      ...(teacherId ? { teacherId } : {}),
      ...(classId ? { classId } : {}),
      ...(groupId ? { groupId } : {}),
    },
    orderBy: [{ year: "desc" }],
    include: {
      subject: true,
      schoolClass: true,
      group: true,
      teacher: { select: { id: true, name: true, email: true } },
      _count: { select: { grades: true } },
    },
  });
  return NextResponse.json({ assignments });
}

export async function POST(req: Request) {
  await requireRole("ADMIN");
  try {
    const parsed = subjectAssignmentSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const created = await prisma.subjectAssignment.create({
      data: {
        year: parsed.data.year,
        subjectId: parsed.data.subjectId,
        classId: parsed.data.classId ?? null,
        groupId: parsed.data.groupId ?? null,
        teacherId: parsed.data.teacherId,
      },
      include: { subject: true, schoolClass: true, group: true, teacher: true },
    });
    return NextResponse.json({ assignment: created }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("Unique")) {
      return NextResponse.json(
        { error: "Ez az osztály ebben az évben már kapott erre a tárgyra hozzárendelést" },
        { status: 409 },
      );
    }
    console.error("assignment create error:", msg);
    return NextResponse.json({ error: "Belső hiba" }, { status: 500 });
  }
}
