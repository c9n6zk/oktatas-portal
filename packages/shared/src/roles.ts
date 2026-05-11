export const ROLES = ["SUPERADMIN", "ADMIN", "INSTRUCTOR", "STUDENT"] as const;
export type Role = (typeof ROLES)[number];

// Role hierarchy: higher index = more privileges.
const RANK: Record<Role, number> = {
  STUDENT: 0,
  INSTRUCTOR: 1,
  ADMIN: 2,
  SUPERADMIN: 3,
};

export function hasRole(actor: Role | undefined | null, required: Role): boolean {
  if (!actor) return false;
  return RANK[actor] >= RANK[required];
}

export function isAnyOf(actor: Role | undefined | null, allowed: readonly Role[]): boolean {
  if (!actor) return false;
  return allowed.includes(actor);
}
