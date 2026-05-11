import { requireRole } from "@/lib/rbac";
import { prisma } from "@repo/db";
import { ClassesPanel } from "./ClassesPanel";

export default async function AdminClassesPage() {
  await requireRole("ADMIN");
  const classes = await prisma.schoolClass.findMany({
    orderBy: [{ startYear: "desc" }, { identifier: "asc" }],
    include: { _count: { select: { students: true, assignments: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Osztályok</h1>
        <p className="text-muted-foreground">
          {classes.length} osztály · kezdés éve + azonosító (pl. 2024/A). Törléskor a hozzárendelések is törlődnek.
        </p>
      </div>

      <ClassesPanel
        initial={classes.map((c) => ({
          id: c.id,
          startYear: c.startYear,
          identifier: c.identifier,
          studentCount: c._count.students,
          assignmentCount: c._count.assignments,
        }))}
      />
    </div>
  );
}
