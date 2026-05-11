import { requireAuth } from "@/lib/rbac";
import { prisma } from "@repo/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EventsPanel } from "./EventsPanel";

export default async function EventsPage() {
  const session = await requireAuth();
  const events = await prisma.event.findMany({
    orderBy: { startsAt: "asc" },
    include: { createdBy: { select: { name: true } } },
  });

  const isAdmin = session.user.role === "ADMIN" || session.user.role === "SUPERADMIN";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Iskolai események</h1>
        <p className="text-muted-foreground">
          {isAdmin
            ? "Új esemény létrehozása, kezelés."
            : "Az iskola közelgő eseményei. Az adminok hoznak létre újat."}
        </p>
      </div>

      {isAdmin && <EventsPanel canCreate />}

      {events.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Még nincs esemény.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {events.map((e) => {
            const isPast = e.endsAt
              ? new Date(e.endsAt) < new Date()
              : new Date(e.startsAt) < new Date();
            return (
              <Card key={e.id} className={isPast ? "opacity-60" : ""}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-lg">{e.title}</CardTitle>
                      <CardDescription>
                        {new Date(e.startsAt).toLocaleString("hu-HU", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                        {e.endsAt &&
                          ` – ${new Date(e.endsAt).toLocaleString("hu-HU", {
                            timeStyle: "short",
                          })}`}
                      </CardDescription>
                    </div>
                    {isPast && <Badge variant="outline">Lezárult</Badge>}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {e.location && <div>📍 {e.location}</div>}
                  {e.description && <div className="text-muted-foreground">{e.description}</div>}
                  <div className="text-xs text-muted-foreground pt-2 border-t">
                    Létrehozta: {e.createdBy.name}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
