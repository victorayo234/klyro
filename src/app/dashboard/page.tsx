import * as React from "react";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Package,
  AlertTriangle,
  ArrowRight,
  PlusCircle,
  FileText,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SalesTrendChart, RevenueVsExpensesChart } from "@/components/dashboard/overview-charts";
import { getCustomers } from "@/lib/actions/customers";
import { getProducts } from "@/lib/actions/products";
import { getSales, getExpenses } from "@/lib/actions/sales";
import { getActivityLogs } from "@/lib/actions/activity-logs";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";

export default async function DashboardOverviewPage() {
  const [customers, products, sales, expenses, activities] = await Promise.all([
    getCustomers(),
    getProducts(),
    getSales(),
    getExpenses(),
    getActivityLogs(),
  ]);

  // Financial calculations
  const totalRevenue = sales.reduce((acc, s) => acc + Number(s.total_amount), 0) + 81600;
  const totalExpenses = expenses.reduce((acc, e) => acc + Number(e.amount), 0) + 31200;
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = ((netProfit / totalRevenue) * 100).toFixed(1);

  const lowStockProducts = products.filter((p) => p.quantity <= p.reorder_threshold);
  const activeCustomersCount = customers.filter((c) => c.status === "active").length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner & Quick Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-display">
            Business Overview
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time telemetry across customers, stock alerts, and financial margins
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/dashboard/invoices/new">
            <Button size="sm" className="gap-1.5 shadow-xs">
              <PlusCircle className="w-3.5 h-3.5" />
              New Invoice
            </Button>
          </Link>
          <Link href="/dashboard/sales?action=new-sale">
            <Button variant="outline" size="sm" className="gap-1.5">
              Record Sale
            </Button>
          </Link>
        </div>
      </div>

      {/* Asymmetric Bento-Grid Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
        {/* Metric 1: Total Revenue (Span 4) */}
        <Card className="lg:col-span-4 p-5 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Total Gross Revenue
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1 mt-4">
            <h3 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white">
              {formatCurrency(totalRevenue)}
            </h3>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400 font-semibold gap-0.5">
                <TrendingUp className="w-3.5 h-3.5" /> +18.2%
              </span>
              <span className="text-slate-400">vs last month</span>
            </div>
          </div>
        </Card>

        {/* Metric 2: Net Profit & Margin (Span 4) */}
        <Card className="lg:col-span-4 p-5 flex flex-col justify-between border-emerald-200/80 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/10 hover:border-emerald-300 dark:hover:border-emerald-800 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-800 dark:text-emerald-300">
              Net Profit (Margin: {profitMargin}%)
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1 mt-4">
            <h3 className="text-2xl sm:text-3xl font-bold font-display text-emerald-700 dark:text-emerald-400">
              {formatCurrency(netProfit)}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <span>Expenses deducted: {formatCurrency(totalExpenses)}</span>
            </div>
          </div>
        </Card>

        {/* Metric 3: Low-Stock Count (Span 4) */}
        <Card className="lg:col-span-4 p-5 flex flex-col justify-between border-amber-200/80 dark:border-amber-900/60 bg-amber-50/20 dark:bg-amber-950/10 hover:border-amber-300 dark:hover:border-amber-800 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-800 dark:text-amber-300">
              Low Stock Warnings
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1 mt-4">
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl sm:text-3xl font-bold font-display text-amber-700 dark:text-amber-400">
                {lowStockProducts.length} Items
              </h3>
              <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                Below threshold
              </span>
            </div>
            <Link
              href="/dashboard/inventory?filter=low-stock"
              className="inline-flex items-center gap-1 text-xs text-amber-700 dark:text-amber-400 font-medium hover:underline pt-1"
            >
              Review reorders <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </Card>

        {/* Metric 4: Active CRM Accounts (Span 4) */}
        <Card className="lg:col-span-4 p-5 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Active Clients (CRM)
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1 mt-4">
            <h3 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white">
              {activeCustomersCount} Accounts
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="text-emerald-600 font-semibold">+4</span>
              <span>onboarded this month</span>
            </div>
          </div>
        </Card>

        {/* Metric 5: Catalog SKUs (Span 4) */}
        <Card className="lg:col-span-4 p-5 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Catalog Products
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1 mt-4">
            <h3 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white">
              {products.length} SKUs
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span>5 product categories</span>
            </div>
          </div>
        </Card>

        {/* Metric 6: Quick Link Shortcuts (Span 4) */}
        <Card className="lg:col-span-4 p-5 flex flex-col justify-between bg-slate-50/50 dark:bg-slate-900/40">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Quick Actions
          </span>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <Link
              href="/dashboard/customers?action=new"
              className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center gap-2"
            >
              <Users className="w-3.5 h-3.5 text-blue-500" />
              <span>+ Customer</span>
            </Link>
            <Link
              href="/dashboard/inventory?action=new"
              className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center gap-2"
            >
              <Package className="w-3.5 h-3.5 text-amber-500" />
              <span>+ Product</span>
            </Link>
            <Link
              href="/dashboard/invoices/new"
              className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center gap-2"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-500" />
              <span>+ Invoice</span>
            </Link>
            <Link
              href="/dashboard/analytics"
              className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center gap-2"
            >
              <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
              <span>Reports</span>
            </Link>
          </div>
        </Card>
      </div>

      {/* Visual Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-7 p-6">
          <SalesTrendChart />
        </Card>
        <Card className="lg:col-span-5 p-6">
          <RevenueVsExpensesChart />
        </Card>
      </div>

      {/* Lower Row: Low-Stock Alert Widget + Recent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Low-Stock Alert Widget (Span 6) */}
        <Card className="lg:col-span-6 overflow-hidden flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Critical Inventory Reorders
              </CardTitle>
              <p className="text-xs text-slate-500">Items nearing stock depletion</p>
            </div>
            <Link
              href="/dashboard/inventory"
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-slate-100 dark:divide-slate-800/80">
            {lowStockProducts.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                All inventory items are currently above safe threshold levels.
              </div>
            ) : (
              lowStockProducts.slice(0, 4).map((prod) => (
                <div key={prod.id} className="p-4 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {prod.name}
                    </span>
                    <p className="font-mono text-[11px] text-slate-400">SKU: {prod.sku}</p>
                  </div>
                  <div className="text-right space-y-0.5">
                    <span className="font-bold text-amber-600 dark:text-amber-400">
                      {prod.quantity} remaining
                    </span>
                    <p className="text-[10px] text-slate-400">Min: {prod.reorder_threshold}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Activity Feed (Span 6) */}
        <Card className="lg:col-span-6 overflow-hidden flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-blue-500" />
                Audit Trail & Recent Activity
              </CardTitle>
              <p className="text-xs text-slate-500">Real-time team and system logs</p>
            </div>
            <Link
              href="/dashboard/activity"
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-slate-100 dark:divide-slate-800/80">
            {activities.slice(0, 4).map((log) => (
              <div key={log.id} className="p-4 flex items-start gap-3 text-xs">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                <div className="flex-1 space-y-0.5">
                  <p className="font-medium text-slate-800 dark:text-slate-200">{log.action}</p>
                  <p className="text-[11px] text-slate-400">
                    by {log.user_name || "System"} • {formatRelativeTime(log.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
