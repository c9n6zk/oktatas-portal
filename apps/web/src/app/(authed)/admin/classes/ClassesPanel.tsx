"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

interface ClassRow {
  id: string;
  startYear: number;
  identifier: string;
  studentCount: number;
  assignmentCount: number;
}

export function ClassesPanel({ initial }: { initial: ClassRow[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [open, setOpen] = useState(false);

  async function handleCreate(form: FormData) {
    const payload = {
      startYear: Number(form.get("startYear")),
      identifier: form.get("identifier"),
    };
    const res = await fetch("/api/classes", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast.error(err.error ?? "Nem sikerült");
      return;
    }
    const { class: created } = await res.json();
    setItems((p) => [
      ...p,
      {
        id: created.id,
        startYear: created.startYear,
        identifier: created.identifier,
        studentCount: 0,
        assignmentCount: 0,
      },
    ]);
    toast.success("Osztály létrehozva");
    setOpen(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Biztosan törlöd?")) return;
    const res = await fetch(`/api/classes/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Nem sikerült");
      return;
    }
    setItems((p) => p.filter((c) => c.id !== id));
    toast.success("Törölve");
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" /> Új osztály</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Új osztály</DialogTitle>
            </DialogHeader>
            <form action={handleCreate} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="startYear">Kezdés éve</Label>
                  <Input
                    id="startYear"
                    name="startYear"
                    type="number"
                    min={1990}
                    max={2100}
                    defaultValue={2024}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="identifier">Azonosító</Label>
                  <Input
                    id="identifier"
                    name="identifier"
                    placeholder="A"
                    maxLength={10}
                    required
                  />
                </div>
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
            <TableHead>Osztály</TableHead>
            <TableHead className="text-center">Diákok</TableHead>
            <TableHead className="text-center">Tárgyhozzárendelések</TableHead>
            <TableHead className="text-right">Művelet</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((c) => (
            <TableRow key={c.id}>
              <TableCell className="font-mono font-semibold">
                {c.startYear}/{c.identifier}
              </TableCell>
              <TableCell className="text-center">{c.studentCount}</TableCell>
              <TableCell className="text-center">{c.assignmentCount}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(c.id)}
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
