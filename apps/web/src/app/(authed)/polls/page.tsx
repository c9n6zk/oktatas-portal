import { requireAuth } from "@/lib/rbac";
import { prisma } from "@repo/db";
import { Card, CardContent } from "@/components/ui/card";
import { PollsPanel } from "./PollsPanel";

export default async function PollsPage() {
  const session = await requireAuth();
  const isAdmin = session.user.role === "ADMIN" || session.user.role === "SUPERADMIN";

  // Audience filter
  const orConditions: Record<string, unknown>[] = [{ audience: "ALL" }];
  let polls;

  if (isAdmin) {
    polls = await prisma.poll.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        options: { orderBy: { order: "asc" } },
        createdBy: { select: { name: true } },
        schoolClass: { select: { startYear: true, identifier: true } },
        responses: { select: { userId: true, optionId: true } },
      },
    });
  } else {
    if (session.user.role === "STUDENT") {
      orConditions.push({ audience: "STUDENTS" });
      const me = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { classId: true },
      });
      if (me?.classId) orConditions.push({ audience: "CLASS", classId: me.classId });
    } else if (session.user.role === "INSTRUCTOR") {
      orConditions.push({ audience: "INSTRUCTORS" });
    }
    polls = await prisma.poll.findMany({
      where: { OR: orConditions },
      orderBy: { createdAt: "desc" },
      include: {
        options: { orderBy: { order: "asc" } },
        createdBy: { select: { name: true } },
        schoolClass: { select: { startYear: true, identifier: true } },
        responses: { select: { userId: true, optionId: true } },
      },
    });
  }

  const classes = isAdmin
    ? await prisma.schoolClass.findMany({
        orderBy: [{ startYear: "desc" }, { identifier: "asc" }],
      })
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Szavazások / Kérdőívek</h1>
        <p className="text-muted-foreground">
          {isAdmin
            ? "Új szavazás létrehozása, eredmények megtekintése. A célközönség lehet mindenki, csak diákok, csak oktatók, vagy egy osztály."
            : `${polls.length} aktív szavazás. Egy szavazáshoz egyszer válaszolhatsz (a válaszodat utólag módosíthatod).`}
        </p>
      </div>

      <PollsPanel
        initial={polls.map((p) => {
          const myResponse = p.responses.find((r) => r.userId === session.user.id);
          return {
            id: p.id,
            question: p.question,
            description: p.description,
            audience: p.audience,
            className: p.schoolClass
              ? `${p.schoolClass.startYear}/${p.schoolClass.identifier}`
              : null,
            closesAt: p.closesAt?.toISOString() ?? null,
            createdBy: p.createdBy.name,
            options: p.options.map((o) => ({
              id: o.id,
              text: o.text,
              count: p.responses.filter((r) => r.optionId === o.id).length,
            })),
            totalResponses: p.responses.length,
            myVoteOptionId: myResponse?.optionId ?? null,
          };
        })}
        canCreate={isAdmin}
        classes={classes.map((c) => ({
          id: c.id,
          label: `${c.startYear}/${c.identifier}`,
        }))}
      />

      {polls.length === 0 && !isAdmin && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Még nincs neked szóló szavazás.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
