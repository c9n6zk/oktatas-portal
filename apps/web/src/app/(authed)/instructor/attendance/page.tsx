import { requireAnyRole } from "@/lib/rbac";
import { prisma } from "@repo/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, ExternalLink } from "lucide-react";

const SOURCE_LABEL: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  gps: { label: "📍 GPS", variant: "default" },
  qr: { label: "📷 QR", variant: "secondary" },
  manual: { label: "✋ Kézi", variant: "outline" },
};

function formatDateTime(d: Date) {
  return new Intl.DateTimeFormat("hu-HU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export default async function InstructorAttendancePage() {
  const session = await requireAnyRole(["INSTRUCTOR", "ADMIN", "SUPERADMIN"]);

  // INSTRUCTOR csak a saját assignmentjeire jövő check-ineket; ADMIN+ mindent.
  const where =
    session.user.role === "INSTRUCTOR"
      ? { assignment: { teacherId: session.user.id } }
      : {};

  const attendances = await prisma.attendance.findMany({
    where,
    orderBy: { recordedAt: "desc" },
    take: 200,
    include: {
      student: { select: { id: true, name: true } },
      assignment: {
        include: {
          subject: { select: { name: true, code: true } },
          schoolClass: { select: { startYear: true, identifier: true } },
          group: { select: { name: true } },
        },
      },
    },
  });

  // Csoportosítás assignment szerint.
  type AssignmentKey = string;
  const grouped = new Map<
    AssignmentKey,
    {
      assignmentId: string;
      subjectName: string;
      subjectCode: string;
      target: string;
      rows: typeof attendances;
    }
  >();
  for (const a of attendances) {
    const target = a.assignment.schoolClass
      ? `${a.assignment.schoolClass.startYear}/${a.assignment.schoolClass.identifier}`
      : a.assignment.group?.name ?? "—";
    const key = a.assignmentId;
    const existing = grouped.get(key);
    if (existing) {
      existing.rows.push(a);
    } else {
      grouped.set(key, {
        assignmentId: a.assignmentId,
        subjectName: a.assignment.subject.name,
        subjectCode: a.assignment.subject.code,
        target,
        rows: [a],
      });
    }
  }

  const groups = Array.from(grouped.values());
  const totalCount = attendances.length;
  const gpsCount = attendances.filter((a) => a.source === "gps").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Jelenléti napló</h1>
        <p className="text-muted-foreground">
          {session.user.role === "INSTRUCTOR"
            ? "A saját tárgyaidra beérkező diák check-inek"
            : "Az összes diák jelenléti check-in (admin nézet)"}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="text-[10px] sm:text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Összes
            </div>
            <div className="mt-1 text-2xl font-bold tabular-nums">{totalCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="text-[10px] sm:text-xs font-medium uppercase tracking-wide text-muted-foreground">
              GPS check-in
            </div>
            <div className="mt-1 text-2xl font-bold tabular-nums">{gpsCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="text-[10px] sm:text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Tárgyak
            </div>
            <div className="mt-1 text-2xl font-bold tabular-nums">{groups.length}</div>
          </CardContent>
        </Card>
      </div>

      {groups.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <MapPin className="mx-auto h-8 w-8 mb-3 opacity-50" />
            <div>Még nincs beérkezett jelenléti adat.</div>
            <div className="text-xs mt-2">
              A diákok a mobil app &ldquo;Jelenléti&rdquo; fülén tudnak GPS-szel bejelentkezni.
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {groups.map((g) => (
            <Card key={g.assignmentId}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle>{g.subjectName}</CardTitle>
                    <CardDescription>{g.subjectCode}</CardDescription>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="outline">{g.target}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {g.rows.length} check-in
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {g.rows.map((row) => {
                    const meta = SOURCE_LABEL[row.source] ?? SOURCE_LABEL.manual;
                    const mapsUrl =
                      row.latitude != null && row.longitude != null
                        ? `https://maps.google.com/?q=${row.latitude},${row.longitude}`
                        : null;
                    return (
                      <div
                        key={row.id}
                        className="px-4 py-3 flex items-center gap-3 flex-wrap sm:flex-nowrap"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{row.student.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatDateTime(row.recordedAt)}
                          </div>
                        </div>
                        <Badge variant={meta.variant} className="shrink-0">
                          {meta.label}
                        </Badge>
                        {mapsUrl && (
                          <a
                            href={mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline inline-flex items-center gap-1 shrink-0 tabular-nums"
                          >
                            {row.latitude!.toFixed(4)}, {row.longitude!.toFixed(4)}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
