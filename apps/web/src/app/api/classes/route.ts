import { NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { schoolClassSchema } from "@repo/shared";
import { requireRole } from "@/lib/rbac";

export async function GET() {
  const classes = await prisma.schoolClass.findMany({
    orderBy: [{ startYear: "desc" }, { identifier: "asc" }],
    include: { _count: { select: { students: true, assignments: true } } },
  });
  return NextResponse.json({ classes });
}

export async function POST(req: Request) {
  await requireRole("ADMIN");
  try {
    const parsed = schoolClassSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const created = await prisma.schoolClass.create({ data: parsed.data });
    return NextResponse.json({ class: created }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("Unique")) {
      return NextResponse.json({ error: "Ez az osztály már létezik" }, { status: 409 });
    }
    console.error("class create error:", msg);
    return NextResponse.json({ error: "Belső hiba" }, { status: 500 });
  }
}
