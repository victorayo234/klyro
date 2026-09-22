import * as React from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, ShieldCheck, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface HealthSnapshotProps {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  lowStockCount: number;
  overdueInvoicesCount: number;
  overdueInvoicesTotal: number;
  revenueTarget?: number;
  profitTarget?: number;
  currency?: string;
  terminology: {
    productsLabel: string;
    customersLabel: string;
  };
}

export function BusinessHealthSnapshot({
  totalRevenue,
  totalExpenses,
  netProfit,
  lowStockCount,
  overdueInvoicesCount,
  overdueInvoicesTotal,
  revenueTarget = 10000,
  profitTarget = 4000,
  currency = "USD",
  terminology,
}: HealthSnapshotProps) {
  const targetPercent = revenueTarget > 0 ? Math.round((totalRevenue / revenueTarget) * 100) : 0;
  const profitPercent = profitTarget > 0 ? Math.round((netProfit / profitTarget) * 100) : 0;
  const isProfitable = netProfit >= 0;

  // Synthesize executive health status
  let healthTone: "strong" | "watch" | "action" = "strong";
  if (lowStockCount > 0 || overdueInvoicesCount > 0) healthTone = "watch";
  if (lowStockCount > 3 || overdueInvoicesCount > 2 || !isProfitable) healthTone = "action";

  return (
    <div className="p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
      <div className="flex items-start gap-3">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
            healthTone === "strong"
              ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
              : healthTone === "watch"
              ? "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
              : "bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800"
          }`}
        >
          {healthTone === "strong" ? (
            <ShieldCheck className="w-5 h-5" />
          ) : (
            <AlertTriangle className="w-5 h-5" />
          )}
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-display">
              Executive Health Snapshot
            </span>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                healthTone === "strong"
                  ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300"
                  : healthTone === "watch"
                  ? "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300"
                  : "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300"
              }`}
            >
              {healthTone === "strong"
                ? "Optimal Operations"
                : healthTone === "watch"
                ? "Attention Recommended"
                : "Action Needed"}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-normal">
            Gross revenue stands at <strong className="font-semibold text-slate-900 dark:text-white">{formatCurrency(totalRevenue, currency)}</strong> (
            {targetPercent}% of your {formatCurrency(revenueTarget, currency)} target) with net profit at{" "}
            <strong className={`font-semibold ${netProfit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
              {formatCurrency(netProfit, currency)}
            </strong>{" "}
            ({profitPercent}% of {formatCurrency(profitTarget, currency)} target).{" "}
            {lowStockCount > 0 ? (
              <>
                <span className="text-amber-600 dark:text-amber-400 font-semibold">
                  {lowStockCount} {terminology.productsLabel.toLowerCase()}
                </span>{" "}
                are below safe threshold levels.{" "}
              </>
            ) : (
              `All ${terminology.productsLabel.toLowerCase()} are in stock. `
            )}
            {overdueInvoicesCount > 0 ? (
              <>
                <span className="text-red-600 dark:text-red-400 font-semibold">
                  {overdueInvoicesCount} invoice{overdueInvoicesCount > 1 ? "s" : ""}
                </span>{" "}
                ({formatCurrency(overdueInvoicesTotal, currency)}) are overdue for collection.
              </>
            ) : (
              "All invoices are currently in good standing."
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end md:self-center pt-2 md:pt-0">
        {lowStockCount > 0 && (
          <Link
            href="/dashboard/inventory?filter=low-stock"
            className="text-xs px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50/60 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 font-medium transition-colors inline-flex items-center gap-1"
          >
            Review Restocks <ArrowRight className="w-3 h-3" />
          </Link>
        )}
        {overdueInvoicesCount > 0 && (
          <Link
            href="/dashboard/invoices?filter=overdue"
            className="text-xs px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-800 bg-red-50/60 dark:bg-red-950/40 text-red-700 dark:text-red-300 hover:bg-red-100 font-medium transition-colors inline-flex items-center gap-1"
          >
            Collect Invoices <ArrowRight className="w-3 h-3" />
          </Link>
        )}
      </div>
    </div>
  );
}
