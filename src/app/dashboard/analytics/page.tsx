"use client";

import * as React from "react";
import { toast } from "sonner";
import { exportToCsv } from "@/lib/export";
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  PieChart as PieIcon,
  Award,
  Users,
  Package,
  PlusCircle,
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
import { getSales, getExpenses } from "@/lib/actions/sales";
import { getProducts } from "@/lib/actions/products";
import { getCustomers } from "@/lib/actions/customers";
import { Sale, Expense, Product, Customer } from "@/types/database";
import Link from "next/link";

const PALETTE = ["#4f46e5", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = React.useState<"month" | "quarter" | "year">("quarter");
  const [sales, setSales] = React.useState<Sale[]>([]);
  const [expenses, setExpenses] = React.useState<Expense[]>([]);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    Promise.all([getSales(), getExpenses(), getProducts(), getCustomers()])
      .then(([s, e, p, c]) => {
        setSales(s);
        setExpenses(e);
        setProducts(p);
        setCustomers(c);
      })
      .catch(() => {
        toast.error("Failed to load analytics data");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Filter data according to dateRange
  const { filteredSales, filteredExpenses } = React.useMemo(() => {
    const days = dateRange === "month" ? 30 : dateRange === "quarter" ? 90 : 365;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    return {
      filteredSales: sales.filter((s) => new Date(s.sale_date) >= cutoff),
      filteredExpenses: expenses.filter((e) => new Date(e.expense_date) >= cutoff),
    };
  }, [sales, expenses, dateRange]);

  // Aggregated totals
  const totalRevenue = filteredSales.reduce((acc, s) => acc + Number(s.total_amount || 0), 0);
  const totalExpenses = filteredExpenses.reduce((acc, e) => acc + Number(e.amount || 0), 0);
  const netProfit = totalRevenue - totalExpenses;
  const netMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : "0.0";

  // Category revenue breakdown from sales items
  const categoryRevenueData = React.useMemo(() => {
    const map: Record<string, number> = {};
    filteredSales.forEach((s) => {
      s.items?.forEach((item) => {
        const cat = item.product?.category || "General";
        map[cat] = (map[cat] || 0) + Number(item.total_price || 0);
      });
    });

    return Object.entries(map).map(([name, revenue]) => ({ name, revenue }));
  }, [filteredSales]);

  // Expense distribution grouped by category
  const expenseBreakdownData = React.useMemo(() => {
    const map: Record<string, number> = {};
    filteredExpenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + Number(e.amount || 0);
    });

    return Object.entries(map).map(([name, value], i) => ({
      name,
      value,
      color: PALETTE[i % PALETTE.length],
    }));
  }, [filteredExpenses]);

  // Top products from sales items
  const topProducts = React.useMemo(() => {
    const map: Record<string, { name: string; units: number; revenue: number }> = {};
    filteredSales.forEach((s) => {
      s.items?.forEach((it) => {
        const name = it.product?.name || (it as unknown as Record<string, string>).description || "Uncategorized Item";
        if (!map[name]) map[name] = { name, units: 0, revenue: 0 };
        map[name].units += Number(it.quantity) || 0;
        map[name].revenue += Number(it.total_price) || 0;
      });
    });

    return Object.values(map)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [filteredSales]);

  // Top customers by total spend
  const topCustomers = React.useMemo(() => {
    return [...customers]
      .sort((a, b) => Number(b.total_spend || 0) - Number(a.total_spend || 0))
      .slice(0, 5);
  }, [customers]);

  // Dynamic CSV Export
  const handleExportSummary = async () => {
    const exportData = [
      {
        Metric: "Gross Revenue",
        Value: totalRevenue,
      },
      {
        Metric: "Operating Expenses",
        Value: totalExpenses,
      },
      {
        Metric: "Net Profit",
        Value: netProfit,
      },
      {
        Metric: "Net Margin",
        Value: `${netMargin}%`,
      },
    ];

    await exportToCsv(exportData, `klyro_analytics_${dateRange}.csv`);
    toast.success("Analytics summary exported to CSV");
  };

  const hasData = sales.length > 0 || expenses.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight font-display text-slate-900 dark:text-slate-100">
            Analytics & Margin Intelligence
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time telemetry across revenue, profit margins, and cost distribution
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Date range picker */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-0.5 rounded-lg text-xs font-medium">
            <button
              onClick={() => setDateRange("month")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                dateRange === "month"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setDateRange("quarter")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                dateRange === "quarter"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              90 Days
            </button>
            <button
              onClick={() => setDateRange("year")}
              className={`px-2.5 py-1 rounded-md transition-all ${
                dateRange === "year"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              12 Months
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportSummary}
            className="gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <span className="text-xs font-medium text-slate-500">Gross Revenue</span>
          <h3 className="text-2xl font-bold font-display text-slate-900 dark:text-white mt-2">
            {formatCurrency(totalRevenue)}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">{filteredSales.length} orders recorded</p>
        </Card>

        <Card className="p-5">
          <span className="text-xs font-medium text-slate-500">Operating Expenses</span>
          <h3 className="text-2xl font-bold font-display text-rose-600 dark:text-rose-400 mt-2">
            {formatCurrency(totalExpenses)}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">{filteredExpenses.length} expense entries</p>
        </Card>

        <Card className="p-5">
          <span className="text-xs font-medium text-slate-500">Net Profit</span>
          <h3
            className={`text-2xl font-bold font-display mt-2 ${
              netProfit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
            }`}
          >
            {formatCurrency(netProfit)}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Revenue minus operational costs</p>
        </Card>

        <Card className="p-5">
          <span className="text-xs font-medium text-slate-500">Profit Margin</span>
          <h3 className="text-2xl font-bold font-display text-indigo-600 dark:text-indigo-400 mt-2">
            {netMargin}%
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Net profit as % of gross</p>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Revenue Chart */}
        <Card className="lg:col-span-7 p-6">
          <div className="mb-4">
            <h3 className="text-sm font-semibold font-display text-slate-900 dark:text-slate-100">
              Revenue by Product Category
            </h3>
            <p className="text-xs text-slate-500">Total volume billed per department</p>
          </div>

          {categoryRevenueData.length === 0 ? (
            <div className="h-64 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center p-6 text-center">
              <Package className="w-8 h-8 text-slate-300 dark:text-slate-700 mb-2" />
              <p className="text-xs text-slate-500">No category sales data recorded in this period.</p>
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryRevenueData}
                  layout="vertical"
                  margin={{ top: 10, right: 10, left: 30, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#94a3b8" strokeOpacity={0.2} />
                  <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={(v) => `$${v >= 1000 ? `${v / 1000}k` : v}`} />
                  <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderRadius: "8px",
                      border: "1px solid #334155",
                      color: "#ffffff",
                      fontSize: "12px",
                    }}
                    formatter={(val: unknown) => [formatCurrency(Number(val) || 0), "Revenue"]}
                  />
                  <Bar dataKey="revenue" fill="#4f46e5" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* Operating Expense Breakdown */}
        <Card className="lg:col-span-5 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold font-display text-slate-900 dark:text-slate-100">
              Operating Expense Distribution
            </h3>
            <p className="text-xs text-slate-500">Breakdown of operational spend</p>
          </div>

          {expenseBreakdownData.length === 0 ? (
            <div className="h-56 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center p-6 text-center my-2">
              <PieIcon className="w-8 h-8 text-slate-300 dark:text-slate-700 mb-2" />
              <p className="text-xs text-slate-500">No expenses recorded for this period.</p>
            </div>
          ) : (
            <>
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
                        border: "1px solid #334155",
                        color: "#ffffff",
                        fontSize: "12px",
                      }}
                      formatter={(val: unknown) => [formatCurrency(Number(val) || 0), "Amount"]}
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
            </>
          )}
        </Card>
      </div>

      {/* Leaderboards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-indigo-500" />
              <h3 className="text-sm font-semibold font-display text-slate-900 dark:text-slate-100">
                Top Performing Products
              </h3>
            </div>
            <span className="text-xs text-slate-400">By Billed Revenue</span>
          </div>

          {topProducts.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No sales activity recorded to compute product rankings.
            </div>
          ) : (
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
          )}
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
            <span className="text-xs text-slate-400">By Cumulative Spend</span>
          </div>

          {topCustomers.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No customer spend data recorded yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
              {topCustomers.map((cust, index) => (
                <div key={cust.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-5 font-bold font-mono text-slate-400">0{index + 1}</span>
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                        {cust.name}
                      </span>
                      <span className="text-slate-400">{cust.email || "No email"}</span>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">
                    {formatCurrency(Number(cust.total_spend) || 0)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
