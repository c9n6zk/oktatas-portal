"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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

type Role = "SUPERADMIN" | "ADMIN" | "INSTRUCTOR" | "STUDENT";

interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  classId: string | null;
  className: string | null;
}

const roleBadge: Record<Role, string> = {
  SUPERADMIN: "bg-red-500/10 text-red-600 dark:text-red-400",
  ADMIN: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  INSTRUCTOR: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  STUDENT: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
};

const roleLabel: Record<Role, string> = {
  SUPERADMIN: "Szuper-admin",
  ADMIN: "Admin",
  INSTRUCTOR: "Oktató",
  STUDENT: "Diák",
};

export function UsersPanel({
  initialUsers,
  classes,
  currentUserId,
  isSuperAdmin,
}: {
  initialUsers: User[];
  classes: { id: string; label: string }[];
  currentUserId: string;
  isSuperAdmin: boolean;
}) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [openCreate, setOpenCreate] = useState(false);
  const [isPending, startTransition] = useTransition();

  const allowedRoles: Role[] = isSuperAdmin
    ? ["SUPERADMIN", "ADMIN", "INSTRUCTOR", "STUDENT"]
    : ["INSTRUCTOR", "STUDENT"];

  async function handleCreate(form: FormData) {
    const payload = {
      email: form.get("email"),
      name: form.get("name"),
      password: form.get("password"),
      role: form.get("role"),
      classId: form.get("classId") || null,
    };
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast.error(err.error ?? "Nem sikerült");
      return;
    }
    const { user } = await res.json();
    const cls = classes.find((c) => c.id === user.classId);
    setUsers((p) => [
      ...p,
      { ...user, classId: user.classId ?? null, className: cls?.label ?? null },
    ]);
    toast.success("Felhasználó létrehozva");
    setOpenCreate(false);
    startTransition(() => router.refresh());
  }

  async function handleDelete(id: string) {
    if (!confirm("Biztosan törlöd?")) return;
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast.error(err.error ?? "Nem sikerült");
      return;
    }
    setUsers((p) => p.filter((u) => u.id !== id));
    toast.success("Törölve");
  }

  async function handleRoleChange(id: string, role: Role) {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ role }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast.error(err.error ?? "Nem sikerült");
      return;
    }
    setUsers((p) => p.map((u) => (u.id === id ? { ...u, role } : u)));
    toast.success("Szerepkör frissítve");
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-1" /> Új felhasználó
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Új felhasználó</DialogTitle>
              <DialogDescription>
                A jelszót később a felhasználó tudja módosítani belépés után.
              </DialogDescription>
            </DialogHeader>
            <form action={handleCreate} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="name">Név</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="password">Jelszó (min. 6)</Label>
                <Input id="password" name="password" type="password" minLength={6} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="role">Szerepkör</Label>
                  <select
                    id="role"
                    name="role"
                    defaultValue="STUDENT"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {allowedRoles.map((r) => (
                      <option key={r} value={r}>
                        {roleLabel[r]}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="classId">Osztály (diák)</Label>
                  <select
                    id="classId"
                    name="classId"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">— nincs —</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isPending}>
                  Létrehozás
                </Button>
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
              <TableHead>Név</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Szerepkör</TableHead>
              <TableHead>Osztály</TableHead>
              <TableHead className="text-right">Műveletek</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => {
              const targetPrivileged = u.role === "ADMIN" || u.role === "SUPERADMIN";
              const locked =
                u.id === currentUserId || (!isSuperAdmin && targetPrivileged);
              return (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell className="text-muted-foreground">{u.email}</TableCell>
                  <TableCell>
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value as Role)}
                      disabled={locked}
                      className={`text-xs font-medium px-2 py-1 rounded ${roleBadge[u.role]} bg-transparent border-0`}
                    >
                      {allowedRoles.map((r) => (
                        <option key={r} value={r}>
                          {roleLabel[r]}
                        </option>
                      ))}
                      {!allowedRoles.includes(u.role) && (
                        <option value={u.role}>{roleLabel[u.role]}</option>
                      )}
                    </select>
                  </TableCell>
                  <TableCell>
                    {u.className ? <Badge variant="outline">{u.className}</Badge> : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(u.id)}
                      disabled={locked}
                      aria-label="Törlés"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile: card list */}
      <div className="md:hidden space-y-3">
        {users.map((u) => {
          const targetPrivileged = u.role === "ADMIN" || u.role === "SUPERADMIN";
          const locked =
            u.id === currentUserId || (!isSuperAdmin && targetPrivileged);
          return (
            <div key={u.id} className="border rounded-lg p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="font-medium truncate">{u.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(u.id)}
                  disabled={locked}
                  aria-label="Törlés"
                  className="shrink-0"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={u.role}
                  onChange={(e) => handleRoleChange(u.id, e.target.value as Role)}
                  disabled={locked}
                  className={`text-xs font-medium px-2 py-1 rounded ${roleBadge[u.role]} bg-transparent border-0`}
                >
                  {allowedRoles.map((r) => (
                    <option key={r} value={r}>
                      {roleLabel[r]}
                    </option>
                  ))}
                  {!allowedRoles.includes(u.role) && (
                    <option value={u.role}>{roleLabel[u.role]}</option>
                  )}
                </select>
                {u.className && <Badge variant="outline">{u.className}</Badge>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
