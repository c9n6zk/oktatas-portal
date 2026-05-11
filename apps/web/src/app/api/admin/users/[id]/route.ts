import { NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { userUpdateSchema } from "@repo/shared";
import { requireRole } from "@/lib/rbac";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireRole("ADMIN");
  const { id } = await params;
  try {
    const parsed = userUpdateSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const target = await prisma.user.findUnique({ where: { id }, select: { role: true } });
    if (!target) {
      return NextResponse.json({ error: "Felhasználó nem található" }, { status: 404 });
    }

    const isSuperAdmin = session.user.role === "SUPERADMIN";
    const targetIsPrivileged = target.role === "ADMIN" || target.role === "SUPERADMIN";
    const promotingToPrivileged =
      parsed.data.role === "ADMIN" || parsed.data.role === "SUPERADMIN";

    // ADMIN nem érhet ADMIN/SUPERADMIN userhez, és nem promotálhat ilyen szerepre.
    if (!isSuperAdmin && (targetIsPrivileged || promotingToPrivileged)) {
      return NextResponse.json(
        { error: "Csak szuper-admin módosíthat admin szintű fiókot" },
        { status: 403 },
      );
    }

    const updated = await prisma.user.update({
      where: { id },
      data: parsed.data,
      select: { id: true, email: true, name: true, role: true, classId: true },
    });
    return NextResponse.json({ user: updated });
  } catch (e) {
    console.error("user patch error:", e);
    return NextResponse.json({ error: "Belső hiba" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireRole("ADMIN");
  const { id } = await params;
  if (id === session.user.id) {
    return NextResponse.json({ error: "Magadat nem törölheted" }, { status: 400 });
  }
  try {
    const target = await prisma.user.findUnique({ where: { id }, select: { role: true } });
    if (!target) {
      return NextResponse.json({ error: "Felhasználó nem található" }, { status: 404 });
    }

    const isSuperAdmin = session.user.role === "SUPERADMIN";
    const targetIsPrivileged = target.role === "ADMIN" || target.role === "SUPERADMIN";
    if (!isSuperAdmin && targetIsPrivileged) {
      return NextResponse.json(
        { error: "Csak szuper-admin törölhet admin szintű fiókot" },
        { status: 403 },
      );
    }

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("user delete error:", e);
    return NextResponse.json({ error: "Belső hiba" }, { status: 500 });
  }
}
