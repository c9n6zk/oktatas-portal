"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

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
          <p className="text-8xl font-bold tracking-tighter text-destructive">500</p>
          <h1 className="text-3xl font-bold tracking-tight">Valami hiba történt</h1>
          <p className="text-muted-foreground text-lg">
            Sajnáljuk, egy váratlan hiba miatt nem tudtuk megjeleníteni az oldalt. Próbáld
            újratölteni, vagy térj vissza a főoldalra.
          </p>
          {error.digest && (
            <p className="text-xs text-muted-foreground font-mono">Hibakód: {error.digest}</p>
          )}
          <div className="flex justify-center gap-3 pt-2">
            <Button size="lg" onClick={reset}>
              Újrapróbálkozás
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/">Vissza a főoldalra</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
