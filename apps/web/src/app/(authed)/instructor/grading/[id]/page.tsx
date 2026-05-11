import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAnyRole } from "@/lib/rbac";
import { prisma } from "@repo/db";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GradingPanel } from "./GradingPanel";

export default async function AssignmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireAnyRole(["INSTRUCTOR", "ADMIN", "SUPERADMIN"]);
  const { id } = await params;

  const assignment = await prisma.subjectAssignment.findUnique({
    where: { id },
    include: {
      subject: true,
      schoolClass: {
        include: {
          students: { orderBy: { name: "asc" } },
        },
      },
      teacher: true,
      grades: {
        orderBy: { givenAt: "desc" },
      },
    },
  });

  if (!assignment) notFound();

  // INSTRUCTOR access guard
  if (session.user.role === "INSTRUCTOR" && assignment.teacherId !== session.user.id) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Nem a te tárgyad.</p>
          <Button asChild variant="link"><Link href="/instructor/grading">Vissza</Link></Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/instructor/grading">← Vissza</Link>
          </Button>
          <h1 className="text-3xl font-bold mt-2">{assignment.subject.name}</h1>
          <p className="text-muted-foreground">
            {assignment.schoolClass.startYear}/{assignment.schoolClass.identifier} · {assignment.year}/{assignment.year + 1} tanév · {assignment.teacher.name}
          </p>
        </div>
      </div>

      {assignment.subject.description && (
        <div className="space-y-1 text-sm">
          <p className="text-muted-foreground">{assignment.subject.description}</p>
          {assignment.subject.bookTitle && (
            <div><strong>Könyv:</strong> {assignment.subject.bookTitle}</div>
          )}
          {assignment.subject.lessons.length > 0 && (
            <div>
              <strong>Leckék:</strong>{" "}
              <span className="text-muted-foreground">
                {assignment.subject.lessons.join(" · ")}
              </span>
            </div>
          )}
        </div>
      )}

      <GradingPanel
        assignmentId={assignment.id}
        students={assignment.schoolClass.students.map((s) => ({
          id: s.id,
          name: s.name,
          email: s.email,
        }))}
        initialGrades={assignment.grades.map((g) => ({
          id: g.id,
          studentId: g.studentId,
          value: g.value,
          type: g.type,
          weight: g.weight,
          comment: g.comment,
          givenAt: g.givenAt.toISOString(),
        }))}
      />
    </div>
  );
}
