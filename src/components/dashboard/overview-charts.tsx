"use client";

import * as React from "react";
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

const data7d = [
  { date: "Mon", revenue: 2400, expenses: 1100, profit: 1300 },
  { date: "Tue", revenue: 3200, expenses: 1400, profit: 1800 },
  { date: "Wed", revenue: 4100, expenses: 1800, profit: 2300 },
  { date: "Thu", revenue: 3800, expenses: 1200, profit: 2600 },
  { date: "Fri", revenue: 5200, expenses: 2100, profit: 3100 },
  { date: "Sat", revenue: 6400, expenses: 1900, profit: 4500 },
  { date: "Sun", revenue: 4900, expenses: 1600, profit: 3300 },
];

const data30d = [
  { date: "Week 1", revenue: 14200, expenses: 6800, profit: 7400 },
  { date: "Week 2", revenue: 18900, expenses: 8100, profit: 10800 },
  { date: "Week 3", revenue: 22400, expenses: 9500, profit: 12900 },
  { date: "Week 4", revenue: 26100, expenses: 10400, profit: 15700 },
];

const data90d = [
  { date: "Month 1", revenue: 48000, expenses: 22000, profit: 26000 },
  { date: "Month 2", revenue: 64000, expenses: 27000, profit: 37000 },
  { date: "Month 3", revenue: 81600, expenses: 34800, profit: 46800 },
];

export function SalesTrendChart() {
  const [timeRange, setTimeRange] = React.useState<"7d" | "30d" | "90d">("30d");

  const chartData = timeRange === "7d" ? data7d : timeRange === "30d" ? data30d : data90d;

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
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => setTimeRange("30d")}
            className={`px-2.5 py-1 rounded-md transition-all ${
              timeRange === "30d"
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            30 Days
          </button>
          <button
            onClick={() => setTimeRange("90d")}
            className={`px-2.5 py-1 rounded-md transition-all ${
              timeRange === "90d"
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            90 Days
          </button>
        </div>
      </div>

      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
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
                border: "none",
                color: "#ffffff",
                fontSize: "12px",
              }}
              formatter={(val: unknown) => [`$${Number(val).toLocaleString()}`, "Revenue"]}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#2563eb"
              strokeWidth={2.5}
              fill="url(#revenueGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function RevenueVsExpensesChart() {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 font-display">
          Revenue vs. Operating Expenses
        </h4>
        <p className="text-xs text-slate-500">Comparative monthly margin breakdown</p>
      </div>

      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data30d} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
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
                border: "none",
                color: "#ffffff",
                fontSize: "12px",
              }}
              formatter={(val: unknown) => [`$${Number(val).toLocaleString()}`]}
            />
            <Legend
              wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
              iconType="circle"
            />
            <Bar dataKey="revenue" name="Revenue" fill="#2563eb" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expenses" name="Expenses" fill="#f87171" radius={[4, 4, 0, 0]} />
            <Bar dataKey="profit" name="Net Profit" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
