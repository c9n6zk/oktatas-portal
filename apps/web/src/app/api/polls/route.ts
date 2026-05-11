import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@repo/db";
import { requireAuth, requireRole } from "@/lib/rbac";

const pollSchema = z.object({
  question: z.string().min(1).max(500),
  description: z.string().optional().nullable(),
  audience: z.enum(["ALL", "STUDENTS", "INSTRUCTORS", "CLASS"]).default("ALL"),
  classId: z.string().nullable().optional(),
  closesAt: z.string().datetime().optional().nullable(),
  options: z.array(z.string().min(1)).min(2, "Min. 2 opció szükséges"),
});

export async function GET() {
  const session = await requireAuth();

  // Audience filter — csak a relevánsakat látja
  const orConditions: Record<string, unknown>[] = [{ audience: "ALL" }];
  if (session.user.role === "STUDENT") {
    orConditions.push({ audience: "STUDENTS" });
    const me = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { classId: true },
    });
    if (me?.classId) {
      orConditions.push({ audience: "CLASS", classId: me.classId });
    }
  } else if (session.user.role === "INSTRUCTOR") {
    orConditions.push({ audience: "INSTRUCTORS" });
  } else {
    // ADMIN+ látja az összest
    const all = await prisma.poll.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        options: { orderBy: { order: "asc" } },
        createdBy: { select: { name: true } },
        schoolClass: { select: { startYear: true, identifier: true } },
        responses: { select: { userId: true, optionId: true } },
      },
    });
    return NextResponse.json({ polls: all, currentUserId: session.user.id });
  }

  const polls = await prisma.poll.findMany({
    where: { OR: orConditions },
    orderBy: { createdAt: "desc" },
    include: {
      options: { orderBy: { order: "asc" } },
      createdBy: { select: { name: true } },
      schoolClass: { select: { startYear: true, identifier: true } },
      responses: { select: { userId: true, optionId: true } },
    },
  });
  return NextResponse.json({ polls, currentUserId: session.user.id });
}

export async function POST(req: Request) {
  const session = await requireRole("ADMIN");
  try {
    const parsed = pollSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const created = await prisma.poll.create({
      data: {
        question: parsed.data.question,
        description: parsed.data.description ?? null,
        audience: parsed.data.audience,
        classId: parsed.data.audience === "CLASS" ? parsed.data.classId ?? null : null,
        closesAt: parsed.data.closesAt ? new Date(parsed.data.closesAt) : null,
        createdById: session.user.id,
        options: {
          create: parsed.data.options.map((text, i) => ({ text, order: i })),
        },
      },
      include: { options: true },
    });
    return NextResponse.json({ poll: created }, { status: 201 });
  } catch (e) {
    console.error("poll create error:", e);
    return NextResponse.json({ error: "Belső hiba" }, { status: 500 });
  }
}
