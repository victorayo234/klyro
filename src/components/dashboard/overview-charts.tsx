"use client";

import * as React from "react";
import Link from "next/link";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { TrendingUp, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

interface ChartDataPoint {
  date: string;
  revenue: number;
  expenses: number;
  profit: number;
}

interface OverviewChartsProps {
  salesData?: Array<{
    sale_date: string;
    total_amount: number;
  }>;
  expensesData?: Array<{
    expense_date: string;
    amount: number;
  }>;
  currency?: string;
}

export function SalesTrendChart({
  salesData = [],
  expensesData = [],
  currency = "USD",
}: OverviewChartsProps) {
  const [timeRange, setTimeRange] = React.useState<"7d" | "30d" | "90d">("30d");

  // Aggregate real data by date intervals
  const chartData = React.useMemo(() => {
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
    const now = new Date();
    const points: Record<string, ChartDataPoint> = {};

    // Initialize buckets
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const key = d.toLocaleDateString("en-US", {
        month: days > 7 ? "short" : undefined,
        day: "numeric",
        weekday: days <= 7 ? "short" : undefined,
      });
      points[key] = { date: key, revenue: 0, expenses: 0, profit: 0 };
    }

    // Accumulate real sales
    salesData.forEach((s) => {
      const sDate = new Date(s.sale_date);
      const diffDays = Math.floor((now.getTime() - sDate.getTime()) / (1000 * 3600 * 24));
      if (diffDays >= 0 && diffDays < days) {
        const key = sDate.toLocaleDateString("en-US", {
          month: days > 7 ? "short" : undefined,
          day: "numeric",
          weekday: days <= 7 ? "short" : undefined,
        });
        if (points[key]) {
          points[key].revenue += Number(s.total_amount) || 0;
        }
      }
    });

    // Accumulate real expenses
    expensesData.forEach((e) => {
      const eDate = new Date(e.expense_date);
      const diffDays = Math.floor((now.getTime() - eDate.getTime()) / (1000 * 3600 * 24));
      if (diffDays >= 0 && diffDays < days) {
        const key = eDate.toLocaleDateString("en-US", {
          month: days > 7 ? "short" : undefined,
          day: "numeric",
          weekday: days <= 7 ? "short" : undefined,
        });
        if (points[key]) {
          points[key].expenses += Number(e.amount) || 0;
        }
      }
    });

    // Calculate profit
    Object.values(points).forEach((p) => {
      p.profit = p.revenue - p.expenses;
    });

    return Object.values(points);
  }, [salesData, expensesData, timeRange]);

  const hasSales = salesData.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 font-display">
            Sales & Revenue Trajectory
          </h4>
          <p className="text-xs text-slate-500">Gross revenue performance over time</p>
        </div>
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-lg text-xs font-medium self-start">
          <button
            onClick={() => setTimeRange("7d")}
            className={`px-2.5 py-1 rounded-md transition-all ${
              timeRange === "7d"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => setTimeRange("30d")}
            className={`px-2.5 py-1 rounded-md transition-all ${
              timeRange === "30d"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            30 Days
          </button>
          <button
            onClick={() => setTimeRange("90d")}
            className={`px-2.5 py-1 rounded-md transition-all ${
              timeRange === "90d"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            90 Days
          </button>
        </div>
      </div>

      {!hasSales ? (
        <div className="h-60 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-6 text-center">
          <TrendingUp className="w-8 h-8 text-slate-300 dark:text-slate-700 mb-2" />
          <h5 className="text-xs font-semibold text-slate-700 dark:text-slate-300">No sales recorded yet</h5>
          <p className="text-[11px] text-slate-400 max-w-xs mt-0.5 mb-3">
            Record your first customer sale or completed invoice to populate live revenue trajectory telemetry.
          </p>
          <Link href="/dashboard/sales?action=new-sale">
            <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8">
              <PlusCircle className="w-3.5 h-3.5" />
              Record First Sale
            </Button>
          </Link>
        </div>
      ) : (
        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.2} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "#94a3b8" }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                tickFormatter={(val) => `$${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderRadius: "8px",
                  border: "1px solid #334155",
                  color: "#ffffff",
                  fontSize: "12px",
                }}
                formatter={(val: unknown) => [formatCurrency(Number(val) || 0, currency), "Revenue"]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#4f46e5"
                strokeWidth={2.5}
                fill="url(#revenueGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export function RevenueVsExpensesChart({
  salesData = [],
  expensesData = [],
  currency = "USD",
}: OverviewChartsProps) {
  // Aggregate real data by weekly buckets
  const chartData = React.useMemo(() => {
    const buckets = [
      { name: "Week 1", revenue: 0, expenses: 0, profit: 0 },
      { name: "Week 2", revenue: 0, expenses: 0, profit: 0 },
      { name: "Week 3", revenue: 0, expenses: 0, profit: 0 },
      { name: "Week 4", revenue: 0, expenses: 0, profit: 0 },
    ];

    const now = new Date();
    salesData.forEach((s) => {
      const diffDays = Math.floor((now.getTime() - new Date(s.sale_date).getTime()) / (1000 * 3600 * 24));
      const weekIdx = Math.min(3, Math.floor(diffDays / 7));
      if (weekIdx >= 0 && weekIdx <= 3) {
        buckets[3 - weekIdx].revenue += Number(s.total_amount) || 0;
      }
    });

    expensesData.forEach((e) => {
      const diffDays = Math.floor((now.getTime() - new Date(e.expense_date).getTime()) / (1000 * 3600 * 24));
      const weekIdx = Math.min(3, Math.floor(diffDays / 7));
      if (weekIdx >= 0 && weekIdx <= 3) {
        buckets[3 - weekIdx].expenses += Number(e.amount) || 0;
      }
    });

    buckets.forEach((b) => {
      b.profit = b.revenue - b.expenses;
    });

    return buckets;
  }, [salesData, expensesData]);

  const hasData = salesData.length > 0 || expensesData.length > 0;

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 font-display">
          Revenue vs. Operating Expenses
        </h4>
        <p className="text-xs text-slate-500">Comparative 4-week margin breakdown</p>
      </div>

      {!hasData ? (
        <div className="h-60 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-6 text-center">
          <h5 className="text-xs font-semibold text-slate-700 dark:text-slate-300">No operational telemetry yet</h5>
          <p className="text-[11px] text-slate-400 max-w-xs mt-0.5">
            Log sales or record expenses to visualize margin performance and operating costs.
          </p>
        </div>
      ) : (
        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.2} />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "#94a3b8" }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                tickFormatter={(val) => `$${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderRadius: "8px",
                  border: "1px solid #334155",
                  color: "#ffffff",
                  fontSize: "12px",
                }}
                formatter={(val: unknown) => [formatCurrency(Number(val) || 0, currency)]}
              />
              <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} iconType="circle" />
              <Bar dataKey="revenue" name="Revenue" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" name="Expenses" fill="#f87171" radius={[4, 4, 0, 0]} />
              <Bar dataKey="profit" name="Net Profit" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
