import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container flex h-24 items-center">
          <Link href="/" aria-label="Padtárs főoldal">
            <Logo size="md" />
          </Link>
        </div>
      </header>

      <main className="flex-1 container py-16 flex items-center justify-center">
        <div className="max-w-xl text-center space-y-6">
          <p className="text-8xl font-bold tracking-tighter text-primary">404</p>
          <h1 className="text-3xl font-bold tracking-tight">Ez az oldal nem található</h1>
          <p className="text-muted-foreground text-lg">
            A keresett oldal nem létezik, áthelyezték, vagy elírtad a címet. Térj vissza a
            főoldalra, és onnan biztosan eljutsz oda, ahova szerettél volna.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Button size="lg" asChild>
              <Link href="/">Vissza a főoldalra</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
