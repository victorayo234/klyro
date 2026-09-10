import * as React from "react";
import { Button } from "./button";

export interface EmptyStateProps {
  type?: "customers" | "inventory" | "invoices" | "sales" | "activity" | "search";
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  children?: React.ReactNode;
}

export function EmptyState({
  type = "search",
  title,
  description,
  actionLabel,
  onAction,
  children,
}: EmptyStateProps) {
  // Custom bespoke SVG line-art illustrations
  const renderIllustration = () => {
    switch (type) {
      case "customers":
        return (
          <svg
            className="w-20 h-20 text-blue-500/70 dark:text-blue-400/60 stroke-[1.2]"
            viewBox="0 0 80 80"
            fill="none"
            stroke="currentColor"
          >
            <circle cx="40" cy="28" r="12" strokeDasharray="3 3" />
            <path d="M22 60C22 48 30 44 40 44C50 44 58 48 58 60" />
            <circle cx="20" cy="36" r="8" strokeOpacity="0.5" />
            <path d="M8 58C8 50 14 48 20 48" strokeOpacity="0.5" />
            <circle cx="60" cy="36" r="8" strokeOpacity="0.5" />
            <path d="M72 58C72 50 66 48 60 48" strokeOpacity="0.5" />
            <circle cx="40" cy="28" r="4" fill="currentColor" fillOpacity="0.2" />
          </svg>
        );
      case "inventory":
        return (
          <svg
            className="w-20 h-20 text-amber-500/70 dark:text-amber-400/60 stroke-[1.2]"
            viewBox="0 0 80 80"
            fill="none"
            stroke="currentColor"
          >
            <path d="M40 14L66 28V52L40 66L14 52V28L40 14Z" strokeDasharray="4 2" />
            <path d="M14 28L40 42L66 28" />
            <path d="M40 42V66" />
            <path d="M27 21L53 35" strokeOpacity="0.5" />
            <circle cx="40" cy="42" r="3" fill="currentColor" fillOpacity="0.3" />
          </svg>
        );
      case "invoices":
        return (
          <svg
            className="w-20 h-20 text-emerald-500/70 dark:text-emerald-400/60 stroke-[1.2]"
            viewBox="0 0 80 80"
            fill="none"
            stroke="currentColor"
          >
            <rect x="22" y="14" width="36" height="52" rx="3" strokeDasharray="4 2" />
            <path d="M30 26H50" strokeWidth="1.5" />
            <path d="M30 34H44" strokeOpacity="0.6" />
            <path d="M30 42H48" strokeOpacity="0.6" />
            <path d="M30 52H38" strokeWidth="2" stroke="currentColor" />
            <path d="M46 52H50" strokeWidth="2" stroke="currentColor" />
          </svg>
        );
      case "sales":
        return (
          <svg
            className="w-20 h-20 text-indigo-500/70 dark:text-indigo-400/60 stroke-[1.2]"
            viewBox="0 0 80 80"
            fill="none"
            stroke="currentColor"
          >
            <path d="M14 62H66" strokeWidth="1.5" />
            <path d="M20 54L34 40L46 48L62 26" strokeWidth="1.5" />
            <polyline points="54 26 62 26 62 34" strokeWidth="1.5" />
            <circle cx="34" cy="40" r="3" fill="currentColor" fillOpacity="0.3" />
            <circle cx="46" cy="48" r="3" fill="currentColor" fillOpacity="0.3" />
            <circle cx="62" cy="26" r="3" fill="currentColor" fillOpacity="0.3" />
          </svg>
        );
      default:
        return (
          <svg
            className="w-20 h-20 text-slate-400 dark:text-slate-500 stroke-[1.2]"
            viewBox="0 0 80 80"
            fill="none"
            stroke="currentColor"
          >
            <circle cx="36" cy="36" r="18" strokeDasharray="3 3" />
            <line x1="50" y1="50" x2="66" y2="66" strokeWidth="2" strokeLinecap="round" />
            <path d="M30 36H42" strokeOpacity="0.5" />
          </svg>
        );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
      <div className="mb-4 flex items-center justify-center">{renderIllustration()}</div>
      <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100 font-display">
        {title}
      </h4>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <div className="mt-5">
          <Button onClick={onAction} size="sm">
            {actionLabel}
          </Button>
        </div>
      )}
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}
