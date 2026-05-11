"use client";
import { useState } from "react";
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
import { Plus, Trash2, Clock } from "lucide-react";

const DAYS = [
  { key: "MONDAY", label: "Hétfő" },
  { key: "TUESDAY", label: "Kedd" },
  { key: "WEDNESDAY", label: "Szerda" },
  { key: "THURSDAY", label: "Csütörtök" },
  { key: "FRIDAY", label: "Péntek" },
  { key: "SATURDAY", label: "Szombat" },
  { key: "SUNDAY", label: "Vasárnap" },
] as const;

interface Entry {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room: string | null;
  substituteTeacherId: string | null;
  substituteTeacherName: string | null;
}

interface Assignment {
  id: string;
  label: string;
  entries: Entry[];
}

interface Teacher {
  id: string;
  name: string;
}

export function SchedulePanel({
  assignments,
  teachers,
}: {
  assignments: Assignment[];
  teachers: Teacher[];
}) {
  const router = useRouter();
  const [openFor, setOpenFor] = useState<string | null>(null);

  async function handleCreate(form: FormData, assignmentId: string) {
    const payload = {
      assignmentId,
      dayOfWeek: form.get("dayOfWeek"),
      startTime: form.get("startTime"),
      endTime: form.get("endTime"),
      room: form.get("room") || null,
    };
    const res = await fetch("/api/schedule", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast.error(err.error ?? "Nem sikerült");
      return;
    }
    toast.success("Óra hozzáadva");
    setOpenFor(null);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Biztosan törlöd?")) return;
    const res = await fetch(`/api/schedule/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Nem sikerült");
      return;
    }
    toast.success("Törölve");
    router.refresh();
  }

  async function handleSetSubstitute(entryId: string, teacherId: string | null) {
    const res = await fetch(`/api/schedule/${entryId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ substituteTeacherId: teacherId }),
    });
    if (!res.ok) {
      toast.error("Nem sikerült");
      return;
    }
    toast.success(teacherId ? "Helyettes beállítva" : "Helyettes eltávolítva");
    router.refresh();
  }

  if (assignments.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Nincs hozzárendelés. Először hozz létre egyet a Hozzárendelések oldalon.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {assignments.map((a) => (
        <Card key={a.id}>
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <div>
                <CardTitle className="text-base">{a.label}</CardTitle>
                <CardDescription>{a.entries.length} óra hetente</CardDescription>
              </div>
              <Dialog open={openFor === a.id} onOpenChange={(o) => setOpenFor(o ? a.id : null)}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-1" /> Új óra
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Új órarend bejegyzés</DialogTitle>
                  </DialogHeader>
                  <form
                    action={(fd) => handleCreate(fd, a.id)}
                    className="space-y-3"
                  >
                    <div className="space-y-1">
                      <Label htmlFor={`day-${a.id}`}>Nap</Label>
                      <select
                        id={`day-${a.id}`}
                        name="dayOfWeek"
                        required
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        {DAYS.map((d) => (
                          <option key={d.key} value={d.key}>
                            {d.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor={`start-${a.id}`}>Kezdés</Label>
                        <Input
                          id={`start-${a.id}`}
                          name="startTime"
                          type="time"
                          required
                          defaultValue="08:00"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`end-${a.id}`}>Vége</Label>
                        <Input
                          id={`end-${a.id}`}
                          name="endTime"
                          type="time"
                          required
                          defaultValue="08:45"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`room-${a.id}`}>Terem</Label>
                      <Input id={`room-${a.id}`} name="room" placeholder="201" />
                    </div>
                    <DialogFooter>
                      <Button type="submit">Hozzáadás</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {a.entries.length === 0 ? (
              <p className="text-sm text-muted-foreground">Még nincs órarend bejegyzés.</p>
            ) : (
              <div className="space-y-2">
                {a.entries.map((e) => {
                  const dayLabel = DAYS.find((d) => d.key === e.dayOfWeek)?.label ?? e.dayOfWeek;
                  return (
                    <div
                      key={e.id}
                      className="flex items-center justify-between gap-3 border rounded p-2 flex-wrap"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Badge variant="outline" className="whitespace-nowrap">
                          {dayLabel}
                        </Badge>
                        <span className="font-mono text-sm whitespace-nowrap">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {e.startTime}–{e.endTime}
                        </span>
                        {e.room && (
                          <Badge variant="secondary" className="text-xs">
                            {e.room}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={e.substituteTeacherId ?? ""}
                          onChange={(ev) =>
                            handleSetSubstitute(e.id, ev.target.value || null)
                          }
                          className="text-xs border rounded px-2 py-1 bg-background"
                        >
                          <option value="">— nincs helyettes —</option>
                          {teachers.map((t) => (
                            <option key={t.id} value={t.id}>
                              Helyettes: {t.name}
                            </option>
                          ))}
                        </select>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(e.id)}
                          aria-label="Törlés"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
