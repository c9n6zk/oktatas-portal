import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: { box: "size-7 text-sm rounded-md", text: "text-sm" },
  md: { box: "size-8 text-base rounded-lg", text: "text-base" },
  lg: { box: "size-12 text-xl rounded-xl", text: "text-xl" },
};

export function Logo({ className, showText = true, size = "md" }: LogoProps) {
  const s = sizes[size];
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "flex items-center justify-center font-bold text-white shadow-sm",
          "bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500",
          s.box,
        )}
        aria-hidden
      >
        P
      </div>
      {showText && <span className={cn("font-bold tracking-tight", s.text)}>Padtárs</span>}
    </div>
  );
}
