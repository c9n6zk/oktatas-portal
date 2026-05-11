import { requireRole } from "@/lib/rbac";
import { prisma } from "@repo/db";
import { GroupsPanel } from "./GroupsPanel";

export default async function AdminGroupsPage() {
  await requireRole("ADMIN");

  const [groups, students] = await Promise.all([
    prisma.group.findMany({
      orderBy: { name: "asc" },
      include: {
        members: { select: { id: true, name: true, email: true } },
        _count: { select: { assignments: true } },
      },
    }),
    prisma.user.findMany({
      where: { role: "STUDENT" },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        schoolClass: { select: { startYear: true, identifier: true } },
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Csoportok</h1>
        <p className="text-muted-foreground">
          {groups.length} csoport · Diákok csoportokba szervezhetők osztálytól függetlenül (pl. nyelvi haladó/kezdő, specializáció). Csoport tantárgyhoz rendelhető.
        </p>
      </div>

      <GroupsPanel
        initial={groups.map((g) => ({
          id: g.id,
          name: g.name,
          description: g.description,
          members: g.members,
          assignmentCount: g._count.assignments,
        }))}
        students={students.map((s) => ({
          id: s.id,
          label: `${s.name}${s.schoolClass ? ` (${s.schoolClass.startYear}/${s.schoolClass.identifier})` : ""}`,
        }))}
      />
    </div>
  );
}
