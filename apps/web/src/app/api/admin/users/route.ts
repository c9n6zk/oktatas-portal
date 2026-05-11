import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@repo/db";
import { registerSchema, userUpdateSchema } from "@repo/shared";
import { requireRole } from "@/lib/rbac";
import { z } from "zod";

const adminCreateSchema = registerSchema.extend({
  role: z.enum(["SUPERADMIN", "ADMIN", "INSTRUCTOR", "STUDENT"]),
  classId: z.string().optional().nullable(),
});

export async function GET() {
  await requireRole("ADMIN");
  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { name: "asc" }],
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      classId: true,
      schoolClass: { select: { startYear: true, identifier: true } },
      createdAt: true,
    },
  });
  return NextResponse.json({ users });
}

export async function POST(req: Request) {
  const session = await requireRole("ADMIN");
  try {
    const parsed = adminCreateSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    // Csak SUPERADMIN hozhat létre ADMIN-t vagy SUPERADMIN-t
    if (
      (parsed.data.role === "ADMIN" || parsed.data.role === "SUPERADMIN") &&
      session.user.role !== "SUPERADMIN"
    ) {
      return NextResponse.json(
        { error: "Csak szuper-admin hozhat létre admin fiókot" },
        { status: 403 },
      );
    }

    const exists = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (exists) {
      return NextResponse.json({ error: "Ez az email már használatban van" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 10);
    const user = await prisma.user.create({
      data: {
        email: parsed.data.email,
        name: parsed.data.name,
        role: parsed.data.role,
        passwordHash,
        classId: parsed.data.role === "STUDENT" ? parsed.data.classId ?? null : null,
      },
      select: { id: true, email: true, name: true, role: true, classId: true },
    });
    return NextResponse.json({ user }, { status: 201 });
  } catch (e) {
    console.error("admin user create error:", e);
    return NextResponse.json({ error: "Belső hiba" }, { status: 500 });
  }
}
