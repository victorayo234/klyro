import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  iconOnly?: boolean;
  className?: string;
  href?: string;
  variant?: "default" | "light" | "white";
}

const sizeMap = {
  xs: { icon: 18, text: "text-sm", gap: "gap-1.5" },
  sm: { icon: 24, text: "text-base", gap: "gap-2" },
  md: { icon: 30, text: "text-lg", gap: "gap-2.5" },
  lg: { icon: 38, text: "text-2xl", gap: "gap-3" },
  xl: { icon: 48, text: "text-3xl", gap: "gap-3.5" },
};

/**
 * Geometric Vector Glyph:
 * Three interlocking ascending geometric prisms forming a converging chevron,
 * symbolizing operational consolidation, upward financial momentum, and telemetry precision.
 */
export function KlyroGlyph({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 transition-transform duration-200 hover:scale-105", className)}
      aria-label="Klyro Logo Icon"
    >
      <defs>
        <linearGradient id="klyro-grad-primary" x1="4" y1="4" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#4338ca" />
        </linearGradient>
        <linearGradient id="klyro-grad-accent" x1="12" y1="6" x2="30" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
        <linearGradient id="klyro-grad-ambient" x1="8" y1="16" x2="26" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#312e81" />
        </linearGradient>
      </defs>

      {/* Base Foundation Prism */}
      <path
        d="M 6 27 L 16 9 L 21 17 L 12 31 Z"
        fill="url(#klyro-grad-primary)"
        fillOpacity="0.95"
      />

      {/* Ascending Converging Apex Blade (Growth Arrow) */}
      <path
        d="M 16 9 L 26 5 L 30 14 L 20 18 Z"
        fill="url(#klyro-grad-accent)"
      />

      {/* Interlocking Consolidation Plane */}
      <path
        d="M 18 19 L 29 15 L 25 30 L 14 30 Z"
        fill="url(#klyro-grad-ambient)"
        fillOpacity="0.85"
      />

      {/* Micro Focal Core (Precision Indicator) */}
      <circle cx="20" cy="18" r="1.5" fill="#ffffff" fillOpacity="0.9" />
    </svg>
  );
}

export function KlyroLogo({
  size = "md",
  iconOnly = false,
  className,
  href,
  variant = "default",
}: LogoProps) {
  const config = sizeMap[size];

  const content = (
    <span className={cn("inline-flex items-center select-none group", config.gap, className)}>
      <KlyroGlyph size={config.icon} />
      {!iconOnly && (
        <span
          className={cn(
            "font-display font-extrabold tracking-tight transition-colors leading-none",
            config.text,
            variant === "white"
              ? "text-white"
              : "text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
          )}
        >
          Klyro
        </span>
      )}
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
}
