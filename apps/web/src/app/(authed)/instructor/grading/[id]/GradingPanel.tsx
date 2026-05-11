"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  GRADE_TYPES,
  GRADE_TYPE_LABEL,
  DEFAULT_GRADE_WEIGHT,
  calculateWeightedAverage,
  type GradeType,
} from "@repo/shared";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Plus, Trash2 } from "lucide-react";

interface Student {
  id: string;
  name: string;
  email: string;
}

interface Grade {
  id: string;
  studentId: string;
  value: number;
  type: GradeType;
  weight: number;
  comment: string | null;
  givenAt: string;
}

const gradeColor: Record<number, string> = {
  1: "bg-red-500/10 text-red-700 dark:text-red-400",
  2: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
  3: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  4: "bg-lime-500/10 text-lime-700 dark:text-lime-400",
  5: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
};

export function GradingPanel({
  assignmentId,
  students,
  initialGrades,
}: {
  assignmentId: string;
  students: Student[];
  initialGrades: Grade[];
}) {
  const router = useRouter();
  const [grades, setGrades] = useState<Grade[]>(initialGrades);
  const [openFor, setOpenFor] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Class average across all students with at least one grade
  const allEligible = grades.filter((g) => g.type !== "YEAR_END");
  const classAvg = calculateWeightedAverage(allEligible);

  async function handleAddGrade(form: FormData) {
    const studentId = form.get("studentId") as string;
    const value = Number(form.get("value"));
    const type = form.get("type") as GradeType;
    const weight = form.get("weight") ? Number(form.get("weight")) : DEFAULT_GRADE_WEIGHT[type];
    const comment = (form.get("comment") as string) || null;

    if (!value || value < 1 || value > 5) {
      toast.error("A jegy 1 és 5 között legyen");
      return;
    }

    const res = await fetch("/api/grades", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ studentId, assignmentId, value, type, weight, comment }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast.error(err.error ?? "Nem sikerült");
      return;
    }
    const data = await res.json();
    setGrades((prev) => [
      {
        id: data.grade.id,
        studentId,
        value,
        type,
        weight,
        comment,
        givenAt: data.grade.givenAt,
      },
      ...prev,
    ]);
    setOpenFor(null);
    toast.success("Jegy beírva");
    startTransition(() => router.refresh());
  }

  async function handleDelete(gradeId: string) {
    if (!confirm("Biztosan törlöd?")) return;
    const res = await fetch(`/api/grades/${gradeId}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Nem sikerült");
      return;
    }
    setGrades((prev) => prev.filter((g) => g.id !== gradeId));
    toast.success("Jegy törölve");
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>Osztály jegyei</CardTitle>
            <CardDescription>
              {students.length} diák · {grades.length} jegy · osztály súlyozott átlag:{" "}
              <strong className="text-foreground">
                {classAvg !== null ? classAvg.toFixed(2) : "—"}
              </strong>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {students.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Az osztálynak nincs diákja.</p>
          ) : (
            students.map((s) => {
              const studentGrades = grades.filter((g) => g.studentId === s.id);
              const avg = calculateWeightedAverage(studentGrades);
              return (
                <div key={s.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <div className="font-semibold">{s.name}</div>
                      <div className="text-xs text-muted-foreground">{s.email}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-2xl font-bold tabular-nums">
                          {avg !== null ? avg.toFixed(2) : "—"}
                        </div>
                        <div className="text-xs text-muted-foreground">átlag</div>
                      </div>
                      <Dialog
                        open={openFor === s.id}
                        onOpenChange={(o) => setOpenFor(o ? s.id : null)}
                      >
                        <DialogTrigger asChild>
                          <Button size="sm">
                            <Plus className="h-4 w-4 mr-1" /> Új jegy
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Új jegy: {s.name}</DialogTitle>
                            <DialogDescription>
                              A súlyt automatikusan a típus határozza meg, de felülírható.
                            </DialogDescription>
                          </DialogHeader>
                          <form
                            action={handleAddGrade}
                            className="space-y-3"
                          >
                            <input type="hidden" name="studentId" value={s.id} />
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <Label htmlFor={`value-${s.id}`}>Jegy (1-5)</Label>
                                <Input
                                  id={`value-${s.id}`}
                                  name="value"
                                  type="number"
                                  min={1}
                                  max={5}
                                  defaultValue={5}
                                  required
                                />
                              </div>
                              <div className="space-y-1">
                                <Label htmlFor={`type-${s.id}`}>Típus</Label>
                                <select
                                  id={`type-${s.id}`}
                                  name="type"
                                  defaultValue="ORAL"
                                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                >
                                  {GRADE_TYPES.map((t) => (
                                    <option key={t} value={t}>
                                      {GRADE_TYPE_LABEL[t]}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor={`weight-${s.id}`}>Súly (üres = default)</Label>
                              <Input
                                id={`weight-${s.id}`}
                                name="weight"
                                type="number"
                                min={1}
                                max={10}
                                placeholder="auto"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor={`comment-${s.id}`}>Megjegyzés</Label>
                              <Input id={`comment-${s.id}`} name="comment" />
                            </div>
                            <DialogFooter>
                              <Button type="submit" disabled={isPending}>
                                Beírás
                              </Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>

                  {studentGrades.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t">
                      {studentGrades.map((g) => (
                        <div
                          key={g.id}
                          className="flex items-center gap-2 bg-muted/50 rounded px-2 py-1"
                        >
                          <Badge variant="secondary" className="text-xs">
                            {GRADE_TYPE_LABEL[g.type]}
                          </Badge>
                          <span
                            className={`inline-flex h-6 w-6 items-center justify-center rounded-full font-semibold text-xs ${gradeColor[g.value]}`}
                          >
                            {g.value}
                          </span>
                          <span className="text-xs text-muted-foreground">{g.weight}×</span>
                          {g.comment && (
                            <span className="text-xs text-muted-foreground italic">
                              "{g.comment}"
                            </span>
                          )}
                          <button
                            onClick={() => handleDelete(g.id)}
                            className="text-muted-foreground hover:text-destructive ml-1"
                            aria-label="Törlés"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
