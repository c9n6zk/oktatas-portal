import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>403 — Tiltott</CardTitle>
          <CardDescription>Nincs jogosultságod megnézni ezt az oldalt.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/dashboard">Vissza a dashboardra</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
