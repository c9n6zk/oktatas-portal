import { requireRole } from "@/lib/rbac";
import { prisma } from "@repo/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AssignmentsPanel } from "./AssignmentsPanel";

export default async function AdminAssignmentsPage() {
  await requireRole("ADMIN");

  const [assignments, subjects, classes, teachers] = await Promise.all([
    prisma.subjectAssignment.findMany({
      orderBy: [{ year: "desc" }],
      include: {
        subject: true,
        schoolClass: true,
        teacher: { select: { name: true, email: true } },
        _count: { select: { grades: true } },
      },
    }),
    prisma.subject.findMany({ orderBy: { name: "asc" } }),
    prisma.schoolClass.findMany({ orderBy: [{ startYear: "desc" }, { identifier: "asc" }] }),
    prisma.user.findMany({
      where: { role: { in: ["INSTRUCTOR", "ADMIN", "SUPERADMIN"] } },
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true, role: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tárgyhozzárendelések</h1>
        <p className="text-muted-foreground">
          Adott évben mely oktató tanítja mely osztálynak mely tárgyat.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hozzárendelések ({assignments.length})</CardTitle>
          <CardDescription>
            Egy év + tárgy + osztály kombináció csak egyszer szerepelhet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AssignmentsPanel
            initial={assignments.map((a) => ({
              id: a.id,
              year: a.year,
              subjectName: a.subject.name,
              subjectCode: a.subject.code,
              className: `${a.schoolClass.startYear}/${a.schoolClass.identifier}`,
              teacherName: a.teacher.name,
              gradeCount: a._count.grades,
            }))}
            subjects={subjects.map((s) => ({ id: s.id, label: `${s.code} — ${s.name}` }))}
            classes={classes.map((c) => ({
              id: c.id,
              label: `${c.startYear}/${c.identifier}`,
            }))}
            teachers={teachers.map((t) => ({ id: t.id, label: `${t.name} (${t.role})` }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
