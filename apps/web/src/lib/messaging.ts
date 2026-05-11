import { prisma } from "@repo/db";
import type { Role } from "@repo/shared";

export interface Contact {
  id: string;
  name: string;
  email: string;
  role: Role;
}

/**
 * Visszaadja azokat a usereket akiknek az adott user üzenetet küldhet.
 *
 * Szabály (feladatleírás: "Hallgató–Oktató közötti kétirányú üzenetküldési funkció"):
 * - STUDENT: azok az oktatók akik tárgyat tartanak az osztályának vagy egy csoportjának, amelynek tagja.
 * - INSTRUCTOR: azok a diákok akik az általa tartott valamelyik tárgy osztályában/csoportjában vannak.
 * - ADMIN / SUPERADMIN: bárki más felhasználó.
 */
export async function getMessageContacts(userId: string, role: Role): Promise<Contact[]> {
  if (role === "ADMIN" || role === "SUPERADMIN") {
    const users = await prisma.user.findMany({
      where: { id: { not: userId } },
      select: { id: true, name: true, email: true, role: true },
      orderBy: [{ role: "asc" }, { name: "asc" }],
    });
    return users as Contact[];
  }

  if (role === "STUDENT") {
    const me = await prisma.user.findUnique({
      where: { id: userId },
      select: { classId: true, groups: { select: { id: true } } },
    });
    if (!me) return [];
    const groupIds = me.groups.map((g) => g.id);
    const assignments = await prisma.subjectAssignment.findMany({
      where: {
        OR: [
          me.classId ? { classId: me.classId } : undefined,
          groupIds.length ? { groupId: { in: groupIds } } : undefined,
        ].filter(Boolean) as object[],
      },
      select: { teacher: { select: { id: true, name: true, email: true, role: true } } },
    });
    const seen = new Set<string>();
    const out: Contact[] = [];
    for (const a of assignments) {
      if (a.teacher && !seen.has(a.teacher.id)) {
        seen.add(a.teacher.id);
        out.push(a.teacher as Contact);
      }
    }
    return out.sort((a, b) => a.name.localeCompare(b.name, "hu"));
  }

  // INSTRUCTOR
  const myAssignments = await prisma.subjectAssignment.findMany({
    where: { teacherId: userId },
    select: { classId: true, groupId: true },
  });
  const classIds = Array.from(new Set(myAssignments.map((a) => a.classId).filter(Boolean) as string[]));
  const groupIds = Array.from(new Set(myAssignments.map((a) => a.groupId).filter(Boolean) as string[]));
  if (!classIds.length && !groupIds.length) return [];

  const students = await prisma.user.findMany({
    where: {
      role: "STUDENT",
      OR: [
        classIds.length ? { classId: { in: classIds } } : undefined,
        groupIds.length ? { groups: { some: { id: { in: groupIds } } } } : undefined,
      ].filter(Boolean) as object[],
    },
    select: { id: true, name: true, email: true, role: true },
    orderBy: { name: "asc" },
  });
  return students as Contact[];
}

export async function canMessage(senderId: string, senderRole: Role, recipientId: string): Promise<boolean> {
  if (senderId === recipientId) return false;
  const contacts = await getMessageContacts(senderId, senderRole);
  return contacts.some((c) => c.id === recipientId);
}
