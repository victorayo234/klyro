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
  const [revenueTarget, setRevenueTarget] = React.useState(initialRevenueTarget);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editVal, setEditVal] = React.useState(String(initialRevenueTarget));
  const [isSaving, setIsSaving] = React.useState(false);

  const percent = revenueTarget > 0 ? Math.min(100, Math.round((currentRevenue / revenueTarget) * 100)) : 0;
  const remaining = Math.max(0, revenueTarget - currentRevenue);

  const handleSave = async () => {
    const num = Number(editVal);
    if (isNaN(num) || num <= 0) {
      toast.error("Please enter a valid target amount greater than zero.");
      return;
    }

    setIsSaving(true);
    try {
      await updateBusinessSettings({ monthly_revenue_target: num });
      setRevenueTarget(num);
      setIsEditing(false);
      toast.success("Monthly revenue target updated");
    } catch {
      toast.error("Failed to update target");
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
              Monthly Revenue Goal
            </span>
            <p className="text-[11px] text-slate-400">Target vs current run-rate</p>
          </div>
        </div>

        {isOwnerOrAdmin && !isEditing && (
          <button
            onClick={() => {
              setEditVal(String(revenueTarget));
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
          <div className="flex items-center gap-2 pt-1">
            <input
              type="number"
              value={editVal}
              onChange={(e) => setEditVal(e.target.value)}
              className="h-8 w-32 px-2.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold"
              placeholder="e.g. 15000"
            />
            <Button size="sm" onClick={handleSave} isLoading={isSaving} className="h-8 text-xs px-2.5">
              Save
            </Button>
            <button
              onClick={() => setIsEditing(false)}
              className="text-xs text-slate-400 hover:text-slate-600 px-1"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex items-baseline justify-between">
            <div>
              <h3 className="text-2xl font-bold font-display text-slate-900 dark:text-white">
                {percent}%
              </h3>
              <p className="text-[11px] text-slate-400">
                {formatCurrency(currentRevenue, currency)} of {formatCurrency(revenueTarget, currency)}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                {remaining === 0 ? "Goal Reached! 🎉" : `${formatCurrency(remaining, currency)} to go`}
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
                ? "bg-indigo-600"
                : "bg-amber-500"
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
        <span>Current Net Profit: <strong className="text-slate-700 dark:text-slate-300">{formatCurrency(currentProfit, currency)}</strong></span>
        <span className="inline-flex items-center gap-0.5 text-indigo-600 dark:text-indigo-400 font-medium">
          Telemetry active <ArrowUpRight className="w-3 h-3" />
        </span>
      </div>
    </Card>
  );
}
