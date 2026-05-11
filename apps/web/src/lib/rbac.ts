import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { hasRole, isAnyOf, type Role } from "@repo/shared";

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session;
}

export async function requireRole(role: Role) {
  const session = await requireAuth();
  if (!hasRole(session.user.role, role)) redirect("/forbidden");
  return session;
}

export async function requireAnyRole(roles: readonly Role[]) {
  const session = await requireAuth();
  if (!isAnyOf(session.user.role, roles)) redirect("/forbidden");
  return session;
}
