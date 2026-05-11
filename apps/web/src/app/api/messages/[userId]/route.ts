import { NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { requireAuth } from "@/lib/rbac";
import { canMessage } from "@/lib/messaging";

interface RouteContext {
  params: Promise<{ userId: string }>;
}

// GET /api/messages/[userId] — egy beszélgetés teljes thread-je, olvasottra állít.
export async function GET(_req: Request, { params }: RouteContext) {
  const session = await requireAuth();
  const me = session.user.id;
  const { userId: other } = await params;

  const allowed = await canMessage(me, session.user.role, other);
  if (!allowed) {
    return NextResponse.json({ error: "Nem érhető el ez a beszélgetés." }, { status: 403 });
  }

  const [messages] = await Promise.all([
    prisma.message.findMany({
      where: {
        OR: [
          { senderId: me, recipientId: other },
          { senderId: other, recipientId: me },
        ],
      },
      orderBy: { createdAt: "asc" },
      select: { id: true, senderId: true, recipientId: true, body: true, readAt: true, createdAt: true },
    }),
    prisma.message.updateMany({
      where: { senderId: other, recipientId: me, readAt: null },
      data: { readAt: new Date() },
    }),
  ]);

  return NextResponse.json({ messages });
}
