import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

type StatCardProps = {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  className?: string;
};

export function StatCard({ label, value, hint, className }: StatCardProps) {
  return (
    <Card className={cn("flex h-full min-h-[6rem] flex-col justify-between p-4", className)}>
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-2xl font-bold leading-none tabular-nums">{value}</div>
      {hint && (
        <div className="mt-2 text-xs leading-tight text-muted-foreground">{hint}</div>
      )}
    </Card>
  );
}
