"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Trash2, CheckCircle2, BarChart3 } from "lucide-react";

interface PollOption {
  id: string;
  text: string;
  count: number;
}

interface Poll {
  id: string;
  question: string;
  description: string | null;
  audience: string;
  className: string | null;
  closesAt: string | null;
  createdBy: string;
  options: PollOption[];
  totalResponses: number;
  myVoteOptionId: string | null;
}

const AUDIENCE_LABEL: Record<string, string> = {
  ALL: "Mindenki",
  STUDENTS: "Diákok",
  INSTRUCTORS: "Oktatók",
  CLASS: "Osztály",
};

export function PollsPanel({
  initial,
  canCreate,
  classes,
}: {
  initial: Poll[];
  canCreate: boolean;
  classes: { id: string; label: string }[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [audience, setAudience] = useState<string>("ALL");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [isPending, startTransition] = useTransition();

  async function handleVote(pollId: string, optionId: string) {
    const res = await fetch(`/api/polls/${pollId}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ optionId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast.error(err.error ?? "Nem sikerült");
      return;
    }
    toast.success("Szavazat rögzítve");
    startTransition(() => router.refresh());
  }

  async function handleCreate(form: FormData) {
    const cleanOptions = options.map((o) => o.trim()).filter(Boolean);
    if (cleanOptions.length < 2) {
      toast.error("Min. 2 nem-üres opció szükséges");
      return;
    }
    const closesAtRaw = form.get("closesAt") as string | null;
    const payload = {
      question: form.get("question"),
      description: form.get("description") || null,
      audience,
      classId: audience === "CLASS" ? (form.get("classId") as string) : null,
      closesAt: closesAtRaw ? new Date(closesAtRaw).toISOString() : null,
      options: cleanOptions,
    };
    const res = await fetch("/api/polls", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast.error(err.error ?? "Nem sikerült");
      return;
    }
    toast.success("Szavazás létrehozva");
    setOpen(false);
    setAudience("ALL");
    setOptions(["", ""]);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Biztosan törlöd a szavazást?")) return;
    const res = await fetch(`/api/polls/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Nem sikerült");
      return;
    }
    toast.success("Törölve");
    router.refresh();
  }

  function updateOption(i: number, val: string) {
    setOptions((p) => p.map((o, idx) => (idx === i ? val : o)));
  }

  return (
    <div className="space-y-4">
      {canCreate && (
        <div className="flex justify-end">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-1" /> Új szavazás
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Új szavazás</DialogTitle>
              </DialogHeader>
              <form action={handleCreate} className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="question">Kérdés</Label>
                  <Input id="question" name="question" required placeholder="Mikor legyen a következő..." />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="description">Leírás (opcionális)</Label>
                  <Input id="description" name="description" />
                </div>

                <div className="space-y-1">
                  <Label>Célközönség</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["ALL", "STUDENTS", "INSTRUCTORS", "CLASS"] as const).map((a) => (
                      <Button
                        key={a}
                        type="button"
                        size="sm"
                        variant={audience === a ? "default" : "outline"}
                        onClick={() => setAudience(a)}
                      >
                        {AUDIENCE_LABEL[a]}
                      </Button>
                    ))}
                  </div>
                </div>

                {audience === "CLASS" && (
                  <div className="space-y-1">
                    <Label htmlFor="classId">Osztály</Label>
                    <select
                      id="classId"
                      name="classId"
                      required
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">— válassz —</option>
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="space-y-1">
                  <Label htmlFor="closesAt">Lezárás (opcionális)</Label>
                  <Input id="closesAt" name="closesAt" type="datetime-local" />
                </div>

                <div className="space-y-2">
                  <Label>Opciók (min. 2)</Label>
                  {options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Input
                        value={opt}
                        onChange={(e) => updateOption(i, e.target.value)}
                        placeholder={`Opció ${i + 1}`}
                      />
                      {options.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setOptions((p) => p.filter((_, idx) => idx !== i))}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setOptions((p) => [...p, ""])}
                  >
                    <Plus className="h-3 w-3 mr-1" /> +Opció
                  </Button>
                </div>

                <DialogFooter>
                  <Button type="submit">Létrehozás</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {initial.map((p) => {
          const closed = p.closesAt && new Date(p.closesAt) < new Date();
          const hasVoted = p.myVoteOptionId !== null;
          return (
            <Card key={p.id} className={closed ? "opacity-70" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <CardTitle className="text-base">{p.question}</CardTitle>
                    {p.description && (
                      <CardDescription className="text-xs">{p.description}</CardDescription>
                    )}
                    <div className="flex flex-wrap gap-1 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {AUDIENCE_LABEL[p.audience]}
                        {p.className ? ` · ${p.className}` : ""}
                      </Badge>
                      {closed ? (
                        <Badge variant="destructive" className="text-xs">
                          Lezárt
                        </Badge>
                      ) : (
                        hasVoted && (
                          <Badge className="text-xs bg-emerald-600">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Szavaztál
                          </Badge>
                        )
                      )}
                    </div>
                  </div>
                  {canCreate && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(p.id)}
                      aria-label="Törlés"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {p.options.map((o) => {
                  const pct =
                    p.totalResponses > 0
                      ? Math.round((o.count / p.totalResponses) * 100)
                      : 0;
                  const isMine = p.myVoteOptionId === o.id;
                  return (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => !closed && handleVote(p.id, o.id)}
                      disabled={closed === true || isPending}
                      className={`w-full text-left rounded border p-2 transition relative overflow-hidden disabled:cursor-not-allowed ${
                        isMine
                          ? "border-primary bg-primary/5"
                          : "hover:border-primary/40 hover:bg-muted/30"
                      }`}
                    >
                      <div
                        className="absolute inset-0 bg-primary/10"
                        style={{ width: `${pct}%` }}
                      />
                      <div className="relative flex items-center justify-between gap-2">
                        <span className="flex items-center gap-2 text-sm">
                          {isMine && <CheckCircle2 className="h-4 w-4 text-primary" />}
                          {o.text}
                        </span>
                        <span className="text-xs font-mono text-muted-foreground">
                          {o.count} ({pct}%)
                        </span>
                      </div>
                    </button>
                  );
                })}
                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1 border-t">
                  <BarChart3 className="h-3 w-3" />
                  {p.totalResponses} válasz · Létrehozó: {p.createdBy}
                  {p.closesAt && (
                    <span className="ml-auto">
                      Lezárul: {new Date(p.closesAt).toLocaleString("hu-HU")}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
