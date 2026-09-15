import * as React from "react";
import { KlyroGlyph } from "@/components/ui/logo";

export default function DashboardLoading() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-pulse">
      {/* Skeleton Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="space-y-2">
          <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded-md" />
          <div className="h-3.5 w-72 bg-slate-100 dark:bg-slate-900 rounded-md" />
        </div>
        <div className="h-9 w-28 bg-slate-200 dark:bg-slate-800 rounded-lg" />
      </div>

      {/* Skeleton KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-3.5 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800" />
            </div>
            <div className="h-7 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-3 w-20 bg-slate-100 dark:bg-slate-800 rounded" />
          </div>
        ))}
      </div>

      {/* Skeleton Data Table / Area */}
      <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-4 w-40 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-8 w-24 bg-slate-100 dark:bg-slate-800 rounded-lg" />
        </div>
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-10 w-full bg-slate-50 dark:bg-slate-800/50 rounded-lg"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
