import { requireRole } from "@/lib/rbac";
import { prisma } from "@repo/db";
import { SubjectsPanel } from "./SubjectsPanel";

export default async function AdminSubjectsPage() {
  await requireRole("ADMIN");
  const subjects = await prisma.subject.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { assignments: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tárgyak</h1>
        <p className="text-muted-foreground">
          {subjects.length} tantárgy · kód, név, leírás, könyv, leckék. Az osztályhoz rendelés külön oldalon.
        </p>
      </div>

      <SubjectsPanel
        initial={subjects.map((s) => ({
          id: s.id,
          code: s.code,
          name: s.name,
          description: s.description,
          bookTitle: s.bookTitle,
          lessons: s.lessons,
          assignmentCount: s._count.assignments,
        }))}
      />
    </div>
  );
}
