import { prisma } from "@repo/db";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

export type ExpoPushMessage = {
  to: string | string[];
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: "default" | null;
  priority?: "default" | "normal" | "high";
};

export async function sendExpoPush(messages: ExpoPushMessage[]): Promise<void> {
  if (messages.length === 0) return;
  try {
    const res = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: {
        accept: "application/json",
        "accept-encoding": "gzip, deflate",
        "content-type": "application/json",
      },
      body: JSON.stringify(messages),
    });
    if (!res.ok) {
      console.warn("[expo-push] non-OK response", res.status, await res.text());
    }
  } catch (e) {
    console.warn("[expo-push] send failed", e);
  }
}

export async function notifyUser(
  userId: string,
  payload: { title: string; body: string; data?: Record<string, unknown> },
): Promise<void> {
  const tokens = await prisma.pushToken.findMany({
    where: { userId },
    select: { token: true },
  });
  if (tokens.length === 0) return;
  await sendExpoPush(
    tokens.map((t) => ({
      to: t.token,
      title: payload.title,
      body: payload.body,
      data: payload.data,
      sound: "default",
      priority: "high",
    })),
  );
}
