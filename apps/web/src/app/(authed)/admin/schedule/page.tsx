import { requireRole } from "@/lib/rbac";
import { prisma } from "@repo/db";
import { SchedulePanel } from "./SchedulePanel";

export default async function AdminSchedulePage() {
  await requireRole("ADMIN");

  const [assignments, teachers] = await Promise.all([
    prisma.subjectAssignment.findMany({
      orderBy: [{ year: "desc" }],
      include: {
        subject: true,
        schoolClass: true,
        group: true,
        teacher: { select: { name: true } },
        scheduleEntries: {
          orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
          include: { substituteTeacher: { select: { id: true, name: true } } },
        },
      },
    }),
    prisma.user.findMany({
      where: { role: { in: ["INSTRUCTOR", "ADMIN", "SUPERADMIN"] } },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Órarend kezelés</h1>
        <p className="text-muted-foreground">
          {assignments.length} hozzárendelés · órák hozzáadása nap+időpont+terem szerint. Helyettesítő tanár külön jelölhető óránként.
        </p>
      </div>

      <SchedulePanel
        assignments={assignments.map((a) => ({
          id: a.id,
          label: `${a.subject.name} · ${
            a.schoolClass
              ? `${a.schoolClass.startYear}/${a.schoolClass.identifier}`
              : a.group
                ? `Csoport: ${a.group.name}`
                : ""
          } · ${a.year}/${a.year + 1} · ${a.teacher.name}`,
          entries: a.scheduleEntries.map((e) => ({
            id: e.id,
            dayOfWeek: e.dayOfWeek,
            startTime: e.startTime,
            endTime: e.endTime,
            room: e.room,
            substituteTeacherId: e.substituteTeacherId,
            substituteTeacherName: e.substituteTeacher?.name ?? null,
          })),
        }))}
        teachers={teachers}
      />
    </div>
  );
}
