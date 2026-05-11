import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: { box: "size-7 rounded-md", text: "text-sm" },
  md: { box: "size-8 rounded-lg", text: "text-base" },
  lg: { box: "size-14 rounded-xl", text: "text-2xl" },
};

function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <defs>
        <linearGradient id="padtars-bg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#6366f1" />
          <stop offset="0.5" stopColor="#8b5cf6" />
          <stop offset="1" stopColor="#d946ef" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="7" fill="url(#padtars-bg)" />
      <path d="M5 9 Q5 8 6 8 L15 9 L15 24 L6 23 Q5 23 5 22 Z" fill="white" />
      <path d="M27 9 Q27 8 26 8 L17 9 L17 24 L26 23 Q27 23 27 22 Z" fill="white" />
      <text
        x="10"
        y="19"
        fill="#6d28d9"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontWeight="900"
        fontSize="10"
        textAnchor="middle"
      >
        P
      </text>
      <line x1="19" y1="13" x2="25" y2="13" stroke="#6d28d9" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="19" y1="16" x2="25" y2="16" stroke="#6d28d9" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="19" y1="19" x2="24" y2="19" stroke="#6d28d9" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ className, showText = true, size = "md" }: LogoProps) {
  const s = sizes[size];
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <LogoMark className={cn("shadow-sm", s.box)} />
      {showText && <span className={cn("font-bold tracking-tight", s.text)}>Padtárs</span>}
    </div>
  );
}
