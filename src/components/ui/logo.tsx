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

export function KlyroGlyph({
  size = 28,
  className,
  color,
}: {
  size?: number;
  className?: string;
  color?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(
        "shrink-0 transition-transform duration-200 text-indigo-600 dark:text-indigo-400 group-hover:scale-105",
        className
      )}
      style={color ? { color } : undefined}
      aria-label="Klyro Logomark"
    >
      {/* Precision vertical stem */}
      <rect x="5" y="4" width="6.5" height="28" rx="2" fill="currentColor" />

      {/* Ascending diagonal upper blade */}
      <path
        d="M 16.5 19 L 26.2 5.4 C 26.9 4.4 28.3 4.2 29.2 4.9 L 29.7 5.3 C 30.6 6.0 30.7 7.3 30.0 8.2 L 20.8 21.2 Z"
        fill="currentColor"
      />

      {/* Descending diagonal lower blade */}
      <path
        d="M 17.8 17.8 L 28.5 30.8 C 29.3 31.7 29.1 33.1 28.2 33.8 L 27.6 34.3 C 26.7 34.9 25.4 34.7 24.6 33.8 L 15.2 22.4 Z"
        fill="currentColor"
      />
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
      <KlyroGlyph
        size={config.icon}
        className={variant === "white" ? "text-white" : undefined}
      />
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
