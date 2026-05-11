import { NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { requireAnyRole } from "@/lib/rbac";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAnyRole(["INSTRUCTOR", "ADMIN", "SUPERADMIN"]);
  const { id } = await params;
  try {
    if (session.user.role === "INSTRUCTOR") {
      const grade = await prisma.grade.findUnique({
        where: { id },
        select: { assignment: { select: { teacherId: true } } },
      });
      if (!grade || grade.assignment.teacherId !== session.user.id) {
        return NextResponse.json(
          { error: "Csak a saját jegyeidet törölheted" },
          { status: 403 },
        );
      }
    }
    await prisma.grade.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("grade delete error:", msg);
    return NextResponse.json({ error: "Belső hiba" }, { status: 500 });
  }
}
