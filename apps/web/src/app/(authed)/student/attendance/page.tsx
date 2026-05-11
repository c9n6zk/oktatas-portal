import { requireAnyRole } from "@/lib/rbac";
import { prisma } from "@repo/db";
import { Card, CardContent } from "@/components/ui/card";
import { StudentAttendancePanel } from "./StudentAttendancePanel";

export default async function StudentAttendancePage() {
  const session = await requireAnyRole(["STUDENT"]);

  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { classId: true },
  });

  if (!me?.classId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Jelenlét</h1>
          <p className="text-muted-foreground">GPS-alapú bejelentkezés az óráidra</p>
        </div>
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Nem tartozol osztályhoz. Szólj egy adminisztrátornak.
          </CardContent>
        </Card>
      </div>
    );
  }

  const assignments = await prisma.subjectAssignment.findMany({
    where: { classId: me.classId },
    orderBy: [{ year: "desc" }],
    include: {
      subject: { select: { name: true, code: true } },
      teacher: { select: { name: true } },
    },
  });

  const items = assignments.map((a) => ({
    id: a.id,
    year: a.year,
    subjectName: a.subject.name,
    subjectCode: a.subject.code,
    teacherName: a.teacher.name,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Jelenlét</h1>
        <p className="text-muted-foreground">
          GPS-alapú bejelentkezés óra előtt — kattints az &ldquo;Itt vagyok&rdquo; gombra a megfelelő tárgy alatt.
        </p>
      </div>
      <StudentAttendancePanel assignments={items} />
    </div>
  );
}
