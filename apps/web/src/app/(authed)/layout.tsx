import { requireAuth } from "@/lib/rbac";
import { AppShell } from "@/components/app-shell";

export default async function AuthedLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAuth();
  return <AppShell user={session.user}>{children}</AppShell>;
}
