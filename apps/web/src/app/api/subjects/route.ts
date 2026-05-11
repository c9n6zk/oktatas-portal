import { NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { subjectSchema } from "@repo/shared";
import { requireRole } from "@/lib/rbac";

export async function GET() {
  const subjects = await prisma.subject.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { assignments: true } } },
  });
  return NextResponse.json({ subjects });
}

export async function POST(req: Request) {
  await requireRole("ADMIN");
  try {
    const parsed = subjectSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const created = await prisma.subject.create({ data: parsed.data });
    return NextResponse.json({ subject: created }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("Unique")) {
      return NextResponse.json({ error: "Ezzel a kóddal már létezik tárgy" }, { status: 409 });
    }
    console.error("subject create error:", msg);
    return NextResponse.json({ error: "Belső hiba" }, { status: 500 });
  }
}
