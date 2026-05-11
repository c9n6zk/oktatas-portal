import { requireAuth } from "@/lib/rbac";
import { AppShell } from "@/components/app-shell";

const NAV = [
  { href: "/dashboard", label: "Áttekintés" },
  // Domain link-eket itt vegyél fel verseny alatt:
  // { href: "/subjects", label: "Tárgyak" },
  // { href: "/admin/users", label: "Felhasználók", roles: ["ADMIN", "SUPERADMIN"] },
] as const;

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAuth();
  return (
    <AppShell user={session.user} nav={NAV as never}>
      {children}
    </AppShell>
  );
}
