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
import { Plus } from "lucide-react";

export function EventsPanel({ canCreate }: { canCreate: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  if (!canCreate) return null;

  async function handleCreate(form: FormData) {
    const payload = {
      title: form.get("title"),
      description: form.get("description") || null,
      location: form.get("location") || null,
      startsAt: new Date(form.get("startsAt") as string).toISOString(),
      endsAt: form.get("endsAt")
        ? new Date(form.get("endsAt") as string).toISOString()
        : null,
    };
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast.error(err.error ?? "Nem sikerült");
      return;
    }
    toast.success("Esemény létrehozva");
    setOpen(false);
    router.refresh();
  }

  return (
    <div className="flex justify-end">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="h-4 w-4 mr-1" /> Új esemény
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Új esemény</DialogTitle>
          </DialogHeader>
          <form action={handleCreate} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="title">Cím</Label>
              <Input id="title" name="title" required placeholder="Szalagavató" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="description">Leírás</Label>
              <Input id="description" name="description" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="location">Helyszín</Label>
              <Input id="location" name="location" placeholder="Sportcsarnok" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="startsAt">Kezdés</Label>
                <Input id="startsAt" name="startsAt" type="datetime-local" required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="endsAt">Vége</Label>
                <Input id="endsAt" name="endsAt" type="datetime-local" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Létrehozás</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
