import Link from "next/link";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/logo";

export default async function Home() {
  const session = await auth();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <Logo size="md" />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {session?.user ? (
              <Button asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Belépés</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Regisztráció</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 container py-16">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="flex justify-center">
            <Logo size="lg" showText={false} />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Padtárs</h1>
          <p className="text-muted-foreground text-lg">
            A digitális iskolatársad — modern oktatásszervezési portál diákok, oktatók és
            adminisztrátorok számára.
          </p>
          {!session?.user && (
            <div className="flex justify-center gap-3 pt-4">
              <Button size="lg" asChild>
                <Link href="/login">Belépés</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/register">Új fiók</Link>
              </Button>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t py-4 text-center text-sm text-muted-foreground">
        <div className="container">
          Modern Fullstack Verseny 2026 · Built with Next.js, Prisma, NextAuth, Expo
        </div>
      </footer>
    </div>
  );
}
