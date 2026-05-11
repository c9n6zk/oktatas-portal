import { requireAuth } from "@/lib/rbac";
import { prisma } from "@repo/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const roleLabel: Record<string, string> = {
  SUPERADMIN: "Szuper-adminisztrátor",
  ADMIN: "Adminisztrátor",
  INSTRUCTOR: "Oktató",
  STUDENT: "Diák",
};

export default async function ProfilePage() {
  const session = await requireAuth();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      schoolClass: true,
      taughtAssignments: {
        include: { subject: true, schoolClass: true },
        orderBy: [{ year: "desc" }],
      },
      grades: {
        include: { assignment: { include: { subject: true } } },
      },
    },
  });

  if (!user) return <p>Felhasználó nem található.</p>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold">Profil</h1>
        <p className="text-muted-foreground">Bejelentkezett fiók adatai</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Alapadatok</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Row label="Név" value={user.name} />
          <Row label="Email" value={user.email} />
          <Row label="Szerepkör" value={roleLabel[user.role]} />
          {user.schoolClass && (
            <Row
              label="Osztály"
              value={`${user.schoolClass.startYear}/${user.schoolClass.identifier}`}
            />
          )}
          <Row label="Regisztráció" value={user.createdAt.toLocaleString("hu-HU")} />
        </CardContent>
      </Card>

      {user.role === "INSTRUCTOR" && user.taughtAssignments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tanított tárgyak</CardTitle>
            <CardDescription>
              {user.taughtAssignments.length} hozzárendelés
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {user.taughtAssignments.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div>
                    <div className="font-medium">{a.subject.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {a.subject.code}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">
                      {a.schoolClass.startYear}/{a.schoolClass.identifier}
                    </Badge>
                    <div className="text-xs text-muted-foreground mt-1">
                      {a.year}/{a.year + 1} tanév
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {user.role === "STUDENT" && (
        <Card>
          <CardHeader>
            <CardTitle>Statisztika</CardTitle>
          </CardHeader>
          <CardContent>
            <Row label="Összes jegy" value={user.grades.length.toString()} />
            <Row
              label="Különböző tantárgyak"
              value={new Set(user.grades.map((g) => g.assignment.subject.id)).size.toString()}
            />
          </CardContent>
        </Card>
      )}

      <p className="text-xs text-muted-foreground pt-2 border-t">
        Biztonság: jelszó hash-elve bcrypt-tel tárolódik. Mobil belépés JWT-vel (Bearer token).
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b py-2 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
