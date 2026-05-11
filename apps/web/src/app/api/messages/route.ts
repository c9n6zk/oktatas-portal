import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@repo/db";
import { requireAuth } from "@/lib/rbac";
import { canMessage, getMessageContacts } from "@/lib/messaging";

const sendSchema = z.object({
  recipientId: z.string().min(1),
  body: z.string().min(1).max(2000),
});

// GET /api/messages — beszélgetések listája (kontakt + utolsó üzenet + olvasatlan db).
export async function GET() {
  const session = await requireAuth();
  const me = session.user.id;

  const contacts = await getMessageContacts(me, session.user.role);
  const contactIds = contacts.map((c) => c.id);

  // Az összes üzenet köztem és a kontaktjaim közt (utolsó 1 üzenet conv-onként).
  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: me, recipientId: { in: contactIds } },
        { recipientId: me, senderId: { in: contactIds } },
      ],
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      senderId: true,
      recipientId: true,
      body: true,
      readAt: true,
      createdAt: true,
    },
  });

  const conversations = contacts.map((c) => {
    const thread = messages.filter(
      (m) => (m.senderId === me && m.recipientId === c.id) || (m.senderId === c.id && m.recipientId === me),
    );
    const last = thread[0] ?? null;
    const unread = thread.filter((m) => m.recipientId === me && !m.readAt).length;
    return {
      contact: c,
      lastMessage: last
        ? { id: last.id, body: last.body, createdAt: last.createdAt, fromMe: last.senderId === me }
        : null,
      unread,
    };
  });

  conversations.sort((a, b) => {
    const ta = a.lastMessage ? a.lastMessage.createdAt.getTime() : 0;
    const tb = b.lastMessage ? b.lastMessage.createdAt.getTime() : 0;
    return tb - ta;
  });

  return NextResponse.json({ conversations });
}

// POST /api/messages — új üzenet küldése.
export async function POST(req: Request) {
  const session = await requireAuth();
  const parsed = sendSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const allowed = await canMessage(session.user.id, session.user.role, parsed.data.recipientId);
  if (!allowed) {
    return NextResponse.json({ error: "Nincs jogosultság üzenetet küldeni ennek a felhasználónak." }, { status: 403 });
  }

  const msg = await prisma.message.create({
    data: {
      senderId: session.user.id,
      recipientId: parsed.data.recipientId,
      body: parsed.data.body.trim(),
    },
    select: { id: true, senderId: true, recipientId: true, body: true, readAt: true, createdAt: true },
  });

  return NextResponse.json({ message: msg }, { status: 201 });
}
