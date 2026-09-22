"use client";

import * as React from "react";
import { Target, TrendingUp, DollarSign, Settings2, Check, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { updateBusinessSettings } from "@/lib/actions/settings";

interface GoalTrackerProps {
  currentRevenue: number;
  currentProfit: number;
  initialRevenueTarget?: number;
  initialProfitTarget?: number;
  currency?: string;
  isOwnerOrAdmin?: boolean;
}

export function GoalTracker({
  currentRevenue,
  currentProfit,
  initialRevenueTarget = 10000,
  initialProfitTarget = 4000,
  currency = "USD",
  isOwnerOrAdmin = true,
}: GoalTrackerProps) {
  const [activeGoalTab, setActiveGoalTab] = React.useState<"revenue" | "profit">("revenue");
  const [revenueTarget, setRevenueTarget] = React.useState(initialRevenueTarget);
  const [profitTarget, setProfitTarget] = React.useState(initialProfitTarget);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editRevenueVal, setEditRevenueVal] = React.useState(String(initialRevenueTarget));
  const [editProfitVal, setEditProfitVal] = React.useState(String(initialProfitTarget));
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    setRevenueTarget(initialRevenueTarget);
    setEditRevenueVal(String(initialRevenueTarget));
  }, [initialRevenueTarget]);

  React.useEffect(() => {
    setProfitTarget(initialProfitTarget);
    setEditProfitVal(String(initialProfitTarget));
  }, [initialProfitTarget]);

  const currentVal = activeGoalTab === "revenue" ? currentRevenue : currentProfit;
  const targetVal = activeGoalTab === "revenue" ? revenueTarget : profitTarget;
  const percent = targetVal > 0 ? Math.min(100, Math.round((currentVal / targetVal) * 100)) : 0;
  const remaining = Math.max(0, targetVal - currentVal);

  const handleSave = async () => {
    const revNum = Number(editRevenueVal);
    const profNum = Number(editProfitVal);
    if (isNaN(revNum) || revNum <= 0 || isNaN(profNum) || profNum <= 0) {
      toast.error("Please enter valid targets greater than zero.");
      return;
    }

    setIsSaving(true);
    try {
      await updateBusinessSettings({
        monthly_revenue_target: revNum,
        monthly_profit_target: profNum,
      });
      setRevenueTarget(revNum);
      setProfitTarget(profNum);
      setIsEditing(false);
      toast.success("Operational targets updated");
    } catch {
      toast.error("Failed to update targets");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="p-5 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 font-display">
              Operational Goals
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <button
                type="button"
                onClick={() => setActiveGoalTab("revenue")}
                className={`text-[10px] px-1.5 py-0.5 rounded font-medium transition-colors ${
                  activeGoalTab === "revenue"
                    ? "bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                Revenue
              </button>
              <span className="text-[10px] text-slate-300 dark:text-slate-700">•</span>
              <button
                type="button"
                onClick={() => setActiveGoalTab("profit")}
                className={`text-[10px] px-1.5 py-0.5 rounded font-medium transition-colors ${
                  activeGoalTab === "profit"
                    ? "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                Profit
              </button>
            </div>
          </div>
        </div>

        {isOwnerOrAdmin && !isEditing && (
          <button
            onClick={() => {
              setEditRevenueVal(String(revenueTarget));
              setEditProfitVal(String(profitTarget));
              setIsEditing(true);
            }}
            className="text-slate-400 hover:text-indigo-600 text-[11px] font-medium flex items-center gap-1 transition-colors"
          >
            <Settings2 className="w-3.5 h-3.5" /> Adjust
          </button>
        )}
      </div>

      <div className="my-4 space-y-2">
        {isEditing ? (
          <div className="space-y-2 pt-1">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 font-medium">Revenue Target</label>
                <input
                  type="number"
                  value={editRevenueVal}
                  onChange={(e) => setEditRevenueVal(e.target.value)}
                  className="h-8 w-full px-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold"
                  placeholder="Revenue target"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-medium">Profit Target</label>
                <input
                  type="number"
                  value={editProfitVal}
                  onChange={(e) => setEditProfitVal(e.target.value)}
                  className="h-8 w-full px-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold"
                  placeholder="Profit target"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Button size="sm" onClick={handleSave} isLoading={isSaving} className="h-7 text-xs px-2.5">
                Save Targets
              </Button>
              <button
                onClick={() => setIsEditing(false)}
                className="text-xs text-slate-400 hover:text-slate-600 px-1"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-baseline justify-between">
            <div>
              <h3 className="text-2xl font-bold font-display text-slate-900 dark:text-white">
                {percent}%
              </h3>
              <p className="text-[11px] text-slate-400">
                {formatCurrency(currentVal, currency)} of {formatCurrency(targetVal, currency)}{" "}
                {activeGoalTab === "revenue" ? "rev" : "profit"}
              </p>
            </div>
            <div className="text-right">
              <span
                className={`text-xs font-semibold ${
                  activeGoalTab === "revenue"
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {remaining === 0 ? "Target Reached! 🎉" : `${formatCurrency(remaining, currency)} to go`}
              </span>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              percent >= 100
                ? "bg-emerald-500"
                : percent >= 50
                ? activeGoalTab === "revenue"
                  ? "bg-indigo-600"
                  : "bg-emerald-600"
                : "bg-amber-500"
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
        <span>
          Targets: <strong className="text-slate-700 dark:text-slate-300">{formatCurrency(revenueTarget, currency)}</strong> rev •{" "}
          <strong className="text-emerald-600 dark:text-emerald-400">{formatCurrency(profitTarget, currency)}</strong> profit
        </span>
        <span className="inline-flex items-center gap-0.5 text-indigo-600 dark:text-indigo-400 font-medium">
          Telemetry active <ArrowUpRight className="w-3 h-3" />
        </span>
      </div>
    </Card>
  );
}
