import { requireRole } from "@/lib/rbac";
import { prisma } from "@repo/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
          Osztály = kezdés éve + azonosító, pl. 2024/A. Új osztály létrehozása, törlés.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Összes osztály ({classes.length})</CardTitle>
          <CardDescription>Egy osztály törlésével az ahhoz tartozó hozzárendelések is törlődnek.</CardDescription>
        </CardHeader>
        <CardContent>
          <ClassesPanel
            initial={classes.map((c) => ({
              id: c.id,
              startYear: c.startYear,
              identifier: c.identifier,
              studentCount: c._count.students,
              assignmentCount: c._count.assignments,
            }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
