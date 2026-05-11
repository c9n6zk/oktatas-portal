import { NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { gradeSchema, DEFAULT_GRADE_WEIGHT } from "@repo/shared";
import { requireAnyRole, requireAuth } from "@/lib/rbac";

export async function GET(req: Request) {
  const session = await requireAuth();
  const url = new URL(req.url);
  const studentId = url.searchParams.get("studentId");
  const assignmentId = url.searchParams.get("assignmentId");

  // Role-based scoping:
  // - STUDENT: only their own grades
  // - INSTRUCTOR: only grades for assignments they teach
  // - ADMIN / SUPERADMIN: any
  const where: Parameters<typeof prisma.grade.findMany>[0] = { where: {} };
  if (session.user.role === "STUDENT") {
    where.where = { studentId: session.user.id };
  } else if (session.user.role === "INSTRUCTOR") {
    where.where = { assignment: { teacherId: session.user.id } };
    if (studentId) where.where.studentId = studentId;
    if (assignmentId) where.where.assignmentId = assignmentId;
  } else {
    if (studentId) where.where!.studentId = studentId;
    if (assignmentId) where.where!.assignmentId = assignmentId;
  }

  const grades = await prisma.grade.findMany({
    ...where,
    orderBy: { givenAt: "desc" },
    include: {
      assignment: {
        include: { subject: true, schoolClass: true, teacher: { select: { name: true } } },
      },
      student: { select: { id: true, name: true, email: true } },
    },
  });
  return NextResponse.json({ grades });
}

export async function POST(req: Request) {
  // INSTRUCTOR vagy ADMIN+ írhat be jegyet
  const session = await requireAnyRole(["INSTRUCTOR", "ADMIN", "SUPERADMIN"]);
  try {
    const parsed = gradeSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    // INSTRUCTOR csak a saját assignment-jeire írhat
    if (session.user.role === "INSTRUCTOR") {
      const a = await prisma.subjectAssignment.findUnique({
        where: { id: parsed.data.assignmentId },
        select: { teacherId: true },
      });
      if (!a || a.teacherId !== session.user.id) {
        return NextResponse.json(
          { error: "Csak a saját tárgyaidban írhatsz be jegyet" },
          { status: 403 },
        );
      }
    }

    const weight = parsed.data.weight ?? DEFAULT_GRADE_WEIGHT[parsed.data.type];
    const created = await prisma.grade.create({
      data: {
        studentId: parsed.data.studentId,
        assignmentId: parsed.data.assignmentId,
        value: parsed.data.value,
        type: parsed.data.type,
        weight,
        comment: parsed.data.comment ?? null,
      },
      include: { student: { select: { name: true } } },
    });
    return NextResponse.json({ grade: created }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("grade create error:", msg);
    return NextResponse.json({ error: "Belső hiba" }, { status: 500 });
  }
}
