import Link from "next/link";
import { signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import type { Role } from "@repo/shared";
import { LogOut } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  roles?: readonly Role[];
}

export interface AppShellProps {
  user: { name?: string | null; email?: string | null; role: Role };
  nav: NavItem[];
  children: React.ReactNode;
}

const roleBadge: Record<Role, string> = {
  SUPERADMIN: "bg-red-500/10 text-red-600 dark:text-red-400",
  ADMIN: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  INSTRUCTOR: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  STUDENT: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
};

export function AppShell({ user, nav, children }: AppShellProps) {
  const visibleNav = nav.filter((item) => !item.roles || item.roles.includes(user.role));

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="container flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="font-bold">
              Oktatás Portál
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              {visibleNav.map((item) => (
                <Button key={item.href} variant="ghost" size="sm" asChild>
                  <Link href={item.href}>{item.label}</Link>
                </Button>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-medium px-2 py-1 rounded ${roleBadge[user.role]}`}>
              {user.role}
            </span>
            <span className="text-sm text-muted-foreground hidden sm:block">{user.email}</span>
            <ThemeToggle />
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <Button type="submit" variant="ghost" size="icon" aria-label="Kilépés">
                <LogOut className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-8">{children}</main>
    </div>
  );
}
