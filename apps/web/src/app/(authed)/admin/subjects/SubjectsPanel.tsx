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

interface SubjectRow {
  id: string;
  code: string;
  name: string;
  description: string | null;
  bookTitle: string | null;
  lessons: string[];
  assignmentCount: number;
}

export function SubjectsPanel({ initial }: { initial: SubjectRow[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [open, setOpen] = useState(false);

  async function handleCreate(form: FormData) {
    const lessonsRaw = (form.get("lessons") as string | null) ?? "";
    const lessons = lessonsRaw
      .split(",")
      .map((l) => l.trim())
      .filter(Boolean);

    const payload = {
      code: form.get("code"),
      name: form.get("name"),
      description: form.get("description") || null,
      bookTitle: form.get("bookTitle") || null,
      lessons,
    };
    const res = await fetch("/api/subjects", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast.error(err.error ?? "Nem sikerült");
      return;
    }
    const { subject } = await res.json();
    setItems((p) => [...p, { ...subject, assignmentCount: 0 }]);
    toast.success("Tárgy létrehozva");
    setOpen(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Biztosan törlöd?")) return;
    const res = await fetch(`/api/subjects/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Nem sikerült");
      return;
    }
    setItems((p) => p.filter((s) => s.id !== id));
    toast.success("Törölve");
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" /> Új tárgy</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Új tárgy</DialogTitle>
            </DialogHeader>
            <form action={handleCreate} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="code">Kód</Label>
                  <Input id="code" name="code" placeholder="MAT" required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="name">Név</Label>
                  <Input id="name" name="name" placeholder="Matematika" required />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="description">Leírás</Label>
                <Input id="description" name="description" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="bookTitle">Tankönyv</Label>
                <Input id="bookTitle" name="bookTitle" placeholder="Matematika 10." />
              </div>
              <div className="space-y-1">
                <Label htmlFor="lessons">Leckék (vesszővel)</Label>
                <Input
                  id="lessons"
                  name="lessons"
                  placeholder="1. Halmazok, 2. Egyenletek, 3. Függvények"
                />
              </div>
              <DialogFooter>
                <Button type="submit">Létrehozás</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Desktop: table */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kód</TableHead>
              <TableHead>Név</TableHead>
              <TableHead>Tankönyv</TableHead>
              <TableHead>Leckék</TableHead>
              <TableHead className="text-center">Hozzárendelés</TableHead>
              <TableHead className="text-right">Művelet</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-mono">{s.code}</TableCell>
                <TableCell className="font-medium">{s.name}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {s.bookTitle ?? "—"}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {s.lessons.length > 0 ? `${s.lessons.length} db` : "—"}
                </TableCell>
                <TableCell className="text-center">{s.assignmentCount}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(s.id)}
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

      {/* Mobile: card list */}
      <div className="md:hidden space-y-3">
        {items.map((s) => (
          <div key={s.id} className="border rounded-lg p-3 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-xs text-muted-foreground">{s.code}</span>
                  <span className="font-medium">{s.name}</span>
                </div>
                {s.bookTitle && (
                  <div className="text-xs text-muted-foreground mt-1 truncate">
                    📖 {s.bookTitle}
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(s.id)}
                aria-label="Törlés"
                className="shrink-0"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <div>{s.lessons.length > 0 ? `${s.lessons.length} lecke` : "nincs lecke"}</div>
              <div>{s.assignmentCount} hozzárendelés</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
