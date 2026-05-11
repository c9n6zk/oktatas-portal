import Link from "next/link";
import { signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/logo";
import { MobileNav } from "@/components/mobile-nav";
import type { Role } from "@repo/shared";
import { LogOut } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  roles?: readonly Role[];
}

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Áttekintés" },
  { href: "/student/grades", label: "Saját jegyek", roles: ["STUDENT"] },
  { href: "/instructor/grading", label: "Jegybeírás", roles: ["INSTRUCTOR", "ADMIN", "SUPERADMIN"] },
  { href: "/admin/users", label: "Felhasználók", roles: ["ADMIN", "SUPERADMIN"] },
  { href: "/admin/classes", label: "Osztályok", roles: ["ADMIN", "SUPERADMIN"] },
  { href: "/admin/subjects", label: "Tárgyak", roles: ["ADMIN", "SUPERADMIN"] },
  { href: "/admin/assignments", label: "Hozzárendelések", roles: ["ADMIN", "SUPERADMIN"] },
  { href: "/admin/groups", label: "Csoportok", roles: ["ADMIN", "SUPERADMIN"] },
  { href: "/admin/schedule", label: "Órarend kezelés", roles: ["ADMIN", "SUPERADMIN"] },
  { href: "/timetable", label: "Órarend", roles: ["STUDENT", "INSTRUCTOR", "ADMIN", "SUPERADMIN"] },
  { href: "/polls", label: "Szavazások" },
  { href: "/events", label: "Események" },
  { href: "/profile", label: "Profil" },
];

export interface AppShellProps {
  user: { name?: string | null; email?: string | null; role: Role };
  children: React.ReactNode;
}

const roleBadge: Record<Role, string> = {
  SUPERADMIN: "bg-red-500/10 text-red-600 dark:text-red-400",
  ADMIN: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  INSTRUCTOR: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  STUDENT: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
};

const roleLabel: Record<Role, string> = {
  SUPERADMIN: "Szuper-admin",
  ADMIN: "Admin",
  INSTRUCTOR: "Oktató",
  STUDENT: "Diák",
};

export function AppShell({ user, children }: AppShellProps) {
  const visibleNav = NAV.filter((item) => !item.roles || item.roles.includes(user.role));

  const logoutForm = (
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
  );

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b sticky top-0 bg-background md:bg-background/95 md:backdrop-blur shadow-sm md:shadow-none z-30">
        <div className="container flex h-16 md:h-24 items-center justify-between gap-2 md:gap-4">
          <div className="flex items-center gap-2 md:gap-6 min-w-0">
            <MobileNav
              items={visibleNav.map(({ href, label }) => ({ href, label }))}
              user={{
                name: user.name,
                email: user.email,
              }}
              themeToggle={<ThemeToggle />}
              logoutForm={logoutForm}
            />
            <Link href="/dashboard" className="whitespace-nowrap shrink-0">
              <Logo />
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              {visibleNav.map((item) => (
                <Button key={item.href} variant="ghost" size="sm" asChild>
                  <Link href={item.href}>{item.label}</Link>
                </Button>
              ))}
            </nav>
          </div>
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <span className={`text-xs font-medium px-2 py-1 rounded ${roleBadge[user.role]}`}>
              {roleLabel[user.role]}
            </span>
            <span className="text-sm text-muted-foreground hidden lg:block">{user.email}</span>
            <ThemeToggle />
            {logoutForm}
          </div>
        </div>
      </header>

      <main className="flex-1 container py-4 md:py-8">{children}</main>

      <footer className="border-t py-4 text-center text-sm text-muted-foreground">
        <div className="container">Padtárs · Modern Fullstack Verseny 2026</div>
      </footer>
    </div>
  );
}
