"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export function DeleteEventButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function onDelete() {
    if (!confirm(`Biztosan törlöd? — "${title}"`)) return;
    const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Nem sikerült");
      return;
    }
    toast.success("Esemény törölve");
    startTransition(() => router.refresh());
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onDelete}
      disabled={isPending}
      aria-label="Törlés"
    >
      <Trash2 className="h-4 w-4 text-destructive" />
    </Button>
  );
}
