import * as React from "react";
import Link from "next/link";
import {
  TrendingUp,
  DollarSign,
  Users,
  Package,
  AlertTriangle,
  ArrowRight,
  PlusCircle,
  FileText,
  Clock,
  SlidersHorizontal,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SalesTrendChart, RevenueVsExpensesChart } from "@/components/dashboard/overview-charts";
import { BusinessHealthSnapshot } from "@/components/dashboard/health-snapshot";
import { GoalTracker } from "@/components/dashboard/goal-tracker";
import { OnboardingChecklist } from "@/components/dashboard/onboarding-checklist";
import { getCustomers } from "@/lib/actions/customers";
import { getProducts } from "@/lib/actions/products";
import { getSales, getExpenses } from "@/lib/actions/sales";
import { getInvoices } from "@/lib/actions/invoices";
import { getActivityLogs } from "@/lib/actions/activity-logs";
import { getStaffMembers } from "@/lib/actions/staff";
import { getTerminology } from "@/lib/terminology";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardOverviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Load user profile & business data
  let role = "owner";
  let industry = "General";
  let primaryGoal = "track_cashflow";
  let currency = "USD";
  let revenueTarget = 10000;
  let profitTarget = 4000;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, business_id, businesses(*)")
      .eq("id", user.id)
      .maybeSingle();

    if (profile) {
      role = profile.role || "owner";
      const biz = (profile.businesses as unknown) as Record<string, unknown> | null;
      if (biz) {
        industry = String(biz.industry || "General");
        primaryGoal = String(biz.primary_goal || "track_cashflow");
        currency = String(biz.currency || "USD");
        revenueTarget = Number(biz.monthly_revenue_target) || 10000;
        profitTarget = Number(biz.monthly_profit_target) || 4000;
      }
    }
  }

  const terminology = getTerminology(industry);
  const isOwnerOrAdmin = role === "owner" || role === "admin";

  // Fetch all collections in parallel
  const [customers, products, sales, expenses, invoices, activities, staff] = await Promise.all([
    getCustomers(),
    getProducts(),
    getSales(),
    getExpenses(),
    getInvoices(),
    getActivityLogs(),
    getStaffMembers(),
  ]);

  // Real financial calculations (zero mock additions)
  const totalRevenue = sales.reduce((acc, s) => acc + Number(s.total_amount || 0), 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + Number(e.amount || 0), 0);
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : "0.0";

  // Real inventory calculations
  const lowStockProducts = products.filter((p) => p.quantity <= p.reorder_threshold);
  const activeCustomersCount = customers.filter((c) => c.status === "active").length;

  // Real overdue invoices calculations
  const today = new Date().toISOString().split("T")[0];
  const overdueInvoices = invoices.filter(
    (inv) => inv.status !== "paid" && inv.status !== "cancelled" && inv.due_date < today
  );
  const overdueInvoicesTotal = overdueInvoices.reduce((acc, inv) => acc + Number(inv.total_amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Onboarding Lightweight Checklist (Disappears once all tasks are complete or dismissed) */}
      <OnboardingChecklist
        customerCount={customers.length}
        productCount={products.length}
        invoiceCount={invoices.length}
        staffCount={staff.length}
        productsLabel={terminology.productsLabel}
        customersLabel={terminology.customersLabel}
      />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-display">
              {industry ? `${industry} Workspace` : "Business Overview"}
            </h2>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              Goal: {primaryGoal.replace(/_/g, " ").toUpperCase()}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time telemetry adapted for your {industry.toLowerCase()} operations
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
              Record {terminology.singleSaleLabel}
            </Button>
          </Link>
        </div>
      </div>

      {/* Executive Plain-Language Health Snapshot */}
      <BusinessHealthSnapshot
        totalRevenue={totalRevenue}
        totalExpenses={totalExpenses}
        netProfit={netProfit}
        lowStockCount={lowStockProducts.length}
        overdueInvoicesCount={overdueInvoices.length}
        overdueInvoicesTotal={overdueInvoicesTotal}
        revenueTarget={revenueTarget}
        currency={currency}
        terminology={{
          productsLabel: terminology.productsLabel,
          customersLabel: terminology.customersLabel,
        }}
      />

      {/* Primary Goal-Driven Layout Arrangement */}
      {/* 1. If PRIMARY GOAL is MANAGE INVENTORY: Lead with Inventory & Stock Reorders */}
      {primaryGoal === "manage_inventory" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
            {/* Low-Stock Warning (Featured) */}
            <Card className="lg:col-span-6 p-5 flex flex-col justify-between border-amber-200/80 dark:border-amber-900/60 bg-amber-50/20 dark:bg-amber-950/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                  {terminology.productsLabel} Depletion Alert
                </span>
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <div className="space-y-1 mt-4">
                <h3 className="text-3xl font-bold font-display text-amber-700 dark:text-amber-400">
                  {lowStockProducts.length} Below Threshold
                </h3>
                <p className="text-xs text-slate-500">
                  {lowStockProducts.length === 0
                    ? "Safe stock levels maintained across all catalog SKUs"
                    : "Require immediate supplier purchase order or replenishment"}
                </p>
              </div>
              <Link
                href="/dashboard/inventory?filter=low-stock"
                className="inline-flex items-center gap-1 text-xs text-amber-700 dark:text-amber-400 font-semibold hover:underline pt-3"
              >
                Review reorders <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Card>

            {/* Total Catalog SKUs */}
            <Card className="lg:col-span-6 p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">
                  Total {terminology.inventoryLabel} Catalog
                </span>
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
              </div>
              <div className="space-y-1 mt-4">
                <h3 className="text-3xl font-bold font-display text-slate-900 dark:text-white">
                  {products.length} {terminology.productsLabel}
                </h3>
                <p className="text-xs text-slate-400">
                  Total available inventory: {products.reduce((acc, p) => acc + (p.quantity || 0), 0)} units
                </p>
              </div>
              <Link
                href="/dashboard/inventory"
                className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline pt-3"
              >
                Open catalog <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Card>
          </div>
        </div>
      )}

      {/* 2. If PRIMARY GOAL is PROFESSIONAL INVOICING: Lead with Aging & Overdue */}
      {primaryGoal === "professionalize_invoicing" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
          <Card className="lg:col-span-6 p-5 border-rose-200/80 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/10 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-rose-800 dark:text-rose-300">
                Overdue Invoice Collections
              </span>
              <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="space-y-1 mt-4">
              <h3 className="text-3xl font-bold font-display text-rose-700 dark:text-rose-400">
                {formatCurrency(overdueInvoicesTotal, currency)}
              </h3>
              <p className="text-xs text-slate-500">
                {overdueInvoices.length} invoices past due date
              </p>
            </div>
            <Link
              href="/dashboard/invoices?filter=overdue"
              className="inline-flex items-center gap-1 text-xs text-rose-700 dark:text-rose-400 font-semibold hover:underline pt-3"
            >
              Collect overdue invoices <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Card>

          <Card className="lg:col-span-6 p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Total Invoices Issued</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="space-y-1 mt-4">
              <h3 className="text-3xl font-bold font-display text-slate-900 dark:text-white">
                {invoices.length} Invoices
              </h3>
              <p className="text-xs text-slate-400">
                {invoices.filter((i) => i.status === "paid").length} marked as paid
              </p>
            </div>
            <Link
              href="/dashboard/invoices/new"
              className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline pt-3"
            >
              Create new invoice <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Card>
        </div>
      )}

      {/* Bento-Grid KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
        {/* Metric 1: Revenue (Hidden for staff, visible for owners/managers) */}
        {isOwnerOrAdmin ? (
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
                {formatCurrency(totalRevenue, currency)}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span>{sales.length} fulfilled transactions</span>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="lg:col-span-4 p-5 flex flex-col justify-between">
            <span className="text-xs font-medium text-slate-500">My Operational Role</span>
            <div className="space-y-1 mt-4">
              <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white">
                Staff Operations
              </h3>
              <p className="text-xs text-slate-400">Task-focused daily view</p>
            </div>
          </Card>
        )}

        {/* Metric 2: Net Profit or Goal Tracker */}
        {isOwnerOrAdmin ? (
          <div className="lg:col-span-4">
            <GoalTracker
              currentRevenue={totalRevenue}
              currentProfit={netProfit}
              initialRevenueTarget={revenueTarget}
              initialProfitTarget={profitTarget}
              currency={currency}
              isOwnerOrAdmin={isOwnerOrAdmin}
            />
          </div>
        ) : (
          <Card className="lg:col-span-4 p-5 flex flex-col justify-between">
            <span className="text-xs font-medium text-slate-500">{terminology.productsLabel} To Restock</span>
            <h3 className="text-2xl font-bold font-display text-amber-600 mt-2">
              {lowStockProducts.length} Items
            </h3>
            <Link
              href="/dashboard/inventory?filter=low-stock"
              className="text-xs text-amber-600 hover:underline inline-flex items-center gap-1 mt-2"
            >
              View items <ArrowRight className="w-3 h-3" />
            </Link>
          </Card>
        )}

        {/* Metric 3: Active CRM Accounts */}
        <Card className="lg:col-span-4 p-5 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Active {terminology.customersLabel}
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
              <span>{customers.length} total in directory</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Visual Telemetry Charts (Real Supabase data aggregation) */}
      {isOwnerOrAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Card className="lg:col-span-7 p-6">
            <SalesTrendChart
              salesData={sales.map((s) => ({
                sale_date: s.sale_date,
                total_amount: s.total_amount,
              }))}
              expensesData={expenses.map((e) => ({
                expense_date: e.expense_date,
                amount: e.amount,
              }))}
              currency={currency}
            />
          </Card>
          <Card className="lg:col-span-5 p-6">
            <RevenueVsExpensesChart
              salesData={sales.map((s) => ({
                sale_date: s.sale_date,
                total_amount: s.total_amount,
              }))}
              expensesData={expenses.map((e) => ({
                expense_date: e.expense_date,
                amount: e.amount,
              }))}
              currency={currency}
            />
          </Card>
        </div>
      )}

      {/* Lower Row: Low-Stock Warnings & Real Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Low-Stock Alert Widget */}
        <Card className="lg:col-span-6 overflow-hidden flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Critical {terminology.productsLabel} Reorders
              </CardTitle>
              <p className="text-xs text-slate-500">Items nearing safe threshold</p>
            </div>
            <Link
              href="/dashboard/inventory"
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-slate-100 dark:divide-slate-800/80">
            {lowStockProducts.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                All {terminology.productsLabel.toLowerCase()} are currently above safe threshold levels.
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

        {/* Real Activity Logs Widget */}
        <Card className="lg:col-span-6 overflow-hidden flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-indigo-500" />
                Audit Trail & Team Actions
              </CardTitle>
              <p className="text-xs text-slate-500">Real-time system events</p>
            </div>
            <Link
              href="/dashboard/activity"
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-slate-100 dark:divide-slate-800/80">
            {activities.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No activity logs recorded yet. Actions like sales, stock edits, and invoices will appear here.
              </div>
            ) : (
              activities.slice(0, 4).map((log) => (
                <div key={log.id} className="p-4 flex items-start gap-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <div className="flex-1 space-y-0.5">
                    <p className="font-medium text-slate-800 dark:text-slate-200">{log.action}</p>
                    <p className="text-[11px] text-slate-400">
                      {formatRelativeTime(log.created_at)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
