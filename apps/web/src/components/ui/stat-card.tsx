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
    <Card
      className={cn(
        "flex h-full min-h-[5.5rem] flex-col justify-between p-2.5 sm:min-h-[6rem] sm:p-4",
        className,
      )}
    >
      <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs">
        {label}
      </div>
      <div className="mt-0.5 text-lg font-bold leading-none tabular-nums sm:mt-1 sm:text-2xl">
        {value}
      </div>
      {hint && (
        <div className="mt-1 text-[10px] leading-tight text-muted-foreground sm:mt-2 sm:text-xs">
          {hint}
        </div>
      )}
    </Card>
  );
}
