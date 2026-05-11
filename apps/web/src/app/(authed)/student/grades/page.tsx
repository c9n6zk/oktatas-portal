import { requireRole } from "@/lib/rbac";
import { prisma } from "@repo/db";
import {
  calculateWeightedAverage,
  suggestedYearEndGrade,
  GRADE_TYPE_LABEL,
  type GradeType,
} from "@repo/shared";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const gradeColor: Record<number, string> = {
  1: "bg-red-500/10 text-red-700 dark:text-red-400",
  2: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
  3: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  4: "bg-lime-500/10 text-lime-700 dark:text-lime-400",
  5: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
};

export default async function StudentGradesPage() {
  const session = await requireRole("STUDENT");

  const grades = await prisma.grade.findMany({
    where: { studentId: session.user.id },
    orderBy: { givenAt: "desc" },
    include: {
      assignment: {
        include: { subject: true, schoolClass: true, teacher: { select: { name: true } } },
      },
    },
  });

  // Group by subject
  type Group = {
    subjectId: string;
    subjectName: string;
    subjectCode: string;
    teacherName: string;
    className: string;
    grades: typeof grades;
  };
  const groups = new Map<string, Group>();
  for (const g of grades) {
    const key = g.assignment.subject.id;
    if (!groups.has(key)) {
      groups.set(key, {
        subjectId: key,
        subjectName: g.assignment.subject.name,
        subjectCode: g.assignment.subject.code,
        teacherName: g.assignment.teacher.name,
        className: `${g.assignment.schoolClass.startYear}/${g.assignment.schoolClass.identifier}`,
        grades: [],
      });
    }
    groups.get(key)!.grades.push(g);
  }

  const subjectGroups = Array.from(groups.values());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Saját jegyek</h1>
        <p className="text-muted-foreground">
          {session.user.name} — jegyek tantárgyak szerint csoportosítva, súlyozott átlaggal
        </p>
      </div>

      {subjectGroups.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Még nincsenek jegyeid.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {subjectGroups.map((g) => {
            const avg = calculateWeightedAverage(g.grades);
            const suggested = suggestedYearEndGrade(g.grades);
            return (
              <Card key={g.subjectId}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-xl">{g.subjectName}</CardTitle>
                      <CardDescription>
                        {g.subjectCode} · {g.className} · {g.teacherName}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold tabular-nums">
                        {avg !== null ? avg.toFixed(2) : "—"}
                      </div>
                      <div className="text-xs text-muted-foreground">súlyozott átlag</div>
                      {suggested !== null && (
                        <Badge variant="outline" className="mt-1">
                          javasolt: {suggested}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Típus</TableHead>
                        <TableHead className="text-center">Jegy</TableHead>
                        <TableHead className="text-center">Súly</TableHead>
                        <TableHead>Megjegyzés</TableHead>
                        <TableHead className="text-right">Dátum</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {g.grades.map((grade) => (
                        <TableRow key={grade.id}>
                          <TableCell>
                            <Badge variant="secondary">
                              {GRADE_TYPE_LABEL[grade.type as GradeType]}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <span
                              className={`inline-flex h-7 w-7 items-center justify-center rounded-full font-semibold ${gradeColor[grade.value]}`}
                            >
                              {grade.value}
                            </span>
                          </TableCell>
                          <TableCell className="text-center text-muted-foreground">
                            {grade.weight}×
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {grade.comment ?? "—"}
                          </TableCell>
                          <TableCell className="text-right text-sm text-muted-foreground">
                            {grade.givenAt.toLocaleDateString("hu-HU")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
