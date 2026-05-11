import { requireRole } from "@/lib/rbac";
import { prisma } from "@repo/db";
import { UsersPanel } from "./UsersPanel";

export default async function AdminUsersPage() {
  const session = await requireRole("ADMIN");

  const [users, classes] = await Promise.all([
    prisma.user.findMany({
      orderBy: [{ role: "asc" }, { name: "asc" }],
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        classId: true,
        schoolClass: { select: { startYear: true, identifier: true } },
        createdAt: true,
      },
    }),
    prisma.schoolClass.findMany({
      orderBy: [{ startYear: "desc" }, { identifier: "asc" }],
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Felhasználók</h1>
        <p className="text-muted-foreground">
          {users.length} felhasználó · ADMIN nem promotolhat ADMIN/SUPERADMIN szerepre; csak SUPERADMIN tudja.
        </p>
      </div>

      <UsersPanel
        initialUsers={users.map((u) => ({
          id: u.id,
          email: u.email,
          name: u.name,
          role: u.role,
          classId: u.classId,
          className: u.schoolClass
            ? `${u.schoolClass.startYear}/${u.schoolClass.identifier}`
            : null,
        }))}
        classes={classes.map((c) => ({
          id: c.id,
          label: `${c.startYear}/${c.identifier}`,
        }))}
        currentUserId={session.user.id}
        isSuperAdmin={session.user.role === "SUPERADMIN"}
      />
    </div>
  );
}
