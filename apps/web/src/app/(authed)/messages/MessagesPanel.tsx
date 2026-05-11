"use client";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Send, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

interface Contact {
  id: string;
  name: string;
  email: string;
  role: string;
}
interface LastMessage {
  id: string;
  body: string;
  createdAt: string;
  fromMe: boolean;
}
interface Conversation {
  contact: Contact;
  lastMessage: LastMessage | null;
  unread: number;
}
interface ThreadMessage {
  id: string;
  senderId: string;
  recipientId: string;
  body: string;
  readAt: string | null;
  createdAt: string;
}

const ROLE_LABEL: Record<string, string> = {
  STUDENT: "Diák",
  INSTRUCTOR: "Oktató",
  ADMIN: "Admin",
  SUPERADMIN: "Szuper-admin",
};

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  return sameDay
    ? d.toLocaleTimeString("hu-HU", { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString("hu-HU", { month: "short", day: "numeric" });
}

export function MessagesPanel({
  currentUserId,
  initialConversations,
  subtitle,
}: {
  currentUserId: string;
  initialConversations: Conversation[];
  subtitle: string;
}) {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [thread, setThread] = useState<ThreadMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loadingThread, setLoadingThread] = useState(false);
  const [isSending, startSending] = useTransition();
  const threadRef = useRef<HTMLDivElement>(null);

  const active = useMemo(
    () => conversations.find((c) => c.contact.id === activeId) ?? null,
    [conversations, activeId],
  );

  // Load thread when active changes.
  useEffect(() => {
    if (!activeId) {
      setThread([]);
      return;
    }
    let cancelled = false;
    setLoadingThread(true);
    (async () => {
      try {
        const res = await fetch(`/api/messages/${activeId}`, { cache: "no-store" });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        if (cancelled) return;
        setThread(data.messages as ThreadMessage[]);
        // Mark as read locally.
        setConversations((prev) =>
          prev.map((c) => (c.contact.id === activeId ? { ...c, unread: 0 } : c)),
        );
      } catch (e) {
        if (!cancelled) toast.error("Nem sikerült betölteni a beszélgetést.");
      } finally {
        if (!cancelled) setLoadingThread(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeId]);

  // Scroll to bottom on new messages.
  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [thread]);

  function send() {
    if (!activeId || !draft.trim() || isSending) return;
    const body = draft.trim();
    startSending(async () => {
      try {
        const res = await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recipientId: activeId, body }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error ?? "Küldési hiba");
        }
        const data = await res.json();
        setDraft("");
        setThread((prev) => [...prev, data.message as ThreadMessage]);
        setConversations((prev) => {
          const others = prev.filter((c) => c.contact.id !== activeId);
          const current = prev.find((c) => c.contact.id === activeId);
          if (!current) return prev;
          return [
            {
              ...current,
              lastMessage: {
                id: data.message.id,
                body: data.message.body,
                createdAt: data.message.createdAt,
                fromMe: true,
              },
            },
            ...others,
          ];
        });
        router.refresh();
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : "Küldési hiba");
      }
    });
  }

  if (conversations.length === 0) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold">Üzenetek</h1>
          <p className="text-muted-foreground">{subtitle}</p>
        </div>
        <Card className="p-12 text-center text-muted-foreground">
          <Inbox className="mx-auto mb-3 h-10 w-10 opacity-50" />
          <p>Nincs elérhető beszélgetőpartner.</p>
          <p className="text-sm">
            A diákok az osztályukat / csoportjukat tanító oktatókkal tudnak üzenni, az oktatók az általuk tanított
            diákokkal.
          </p>
        </Card>
      </div>
    );
  }

  const showList = !activeId;
  const showThread = !!activeId;

  return (
    <div className="space-y-4">
      <div className={cn(showThread && "hidden md:block")}>
        <h1 className="text-3xl font-bold">Üzenetek</h1>
        <p className="text-muted-foreground">{subtitle}</p>
      </div>
      <Card className="overflow-hidden">
      <div
        className={cn(
          "grid grid-cols-1 md:h-[70vh] md:grid-cols-[280px_1fr]",
          showThread ? "h-[calc(100dvh-120px)]" : "h-[calc(100dvh-220px)]",
          "min-h-[420px]",
        )}
      >
        {/* Kontakt lista */}
        <div className={cn("border-r overflow-y-auto", showThread && "hidden md:block")}>
          <ul className="divide-y">
            {conversations.map((conv) => {
              const isActive = conv.contact.id === activeId;
              return (
                <li key={conv.contact.id}>
                  <button
                    type="button"
                    onClick={() => setActiveId(conv.contact.id)}
                    className={cn(
                      "flex w-full items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-accent",
                      isActive && "bg-accent",
                    )}
                  >
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarFallback>{initials(conv.contact.name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate font-medium">{conv.contact.name}</span>
                        {conv.lastMessage && (
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {formatTime(conv.lastMessage.createdAt)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm text-muted-foreground">
                          {conv.lastMessage
                            ? (conv.lastMessage.fromMe ? "Te: " : "") + conv.lastMessage.body
                            : ROLE_LABEL[conv.contact.role] ?? conv.contact.role}
                        </span>
                        {conv.unread > 0 && (
                          <Badge variant="default" className="shrink-0">
                            {conv.unread}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Thread */}
        <div className={cn("flex flex-col", showList && "hidden md:flex")}>
          {!active ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              Válassz egy beszélgetést.
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 border-b px-4 py-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setActiveId(null)}
                  aria-label="Vissza"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <Avatar className="h-9 w-9">
                  <AvatarFallback>{initials(active.contact.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="truncate font-medium">{active.contact.name}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {ROLE_LABEL[active.contact.role] ?? active.contact.role} · {active.contact.email}
                  </div>
                </div>
              </div>

              <div ref={threadRef} className="flex-1 overflow-y-auto p-4">
                {loadingThread ? (
                  <p className="text-center text-muted-foreground">Betöltés…</p>
                ) : thread.length === 0 ? (
                  <p className="text-center text-muted-foreground">Még nincs üzenet — írj egyet!</p>
                ) : (
                  <ul className="space-y-2">
                    {thread.map((m) => {
                      const mine = m.senderId === currentUserId;
                      return (
                        <li key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                          <div
                            className={cn(
                              "max-w-[75%] rounded-2xl px-3 py-2 text-sm",
                              mine
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-foreground",
                            )}
                          >
                            <p className="whitespace-pre-wrap break-words">{m.body}</p>
                            <p
                              className={cn(
                                "mt-1 text-[10px]",
                                mine ? "text-primary-foreground/70" : "text-muted-foreground",
                              )}
                            >
                              {formatTime(m.createdAt)}
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send();
                }}
                className="flex items-end gap-2 border-t p-3"
              >
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  placeholder="Írj üzenetet…"
                  rows={1}
                  maxLength={2000}
                  style={{ resize: "none" }}
                  className="min-h-[40px] max-h-32 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                <Button type="submit" disabled={!draft.trim() || isSending} size="icon" aria-label="Küldés">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
      </Card>
    </div>
  );
}
