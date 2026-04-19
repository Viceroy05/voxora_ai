import Link from "next/link";

import { cn } from "@/lib/utils";

type SiteLogoProps = {
  className?: string;
  textClassName?: string;
};

export function SiteLogo({ className, textClassName }: SiteLogoProps) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-3", className)}>
      <span className="relative flex size-10 items-center justify-center rounded-2xl border border-white/12 bg-white/6">
        <span className="absolute inset-[6px] rounded-xl bg-gradient-to-br from-cyan-300 via-blue-400 to-blue-600 blur-[10px] opacity-75" />
        <span className="relative flex size-7 items-center justify-center rounded-[0.9rem] bg-slate-950/90 text-sm font-bold text-white">
          V
        </span>
      </span>
      <span className={cn("font-heading text-lg font-semibold tracking-tight text-white", textClassName)}>
        Voxora AI
      </span>
    </Link>
  );
}
