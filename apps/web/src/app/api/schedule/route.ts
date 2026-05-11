import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@repo/db";
import { requireRole, requireAuth } from "@/lib/rbac";

const scheduleSchema = z.object({
  assignmentId: z.string().min(1),
  dayOfWeek: z.enum([
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
  ]),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Formátum: HH:MM"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Formátum: HH:MM"),
  room: z.string().optional().nullable(),
  substituteTeacherId: z.string().nullable().optional(),
});

export async function GET(req: Request) {
  const session = await requireAuth();
  const url = new URL(req.url);
  const classId = url.searchParams.get("classId");
  const teacherId = url.searchParams.get("teacherId");

  // Scope based on role
  let where: Record<string, unknown> = {};
  if (session.user.role === "STUDENT") {
    // Diák: a saját classId + groups assignmentjei
    const me = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { classId: true, groups: { select: { id: true } } },
    });
    where = {
      assignment: {
        OR: [
          me?.classId ? { classId: me.classId } : { id: "_none" },
          { groupId: { in: me?.groups.map((g) => g.id) ?? [] } },
        ],
      },
    };
  } else if (session.user.role === "INSTRUCTOR") {
    where = { assignment: { teacherId: session.user.id } };
  } else {
    // ADMIN+: optional filter
    if (classId) where = { assignment: { classId } };
    if (teacherId) where = { ...where, assignment: { teacherId } };
  }

  const entries = await prisma.scheduleEntry.findMany({
    where,
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    include: {
      assignment: {
        include: {
          subject: true,
          schoolClass: true,
          group: true,
          teacher: { select: { id: true, name: true } },
        },
      },
      substituteTeacher: { select: { id: true, name: true } },
    },
  });
  return NextResponse.json({ entries });
}

export async function POST(req: Request) {
  await requireRole("ADMIN");
  try {
    const parsed = scheduleSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const created = await prisma.scheduleEntry.create({
      data: {
        assignmentId: parsed.data.assignmentId,
        dayOfWeek: parsed.data.dayOfWeek,
        startTime: parsed.data.startTime,
        endTime: parsed.data.endTime,
        room: parsed.data.room ?? null,
        substituteTeacherId: parsed.data.substituteTeacherId ?? null,
      },
      include: {
        assignment: {
          include: { subject: true, schoolClass: true, group: true, teacher: true },
        },
      },
    });
    return NextResponse.json({ entry: created }, { status: 201 });
  } catch (e) {
    console.error("schedule create error:", e);
    return NextResponse.json({ error: "Belső hiba" }, { status: 500 });
  }
}
