"use client";

import * as React from "react";
import Papa from "papaparse";
import { toast } from "sonner";
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  PieChart as PieIcon,
  Award,
  Users,
  Package,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

const monthlyMarginData = [
  { month: "Jan", revenue: 42000, cogs: 18000, expenses: 8500, margin: 36.9 },
  { month: "Feb", revenue: 51000, cogs: 21500, expenses: 9200, margin: 39.8 },
  { month: "Mar", revenue: 63000, cogs: 26000, expenses: 10400, margin: 42.2 },
  { month: "Apr", revenue: 58000, cogs: 24000, expenses: 9800, margin: 41.7 },
  { month: "May", revenue: 74000, cogs: 30000, expenses: 11200, margin: 44.3 },
  { month: "Jun", revenue: 89000, cogs: 35000, expenses: 12500, margin: 46.6 },
];

const categoryRevenueData = [
  { name: "Office Furniture", revenue: 48500 },
  { name: "Hardware & Tech", revenue: 32400 },
  { name: "Acoustics & Partition", revenue: 14800 },
  { name: "Lighting & Power", revenue: 9200 },
];

const expenseBreakdownData = [
  { name: "Software & SaaS", value: 3800, color: "#3b82f6" },
  { name: "Logistics & Freight", value: 5200, color: "#f59e0b" },
  { name: "Office & Facilities", value: 7400, color: "#10b981" },
  { name: "Marketing & Ads", value: 4900, color: "#8b5cf6" },
  { name: "Contractors", value: 6100, color: "#ef4444" },
];

const topProducts = [
  { name: "Ergonomic Task Chair Alpha", units: 48, revenue: 13872 },
  { name: "Smart Motorized Standing Desk", units: 24, revenue: 13176 },
  { name: "USB-C Dual 4K Docking Station", units: 52, revenue: 7748 },
  { name: "Wireless Noise Cancelling Headset", units: 36, revenue: 4284 },
];

const topCustomers = [
  { name: "Apex Consulting LLC", orders: 12, spend: 24500 },
  { name: "BioLab Diagnostics", orders: 8, spend: 14200 },
  { name: "Solarium Studios", orders: 6, spend: 6850 },
  { name: "Kinetics Fitness Co", orders: 3, spend: 3400 },
];

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = React.useState<"month" | "quarter" | "year">("quarter");

  const handleExportSummary = () => {
    const summaryData = monthlyMarginData.map((m) => ({
      Month: m.month,
      GrossRevenue: m.revenue,
      COGS: m.cogs,
      OperatingExpenses: m.expenses,
      NetMarginPercent: `${m.margin}%`,
    }));

    const csv = Papa.unparse(summaryData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `klyro-financial-analytics-${dateRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Financial analytics summary exported");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight font-display text-slate-900 dark:text-slate-100">
            Analytics & Margin Intelligence
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Evaluate net margins, product profitability, and expense distributions
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Date range picker */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-0.5 rounded-lg text-xs font-medium">
            <button
              onClick={() => setDateRange("month")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                dateRange === "month"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setDateRange("quarter")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                dateRange === "quarter"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Quarter
            </button>
            <button
              onClick={() => setDateRange("year")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                dateRange === "year"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Trailing 12M
            </button>
          </div>

          <Button variant="outline" size="sm" onClick={handleExportSummary} className="gap-1.5">
            <Download className="w-3.5 h-3.5" />
            Export Summary
          </Button>
        </div>
      </div>

      {/* Primary Chart: Profit Margin Trajectory Over Time */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-sm font-semibold font-display text-slate-900 dark:text-slate-100">
              Profit Margin Evolution (%)
            </h3>
            <p className="text-xs text-slate-500">
              Net operating margin percentage after deducting COGS and overheads
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800 self-start">
            +9.7% Margin Growth
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyMarginData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} unit="%" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderRadius: "8px",
                  border: "none",
                  color: "#ffffff",
                  fontSize: "12px",
                }}
                formatter={(val: any) => [`${val}%`, "Net Margin"]}
              />
              <Line
                type="monotone"
                dataKey="margin"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 4, fill: "#10b981" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Row 2: Category Revenue Breakdown & Expense Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Revenue Bar Chart (Span 7) */}
        <Card className="lg:col-span-7 p-6">
          <div className="mb-4">
            <h3 className="text-sm font-semibold font-display text-slate-900 dark:text-slate-100">
              Revenue by Product Category
            </h3>
            <p className="text-xs text-slate-500">Total volume billed per department</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryRevenueData}
                layout="vertical"
                margin={{ top: 10, right: 10, left: 30, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" strokeOpacity={0.5} />
                <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={(v) => `$${v / 1000}k`} />
                <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderRadius: "8px",
                    border: "none",
                    color: "#ffffff",
                    fontSize: "12px",
                  }}
                  formatter={(val: any) => [`$${Number(val).toLocaleString()}`, "Revenue"]}
                />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Expense Donut Chart (Span 5) */}
        <Card className="lg:col-span-5 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold font-display text-slate-900 dark:text-slate-100">
              Operating Expense Distribution
            </h3>
            <p className="text-xs text-slate-500">Breakdown of operational spend</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseBreakdownData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {expenseBreakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderRadius: "8px",
                    border: "none",
                    color: "#ffffff",
                    fontSize: "12px",
                  }}
                  formatter={(val: any) => [`$${Number(val).toLocaleString()}`, "Amount"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {expenseBreakdownData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-500 truncate">{item.name}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Row 3: Leaderboards (Top Products & Top Customers) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-blue-500" />
              <h3 className="text-sm font-semibold font-display text-slate-900 dark:text-slate-100">
                Top Performing Products
              </h3>
            </div>
            <span className="text-xs text-slate-400">By Gross Revenue</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
            {topProducts.map((prod, index) => (
              <div key={prod.name} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-5 font-bold font-mono text-slate-400">0{index + 1}</span>
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                      {prod.name}
                    </span>
                    <span className="text-slate-400">{prod.units} units sold</span>
                  </div>
                </div>
                <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">
                  {formatCurrency(prod.revenue)}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Customers */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-semibold font-display text-slate-900 dark:text-slate-100">
                Top Client Accounts (LTV)
              </h3>
            </div>
            <span className="text-xs text-slate-400">By Billed Volume</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
            {topCustomers.map((cust, index) => (
              <div key={cust.name} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-5 font-bold font-mono text-slate-400">0{index + 1}</span>
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                      {cust.name}
                    </span>
                    <span className="text-slate-400">{cust.orders} fulfilled invoices</span>
                  </div>
                </div>
                <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">
                  {formatCurrency(cust.spend)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
