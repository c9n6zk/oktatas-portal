import { requireAuth } from "@/lib/rbac";
import { prisma } from "@repo/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const DAYS = [
  { key: "MONDAY", label: "Hétfő" },
  { key: "TUESDAY", label: "Kedd" },
  { key: "WEDNESDAY", label: "Szerda" },
  { key: "THURSDAY", label: "Csütörtök" },
  { key: "FRIDAY", label: "Péntek" },
] as const;

export default async function TimetablePage() {
  const session = await requireAuth();
  const role = session.user.role;

  // Role-szerinti scope
  let entries;
  if (role === "STUDENT") {
    const me = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { classId: true, groups: { select: { id: true } } },
    });
    entries = await prisma.scheduleEntry.findMany({
      where: {
        assignment: {
          OR: [
            me?.classId ? { classId: me.classId } : { id: "_none" },
            ...(me && me.groups.length > 0
              ? [{ groupId: { in: me.groups.map((g) => g.id) } }]
              : []),
          ],
        },
      },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
      include: {
        assignment: {
          include: {
            subject: true,
            schoolClass: true,
            group: true,
            teacher: { select: { name: true } },
          },
        },
        substituteTeacher: { select: { name: true } },
      },
    });
  } else if (role === "INSTRUCTOR") {
    entries = await prisma.scheduleEntry.findMany({
      where: { assignment: { teacherId: session.user.id } },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
      include: {
        assignment: {
          include: { subject: true, schoolClass: true, group: true, teacher: { select: { name: true } } },
        },
        substituteTeacher: { select: { name: true } },
      },
    });
  } else {
    entries = await prisma.scheduleEntry.findMany({
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
      include: {
        assignment: {
          include: { subject: true, schoolClass: true, group: true, teacher: { select: { name: true } } },
        },
        substituteTeacher: { select: { name: true } },
      },
    });
  }

  // Group entries by day
  const byDay = new Map<string, typeof entries>();
  for (const day of DAYS) byDay.set(day.key, []);
  for (const e of entries) {
    byDay.get(e.dayOfWeek)?.push(e);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Órarend</h1>
        <p className="text-muted-foreground">
          {role === "STUDENT"
            ? "A te osztályod és csoportjaid órái"
            : role === "INSTRUCTOR"
              ? "Az általad tartott órák"
              : "Teljes órarend (admin nézet)"}{" "}
          · {entries.length} óra
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {DAYS.map((day) => {
          const dayEntries = byDay.get(day.key) ?? [];
          return (
            <Card key={day.key} className={dayEntries.length === 0 ? "opacity-60" : ""}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{day.label}</CardTitle>
                <CardDescription className="text-xs">{dayEntries.length} óra</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {dayEntries.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-2">—</p>
                ) : (
                  dayEntries.map((e) => (
                    <div
                      key={e.id}
                      className="border rounded p-2 space-y-1 hover:bg-muted/30 transition"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-mono text-xs text-muted-foreground">
                          {e.startTime}–{e.endTime}
                        </div>
                        {e.room && (
                          <Badge variant="outline" className="text-xs">
                            {e.room}
                          </Badge>
                        )}
                      </div>
                      <div className="font-medium text-sm">{e.assignment.subject.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {e.assignment.schoolClass
                          ? `${e.assignment.schoolClass.startYear}/${e.assignment.schoolClass.identifier}`
                          : e.assignment.group
                            ? `Csoport: ${e.assignment.group.name}`
                            : ""}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {e.substituteTeacher ? (
                          <span>
                            <span className="line-through">{e.assignment.teacher.name}</span>{" "}
                            <Badge variant="destructive" className="text-[10px]">
                              Helyettes: {e.substituteTeacher.name}
                            </Badge>
                          </span>
                        ) : (
                          e.assignment.teacher.name
                        )}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
