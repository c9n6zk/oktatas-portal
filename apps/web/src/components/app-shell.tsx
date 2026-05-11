import Link from "next/link";
import { signOut } from "@/lib/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/logo";
import { MobileNav } from "@/components/mobile-nav";
import { DesktopSidebar } from "@/components/desktop-sidebar";
import type { Role } from "@repo/shared";

interface NavItem {
  href: string;
  label: string;
  icon: string;
  roles?: readonly Role[];
}

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Áttekintés", icon: "LayoutDashboard" },
  { href: "/student/grades", label: "Saját jegyek", icon: "GraduationCap", roles: ["STUDENT"] },
  { href: "/instructor/grading", label: "Jegybeírás", icon: "ClipboardCheck", roles: ["INSTRUCTOR", "ADMIN", "SUPERADMIN"] },
  { href: "/admin/users", label: "Felhasználók", icon: "Users", roles: ["ADMIN", "SUPERADMIN"] },
  { href: "/admin/classes", label: "Osztályok", icon: "School", roles: ["ADMIN", "SUPERADMIN"] },
  { href: "/admin/subjects", label: "Tárgyak", icon: "BookOpen", roles: ["ADMIN", "SUPERADMIN"] },
  { href: "/admin/assignments", label: "Hozzárendelések", icon: "ListChecks", roles: ["ADMIN", "SUPERADMIN"] },
  { href: "/admin/groups", label: "Csoportok", icon: "UsersRound", roles: ["ADMIN", "SUPERADMIN"] },
  { href: "/admin/schedule", label: "Órarend kezelés", icon: "CalendarCog", roles: ["ADMIN", "SUPERADMIN"] },
  { href: "/timetable", label: "Órarend", icon: "Calendar", roles: ["STUDENT", "INSTRUCTOR", "ADMIN", "SUPERADMIN"] },
  { href: "/messages", label: "Üzenetek", icon: "MessageSquare" },
  { href: "/polls", label: "Szavazások", icon: "Vote" },
  { href: "/events", label: "Események", icon: "CalendarDays" },
];

export interface AppShellProps {
  user: { name?: string | null; email?: string | null; role: Role };
  children: React.ReactNode;
}

export function AppShell({ user, children }: AppShellProps) {
  const visibleNav = NAV.filter((item) => !item.roles || item.roles.includes(user.role));

  async function logoutAction() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <div className="flex min-h-screen">
      <DesktopSidebar
        items={visibleNav.map(({ href, label, icon }) => ({ href, label, icon }))}
        user={{ name: user.name, email: user.email }}
        logoutAction={logoutAction}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="border-b sticky top-0 bg-background z-30 md:hidden">
          <div className="container flex h-16 items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <MobileNav
                items={visibleNav.map(({ href, label }) => ({ href, label }))}
                user={{ name: user.name, email: user.email }}
                themeToggle={<ThemeToggle />}
                logoutForm={
                  <form action={logoutAction}>
                    <button
                      type="submit"
                      aria-label="Kilépés"
                      className="inline-flex items-center justify-center h-9 w-9 rounded-md hover:bg-accent transition-colors"
                    >
                      <span className="sr-only">Kilépés</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                      >
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" x2="9" y1="12" y2="12" />
                      </svg>
                    </button>
                  </form>
                }
              />
              <Link href="/dashboard" className="whitespace-nowrap shrink-0">
                <Logo size="sm" />
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1 container py-4 md:py-8">{children}</main>
      </div>
    </div>
  );
}
