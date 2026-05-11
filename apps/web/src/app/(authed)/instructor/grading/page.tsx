import { requireAnyRole } from "@/lib/rbac";
import { prisma } from "@repo/db";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function InstructorGradingPage() {
  const session = await requireAnyRole(["INSTRUCTOR", "ADMIN", "SUPERADMIN"]);

  // ADMIN+ látja az összes hozzárendelést, INSTRUCTOR csak a sajátját
  const where =
    session.user.role === "INSTRUCTOR" ? { teacherId: session.user.id } : {};

  const assignments = await prisma.subjectAssignment.findMany({
    where,
    orderBy: [{ year: "desc" }],
    include: {
      subject: true,
      schoolClass: { include: { _count: { select: { students: true } } } },
      teacher: { select: { name: true } },
      _count: { select: { grades: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Jegybeírás</h1>
        <p className="text-muted-foreground">
          {session.user.role === "INSTRUCTOR"
            ? "A te tárgyhozzárendeléseid"
            : "Az összes tárgyhozzárendelés (admin nézet)"}
        </p>
      </div>

      {assignments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Nincs hozzárendelt tárgy.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {assignments.map((a) => (
            <Card key={a.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle>{a.subject.name}</CardTitle>
                    <CardDescription>
                      {a.subject.code} · {a.year}/{a.year + 1} tanév
                    </CardDescription>
                  </div>
                  <Badge>{a.schoolClass.startYear}/{a.schoolClass.identifier}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>Oktató: {a.teacher.name}</div>
                  <div>
                    {a.schoolClass._count.students} diák · {a._count.grades} jegy beírva
                  </div>
                </div>
                <Button asChild className="w-full">
                  <Link href={`/instructor/grading/${a.id}`}>Jegyek kezelése →</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
