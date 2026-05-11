import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@repo/db";
import { requireMobileAuth, handleMobileAuthError } from "@/lib/mobile-auth";

const attendanceSchema = z.object({
  assignmentId: z.string().min(1),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  source: z.enum(["manual", "gps", "qr"]).default("gps"),
});

export async function POST(req: Request) {
  try {
    const user = await requireMobileAuth(req);
    if (user.role !== "STUDENT") {
      return NextResponse.json({ error: "Csak diákoknak" }, { status: 403 });
    }

    const parsed = attendanceSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    // Validate the diák has this assignment (via class).
    const assignment = await prisma.subjectAssignment.findUnique({
      where: { id: parsed.data.assignmentId },
      select: { classId: true, subject: { select: { name: true } } },
    });
    if (!assignment) {
      return NextResponse.json({ error: "Hozzárendelés nem található" }, { status: 404 });
    }
    if (assignment.classId !== user.classId) {
      return NextResponse.json(
        { error: "Nem a saját osztályod tárgya" },
        { status: 403 },
      );
    }

    const record = await prisma.attendance.create({
      data: {
        studentId: user.id,
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
  } catch (e) {
    const r = handleMobileAuthError(e);
    if (r) return r;
    console.error("mobile/attendance error:", e);
    return NextResponse.json({ error: "Belső hiba" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const user = await requireMobileAuth(req);

    if (user.role === "STUDENT") {
      // Diák: a saját class assignmentjei közül választhat
      if (!user.classId) {
        return NextResponse.json({ assignments: [] });
      }
      const assignments = await prisma.subjectAssignment.findMany({
        where: { classId: user.classId },
        include: { subject: true, teacher: { select: { name: true } } },
        orderBy: [{ year: "desc" }],
      });
      return NextResponse.json({ assignments });
    }

    return NextResponse.json({ error: "Csak diákoknak" }, { status: 403 });
  } catch (e) {
    const r = handleMobileAuthError(e);
    if (r) return r;
    console.error("mobile/attendance GET error:", e);
    return NextResponse.json({ error: "Belső hiba" }, { status: 500 });
  }
}
