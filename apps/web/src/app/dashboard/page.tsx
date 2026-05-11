import Link from "next/link";
import { requireAuth } from "@/lib/rbac";
import { prisma } from "@repo/db";
import { calculateWeightedAverage } from "@repo/shared";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const ROLE_GREETING: Record<string, string> = {
  SUPERADMIN: "Szuper-adminisztrátor",
  ADMIN: "Adminisztrátor",
  INSTRUCTOR: "Oktató",
  STUDENT: "Diák",
};

export default async function DashboardPage() {
  const session = await requireAuth();
  const role = session.user.role;

  if (role === "STUDENT") {
    return <StudentDashboard userId={session.user.id} userName={session.user.name ?? ""} />;
  }
  if (role === "INSTRUCTOR") {
    return <InstructorDashboard userId={session.user.id} userName={session.user.name ?? ""} />;
  }
  // ADMIN, SUPERADMIN
  return <AdminDashboard userName={session.user.name ?? ""} role={role} />;
}

async function StudentDashboard({ userId, userName }: { userId: string; userName: string }) {
  const [student, grades, events] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: { schoolClass: true },
    }),
    prisma.grade.findMany({
      where: { studentId: userId },
      include: { assignment: { include: { subject: true } } },
    }),
    prisma.event.findMany({
      where: { startsAt: { gte: new Date() } },
      take: 3,
      orderBy: { startsAt: "asc" },
    }),
  ]);

  // Group by subject for averages
  const bySubject = new Map<string, typeof grades>();
  for (const g of grades) {
    const k = g.assignment.subject.id;
    if (!bySubject.has(k)) bySubject.set(k, []);
    bySubject.get(k)!.push(g);
  }
  const subjectAvgs = Array.from(bySubject.entries()).map(([id, gs]) => ({
    id,
    name: gs[0].assignment.subject.name,
    avg: calculateWeightedAverage(gs),
    count: gs.length,
  }));
  const overall =
    subjectAvgs.length > 0
      ? subjectAvgs.reduce((s, x) => s + (x.avg ?? 0), 0) /
        subjectAvgs.filter((x) => x.avg !== null).length
      : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Üdv, {userName}!</h1>
        <p className="text-muted-foreground">
          Diák · {student?.schoolClass ? `${student.schoolClass.startYear}/${student.schoolClass.identifier} osztály` : "nincs osztály"}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tantárgyak</CardDescription>
            <CardTitle className="text-3xl">{subjectAvgs.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Összes jegy</CardDescription>
            <CardTitle className="text-3xl">{grades.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tanulmányi átlag</CardDescription>
            <CardTitle className="text-3xl tabular-nums">
              {overall !== null && !isNaN(overall) ? overall.toFixed(2) : "—"}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Tantárgyak átlaga</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href="/student/grades">Részletek →</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {subjectAvgs.length === 0 ? (
              <p className="text-muted-foreground text-sm">Még nincsenek jegyeid.</p>
            ) : (
              <div className="space-y-2">
                {subjectAvgs.map((s) => (
                  <div key={s.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <div className="font-medium">{s.name}</div>
                      <div className="text-xs text-muted-foreground">{s.count} jegy</div>
                    </div>
                    <div className="text-xl font-bold tabular-nums">
                      {s.avg !== null ? s.avg.toFixed(2) : "—"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Közelgő események</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href="/events">Összes →</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nincs közelgő esemény.</p>
            ) : (
              <div className="space-y-3">
                {events.map((e) => (
                  <div key={e.id} className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-medium">{e.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(e.startsAt).toLocaleString("hu-HU", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </div>
                    </div>
                    {e.location && <Badge variant="outline">{e.location}</Badge>}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

async function InstructorDashboard({ userId, userName }: { userId: string; userName: string }) {
  const [assignments, gradesCount, events] = await Promise.all([
    prisma.subjectAssignment.findMany({
      where: { teacherId: userId },
      include: {
        subject: true,
        schoolClass: { include: { _count: { select: { students: true } } } },
        grades: true,
      },
    }),
    prisma.grade.count({ where: { assignment: { teacherId: userId } } }),
    prisma.event.findMany({
      where: { startsAt: { gte: new Date() } },
      take: 3,
      orderBy: { startsAt: "asc" },
    }),
  ]);

  const totalStudents = assignments.reduce((s, a) => s + a.schoolClass._count.students, 0);

  // Per-class average (all grades I gave)
  const classStats = assignments.map((a) => {
    const avg = calculateWeightedAverage(a.grades.map((g) => ({ value: g.value, weight: g.weight, type: g.type })));
    return {
      id: a.id,
      subjectName: a.subject.name,
      className: `${a.schoolClass.startYear}/${a.schoolClass.identifier}`,
      gradeCount: a.grades.length,
      studentCount: a.schoolClass._count.students,
      avg,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Üdv, {userName}!</h1>
        <p className="text-muted-foreground">Oktató · {assignments.length} hozzárendelés</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tárgyhozzárendelések</CardDescription>
            <CardTitle className="text-3xl">{assignments.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Diákok összesen</CardDescription>
            <CardTitle className="text-3xl">{totalStudents}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Beírt jegyek</CardDescription>
            <CardTitle className="text-3xl">{gradesCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Osztály statisztika</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href="/instructor/grading">Jegybeírás →</Link>
            </Button>
          </div>
          <CardDescription>Súlyozott átlag osztály × tárgy bontásban</CardDescription>
        </CardHeader>
        <CardContent>
          {classStats.length === 0 ? (
            <p className="text-muted-foreground text-sm">Még nincs hozzárendelt tárgyad.</p>
          ) : (
            <div className="space-y-3">
              {classStats.map((c) => (
                <div key={c.id} className="flex items-center justify-between border-b last:border-0 pb-3 last:pb-0">
                  <div>
                    <div className="font-medium">{c.subjectName}</div>
                    <div className="text-xs text-muted-foreground">
                      {c.className} osztály · {c.studentCount} diák · {c.gradeCount} jegy
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold tabular-nums">
                      {c.avg !== null ? c.avg.toFixed(2) : "—"}
                    </div>
                    <div className="text-xs text-muted-foreground">átlag</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {events.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Közelgő események</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {events.map((e) => (
                <div key={e.id} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{e.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(e.startsAt).toLocaleString("hu-HU", { dateStyle: "medium", timeStyle: "short" })}
                    </div>
                  </div>
                  {e.location && <Badge variant="outline">{e.location}</Badge>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

async function AdminDashboard({ userName, role }: { userName: string; role: string }) {
  const [
    userCount,
    studentCount,
    instructorCount,
    adminCount,
    classCount,
    subjectCount,
    assignmentCount,
    gradeCount,
    eventCount,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.user.count({ where: { role: "INSTRUCTOR" } }),
    prisma.user.count({ where: { role: { in: ["ADMIN", "SUPERADMIN"] } } }),
    prisma.schoolClass.count(),
    prisma.subject.count(),
    prisma.subjectAssignment.count(),
    prisma.grade.count(),
    prisma.event.count(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Üdv, {userName}!</h1>
        <p className="text-muted-foreground">{ROLE_GREETING[role]} áttekintés</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Felhasználók</CardDescription>
            <CardTitle className="text-3xl">{userCount}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-1">
            <div>{studentCount} diák · {instructorCount} oktató</div>
            <div>{adminCount} admin / szuperadmin</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Osztályok</CardDescription>
            <CardTitle className="text-3xl">{classCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tantárgyak</CardDescription>
            <CardTitle className="text-3xl">{subjectCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Hozzárendelések</CardDescription>
            <CardTitle className="text-3xl">{assignmentCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Beírt jegyek</CardDescription>
            <CardTitle className="text-3xl">{gradeCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Iskolai események</CardDescription>
            <CardTitle className="text-3xl">{eventCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <QuickLink href="/admin/users" title="Felhasználók" />
        <QuickLink href="/admin/classes" title="Osztályok" />
        <QuickLink href="/admin/subjects" title="Tantárgyak" />
        <QuickLink href="/admin/assignments" title="Hozzárendelések" />
      </div>
    </div>
  );
}

function QuickLink({ href, title }: { href: string; title: string }) {
  return (
    <Button variant="outline" asChild className="h-20 text-base">
      <Link href={href}>{title} →</Link>
    </Button>
  );
}
