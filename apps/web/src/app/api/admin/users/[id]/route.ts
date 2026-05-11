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

    // ADMIN nem promotolhat ADMIN-t/SUPERADMIN-t
    if (
      parsed.data.role &&
      (parsed.data.role === "ADMIN" || parsed.data.role === "SUPERADMIN") &&
      session.user.role !== "SUPERADMIN"
    ) {
      return NextResponse.json(
        { error: "Csak szuper-admin adhat admin szerepkört" },
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
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("user delete error:", e);
    return NextResponse.json({ error: "Belső hiba" }, { status: 500 });
  }
}
