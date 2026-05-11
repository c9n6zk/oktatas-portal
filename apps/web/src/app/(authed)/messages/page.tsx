import { requireAuth } from "@/lib/rbac";
import { prisma } from "@repo/db";
import { getMessageContacts } from "@/lib/messaging";
import { MessagesPanel } from "./MessagesPanel";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const session = await requireAuth();
  const me = session.user.id;

  const contacts = await getMessageContacts(me, session.user.role);
  const contactIds = contacts.map((c) => c.id);

  const messages = contactIds.length
    ? await prisma.message.findMany({
        where: {
          OR: [
            { senderId: me, recipientId: { in: contactIds } },
            { recipientId: me, senderId: { in: contactIds } },
          ],
        },
        orderBy: { createdAt: "desc" },
        select: { id: true, senderId: true, recipientId: true, body: true, readAt: true, createdAt: true },
      })
    : [];

  const conversations = contacts.map((c) => {
    const thread = messages.filter(
      (m) => (m.senderId === me && m.recipientId === c.id) || (m.senderId === c.id && m.recipientId === me),
    );
    const last = thread[0] ?? null;
    const unread = thread.filter((m) => m.recipientId === me && !m.readAt).length;
    return {
      contact: c,
      lastMessage: last
        ? { id: last.id, body: last.body, createdAt: last.createdAt.toISOString(), fromMe: last.senderId === me }
        : null,
      unread,
    };
  });

  conversations.sort((a, b) => {
    const ta = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
    const tb = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
    return tb - ta;
  });

  const subtitle =
    "Kétirányú üzenetváltás " +
    (session.user.role === "STUDENT"
      ? "az osztályodat / csoportodat tanító oktatókkal."
      : session.user.role === "INSTRUCTOR"
        ? "az általad tanított osztályok / csoportok diákjaival."
        : "bármely felhasználóval.");

  return (
    <MessagesPanel
      currentUserId={me}
      initialConversations={conversations}
      subtitle={subtitle}
    />
  );
}
