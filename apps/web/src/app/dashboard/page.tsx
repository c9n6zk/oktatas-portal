import { requireAuth } from "@/lib/rbac";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const ROLE_GREETING: Record<string, string> = {
  SUPERADMIN: "Rendszer szuperadminisztrátor",
  ADMIN: "Adminisztrátor",
  INSTRUCTOR: "Oktató",
  STUDENT: "Hallgató",
};

export default async function DashboardPage() {
  const session = await requireAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Üdv, {session.user.name}!</h1>
        <p className="text-muted-foreground">{ROLE_GREETING[session.user.role]}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Szerepköröd</CardTitle>
            <CardDescription>A te jogosultsági szinted</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{session.user.role}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Email</CardTitle>
            <CardDescription>Bejelentkezett fiók</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-mono">{session.user.email}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Következő lépések</CardTitle>
            <CardDescription>A verseny alatt itt jelennek meg a domain-specifikus widget-ek</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Tárgyak, kurzusok, jelenléti ívek, jegyek — a feladat alapján bővítve.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
