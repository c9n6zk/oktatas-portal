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
import { Plus, Trash2, Users } from "lucide-react";

interface Member {
  id: string;
  name: string;
  email: string;
}

interface GroupRow {
  id: string;
  name: string;
  description: string | null;
  members: Member[];
  assignmentCount: number;
}

interface StudentOption {
  id: string;
  label: string;
}

export function GroupsPanel({
  initial,
  students,
}: {
  initial: GroupRow[];
  students: StudentOption[];
}) {
  const router = useRouter();
  const [groups, setGroups] = useState(initial);
  const [openNew, setOpenNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());

  function toggleMember(id: string) {
    setSelectedMembers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleCreate(form: FormData) {
    const payload = {
      name: form.get("name"),
      description: form.get("description") || null,
      memberIds: Array.from(selectedMembers),
    };
    const res = await fetch("/api/groups", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast.error(err.error ?? "Nem sikerült");
      return;
    }
    const { group } = await res.json();
    setGroups((p) => [
      ...p,
      {
        id: group.id,
        name: group.name,
        description: group.description,
        members: group.members.map((m: Member) => ({ id: m.id, name: m.name, email: m.email })),
        assignmentCount: 0,
      },
    ]);
    toast.success("Csoport létrehozva");
    setOpenNew(false);
    setSelectedMembers(new Set());
    router.refresh();
  }

  async function handleEditMembers(groupId: string) {
    const res = await fetch(`/api/groups/${groupId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ memberIds: Array.from(selectedMembers) }),
    });
    if (!res.ok) {
      toast.error("Nem sikerült");
      return;
    }
    const { group } = await res.json();
    setGroups((p) =>
      p.map((g) =>
        g.id === groupId
          ? {
              ...g,
              members: group.members.map((m: Member) => ({
                id: m.id,
                name: m.name,
                email: m.email,
              })),
            }
          : g,
      ),
    );
    toast.success("Tagok frissítve");
    setEditingId(null);
    setSelectedMembers(new Set());
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Biztosan törlöd a csoportot?")) return;
    const res = await fetch(`/api/groups/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Nem sikerült");
      return;
    }
    setGroups((p) => p.filter((g) => g.id !== id));
    toast.success("Törölve");
  }

  function startEdit(group: GroupRow) {
    setEditingId(group.id);
    setSelectedMembers(new Set(group.members.map((m) => m.id)));
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog
          open={openNew}
          onOpenChange={(o) => {
            setOpenNew(o);
            if (o) setSelectedMembers(new Set());
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-1" /> Új csoport
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Új csoport</DialogTitle>
            </DialogHeader>
            <form action={handleCreate} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="name">Név</Label>
                <Input id="name" name="name" required placeholder="Haladó matematika" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="description">Leírás</Label>
                <Input id="description" name="description" placeholder="Pl. 10. évfolyam, magasabb nehézségű csoport" />
              </div>
              <MemberSelector
                students={students}
                selected={selectedMembers}
                onToggle={toggleMember}
              />
              <DialogFooter>
                <Button type="submit">Létrehozás</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {groups.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Még nincs csoport.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {groups.map((g) => (
            <Card key={g.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg">{g.name}</CardTitle>
                    {g.description && <CardDescription>{g.description}</CardDescription>}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(g.id)}
                    aria-label="Törlés"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {g.members.length} tag · {g.assignmentCount} tárgyhoz rendelve
                </div>
                {g.members.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {g.members.map((m) => (
                      <Badge key={m.id} variant="secondary" className="text-xs">
                        {m.name}
                      </Badge>
                    ))}
                  </div>
                )}
                <Dialog
                  open={editingId === g.id}
                  onOpenChange={(o) => {
                    if (o) startEdit(g);
                    else {
                      setEditingId(null);
                      setSelectedMembers(new Set());
                    }
                  }}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full">
                      Tagok szerkesztése
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Tagok — {g.name}</DialogTitle>
                    </DialogHeader>
                    <MemberSelector
                      students={students}
                      selected={selectedMembers}
                      onToggle={toggleMember}
                    />
                    <DialogFooter>
                      <Button onClick={() => handleEditMembers(g.id)}>Mentés</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function MemberSelector({
  students,
  selected,
  onToggle,
}: {
  students: StudentOption[];
  selected: Set<string>;
  onToggle: (id: string) => void;
}) {
  return (
    <div className="space-y-1">
      <Label>Tagok ({selected.size} kiválasztva)</Label>
      <div className="max-h-64 overflow-y-auto border rounded-md p-2 space-y-1">
        {students.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nincs diák a rendszerben.
          </p>
        ) : (
          students.map((s) => (
            <label
              key={s.id}
              className="flex items-center gap-2 px-2 py-1 hover:bg-muted/50 rounded cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selected.has(s.id)}
                onChange={() => onToggle(s.id)}
                className="h-4 w-4"
              />
              <span className="text-sm">{s.label}</span>
            </label>
          ))
        )}
      </div>
    </div>
  );
}
