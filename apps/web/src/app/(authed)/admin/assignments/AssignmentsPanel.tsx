"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";

interface AssignmentRow {
  id: string;
  year: number;
  subjectName: string;
  subjectCode: string;
  target: string;
  targetKind: "class" | "group";
  teacherName: string;
  gradeCount: number;
}

interface Option {
  id: string;
  label: string;
}

export function AssignmentsPanel({
  initial,
  subjects,
  classes,
  groups,
  teachers,
}: {
  initial: AssignmentRow[];
  subjects: Option[];
  classes: Option[];
  groups: Option[];
  teachers: Option[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [open, setOpen] = useState(false);
  const [targetKind, setTargetKind] = useState<"class" | "group">("class");

  async function handleCreate(form: FormData) {
    const payload: {
      year: number;
      subjectId: string;
      teacherId: string;
      classId?: string;
      groupId?: string;
    } = {
      year: Number(form.get("year")),
      subjectId: form.get("subjectId") as string,
      teacherId: form.get("teacherId") as string,
    };
    if (targetKind === "class") payload.classId = form.get("classId") as string;
    else payload.groupId = form.get("groupId") as string;

    const res = await fetch("/api/assignments", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast.error(err.error ?? "Nem sikerült");
      return;
    }
    toast.success("Hozzárendelés létrehozva");
    setOpen(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Biztosan törlöd? A jegyek is törlődnek.")) return;
    const res = await fetch(`/api/assignments/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Nem sikerült");
      return;
    }
    setItems((p) => p.filter((a) => a.id !== id));
    toast.success("Törölve");
  }

  const currentYear = new Date().getFullYear();

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-1" /> Új hozzárendelés
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Új tárgyhozzárendelés</DialogTitle>
            </DialogHeader>
            <form action={handleCreate} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="year">Tanév kezdő éve</Label>
                <Input
                  id="year"
                  name="year"
                  type="number"
                  min={1990}
                  max={2100}
                  defaultValue={currentYear}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="subjectId">Tárgy</Label>
                <select
                  id="subjectId"
                  name="subjectId"
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">— válassz —</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label>Célközönség</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={targetKind === "class" ? "default" : "outline"}
                    onClick={() => setTargetKind("class")}
                  >
                    Osztály
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={targetKind === "group" ? "default" : "outline"}
                    onClick={() => setTargetKind("group")}
                  >
                    Csoport
                  </Button>
                </div>
              </div>
              {targetKind === "class" ? (
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
              ) : (
                <div className="space-y-1">
                  <Label htmlFor="groupId">Csoport</Label>
                  <select
                    id="groupId"
                    name="groupId"
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">— válassz —</option>
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="space-y-1">
                <Label htmlFor="teacherId">Oktató</Label>
                <select
                  id="teacherId"
                  name="teacherId"
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">— válassz —</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <DialogFooter>
                <Button type="submit">Létrehozás</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tanév</TableHead>
            <TableHead>Tárgy</TableHead>
            <TableHead>Célközönség</TableHead>
            <TableHead>Oktató</TableHead>
            <TableHead className="text-center">Jegyek</TableHead>
            <TableHead className="text-right">Művelet</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((a) => (
            <TableRow key={a.id}>
              <TableCell className="font-mono">
                {a.year}/{a.year + 1}
              </TableCell>
              <TableCell>
                <div className="font-medium">{a.subjectName}</div>
                <div className="text-xs text-muted-foreground">{a.subjectCode}</div>
              </TableCell>
              <TableCell>
                <Badge variant={a.targetKind === "class" ? "default" : "secondary"}>
                  {a.target}
                </Badge>
              </TableCell>
              <TableCell>{a.teacherName}</TableCell>
              <TableCell className="text-center">{a.gradeCount}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(a.id)}
                  aria-label="Törlés"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
