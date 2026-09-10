"use client";

import * as React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Circle,
  Users,
  Package,
  FileText,
  UserPlus,
  X,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ChecklistProps {
  customerCount: number;
  productCount: number;
  invoiceCount: number;
  staffCount: number;
  productsLabel?: string;
  customersLabel?: string;
}

export function OnboardingChecklist({
  customerCount,
  productCount,
  invoiceCount,
  staffCount,
  productsLabel = "Products",
  customersLabel = "Customers",
}: ChecklistProps) {
  const [isDismissed, setIsDismissed] = React.useState(false);

  // Check localStorage for dismissal
  React.useEffect(() => {
    const dismissed = localStorage.getItem("klyro_checklist_dismissed");
    if (dismissed === "true") {
      setIsDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem("klyro_checklist_dismissed", "true");
  };

  const tasks = [
    {
      id: "customer",
      title: `Add your first ${customersLabel.toLowerCase().replace(/s$/, "")}`,
      description: "Import via CSV or enter manually in CRM directory",
      completed: customerCount > 0,
      href: "/dashboard/customers",
      icon: Users,
    },
    {
      id: "product",
      title: `Add your first ${productsLabel.toLowerCase().replace(/s$/, "")}`,
      description: "Define SKUs, selling prices, and reorder alerts",
      completed: productCount > 0,
      href: "/dashboard/inventory",
      icon: Package,
    },
    {
      id: "invoice",
      title: "Create your first invoice or sale",
      description: "Generate professional PDF invoices with tax breakdown",
      completed: invoiceCount > 0,
      href: "/dashboard/invoices/new",
      icon: FileText,
    },
    {
      id: "staff",
      title: "Invite a team member",
      description: "Assign manager or staff roles with granular permissions",
      completed: staffCount > 1,
      href: "/dashboard/staff",
      icon: UserPlus,
    },
  ];

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent = Math.round((completedCount / tasks.length) * 100);

  // If completely finished or user dismissed, don't show to prevent nagging chrome
  if (isDismissed || completedCount === tasks.length) {
    return null;
  }

  return (
    <Card className="p-5 border-indigo-200/80 dark:border-indigo-900/60 bg-gradient-to-r from-indigo-50/50 via-white to-indigo-50/30 dark:from-indigo-950/20 dark:via-slate-900 dark:to-indigo-950/10 shadow-xs relative">
      <div className="flex items-start justify-between gap-4 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold font-display text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Getting Started with Klyro
              <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-100/80 dark:bg-indigo-900/50 px-2 py-0.5 rounded-full">
                {completedCount} of {tasks.length} done ({progressPercent}%)
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Complete these initial operational steps to unlock complete business analytics.
            </p>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded-md transition-colors"
          title="Dismiss checklist"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden mb-4">
        <div
          className="h-full bg-indigo-600 rounded-full transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Checklist Tasks Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {tasks.map((task) => {
          const Icon = task.icon;
          return (
            <Link
              key={task.id}
              href={task.href}
              className={cn(
                "p-3 rounded-xl border flex flex-col justify-between transition-all group",
                task.completed
                  ? "bg-slate-50/50 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 opacity-75"
                  : "bg-white dark:bg-slate-900 border-indigo-100 dark:border-indigo-900/40 hover:border-indigo-400 dark:hover:border-indigo-600 shadow-xs"
              )}
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Icon
                    className={cn(
                      "w-4 h-4",
                      task.completed ? "text-emerald-500" : "text-indigo-600 dark:text-indigo-400"
                    )}
                  />
                  {task.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                  )}
                </div>
                <h4
                  className={cn(
                    "text-xs font-semibold mt-1 font-display",
                    task.completed
                      ? "line-through text-slate-400"
                      : "text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 transition-colors"
                  )}
                >
                  {task.title}
                </h4>
                <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                  {task.description}
                </p>
              </div>

              {!task.completed && (
                <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5 mt-2 group-hover:translate-x-0.5 transition-transform">
                  Start task <ArrowRight className="w-2.5 h-2.5" />
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
