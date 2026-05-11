import { NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { calculateWeightedAverage } from "@repo/shared";
import { requireMobileAuth, handleMobileAuthError } from "@/lib/mobile-auth";

export async function GET(req: Request) {
  try {
    const user = await requireMobileAuth(req);
    if (user.role !== "STUDENT") {
      return NextResponse.json({ error: "Csak diákoknak" }, { status: 403 });
    }

    const grades = await prisma.grade.findMany({
      where: { studentId: user.id },
      orderBy: { givenAt: "desc" },
      include: {
        assignment: { include: { subject: true } },
      },
    });

    // Group by subject, calculate weighted average per subject.
    const groups = new Map<
      string,
      { subjectName: string; subjectCode: string; grades: typeof grades; average: number | null }
    >();
    for (const g of grades) {
      const key = g.assignment.subject.id;
      if (!groups.has(key)) {
        groups.set(key, {
          subjectName: g.assignment.subject.name,
          subjectCode: g.assignment.subject.code,
          grades: [],
          average: null,
        });
      }
      groups.get(key)!.grades.push(g);
    }
    for (const g of groups.values()) {
      g.average = calculateWeightedAverage(g.grades);
    }

    return NextResponse.json({ subjects: Array.from(groups.values()) });
  } catch (e) {
    const r = handleMobileAuthError(e);
    if (r) return r;
    console.error("mobile/grades error:", e);
    return NextResponse.json({ error: "Belső hiba" }, { status: 500 });
  }
}
