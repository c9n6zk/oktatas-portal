import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: { box: "size-10 rounded-lg", text: "text-lg", img: 40, gap: "gap-2" },
  md: { box: "size-20 rounded-2xl", text: "text-3xl", img: 80, gap: "gap-3" },
  lg: { box: "size-40 rounded-3xl", text: "text-5xl", img: 160, gap: "gap-5" },
};

export function Logo({ className, showText = true, size = "md" }: LogoProps) {
  const s = sizes[size];
  return (
    <div className={cn("flex items-center", s.gap, className)}>
      <div
        className={cn(
          "relative overflow-hidden flex items-center justify-center bg-white shadow-sm ring-1 ring-violet-200 dark:ring-violet-900/40",
          s.box,
        )}
      >
        <Image
          src="/padtars-logo.png"
          alt="Padtárs logó"
          width={s.img}
          height={s.img}
          priority
          className="object-contain scale-[1.7] translate-y-[2%]"
        />
      </div>
      {showText && <span className={cn("font-bold tracking-tight", s.text)}>Padtárs</span>}
    </div>
  );
}
