import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@repo/db";
import { auth } from "@/lib/auth";

const bodySchema = z.object({
  assignmentId: z.string().min(1),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  source: z.enum(["manual", "gps", "qr"]).default("gps"),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Bejelentkezés szükséges" }, { status: 401 });
  }
  if (session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "Csak diákok jelentkezhetnek be" }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const assignment = await prisma.subjectAssignment.findUnique({
    where: { id: parsed.data.assignmentId },
    select: { classId: true, subject: { select: { name: true } } },
  });
  if (!assignment) {
    return NextResponse.json({ error: "Hozzárendelés nem található" }, { status: 404 });
  }

  // STUDENT csak a saját osztálya tárgyaira jelenthet jelenlétet.
  const student = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { classId: true },
  });
  if (!student?.classId || student.classId !== assignment.classId) {
    return NextResponse.json(
      { error: "Nem a saját osztályod tárgya" },
      { status: 403 },
    );
  }

  const record = await prisma.attendance.create({
    data: {
      studentId: session.user.id,
      assignmentId: parsed.data.assignmentId,
      latitude: parsed.data.latitude ?? null,
      longitude: parsed.data.longitude ?? null,
      source: parsed.data.source,
      present: true,
    },
  });

  return NextResponse.json({
    attendance: record,
    subject: assignment.subject.name,
  });
}

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Bejelentkezés szükséges" }, { status: 401 });
  }
  if (session.user.role !== "STUDENT") {
    return NextResponse.json({ assignments: [] });
  }
  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { classId: true },
  });
  if (!me?.classId) {
    return NextResponse.json({ assignments: [] });
  }
  const assignments = await prisma.subjectAssignment.findMany({
    where: { classId: me.classId },
    include: { subject: true, teacher: { select: { name: true } } },
    orderBy: [{ year: "desc" }],
  });
  return NextResponse.json({ assignments });
}
