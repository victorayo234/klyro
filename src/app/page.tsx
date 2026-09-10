"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Users,
  Package,
  FileText,
  BarChart3,
  ShieldCheck,
  BellRing,
  TrendingUp,
  AlertTriangle,
  FileCheck2,
  Sparkles,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  const [activeTab, setActiveTab] = React.useState<"crm" | "inventory" | "invoices" | "analytics">("crm");
  const [billingPeriod, setBillingPeriod] = React.useState<"monthly" | "annual">("monthly");

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-blue-600 selection:text-white bg-noise">
      {/* Sticky Navigation */}
      <header className="sticky top-0 z-40 border-b border-slate-100 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-display font-bold shadow-xs">
                K
              </div>
              <span className="font-display font-bold text-lg tracking-tight">Klyro</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-600 dark:text-slate-400">
              <a href="#features" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Platform
              </a>
              <a href="#why-klyro" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Why Klyro
              </a>
              <a href="#pricing" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Pricing
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="gap-1.5 shadow-sm">
                Get Started
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 md:pt-28 md:pb-24 px-6 overflow-hidden bg-dot-grid">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800/80 bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-medium"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span>Introducing Klyro 2.0 • Precision Business Operating System</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.08] text-slate-900 dark:text-white max-w-4xl mx-auto"
          >
            Complete control over your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500">
              sales, inventory & cashflow.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed"
          >
            Say goodbye to fragmented spreadsheets and bloated ERPs. Klyro unites CRM, stock tracking, real-time profit/loss, and PDF invoices into one ultra-fast workspace.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.15 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2"
          >
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto gap-2 px-7 shadow-md">
                Start Free 14-Day Trial
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Explore Live Demo
              </Button>
            </Link>
          </motion.div>

          <div className="flex items-center justify-center gap-6 pt-4 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Instant Supabase RLS isolation
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Cancel anytime
            </span>
          </div>
        </div>

        {/* Interactive Auto-cycling Product Preview Mockup */}
        <div className="max-w-5xl mx-auto mt-14 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
          {/* Mockup Window Header */}
          <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400/80" />
              <div className="w-3 h-3 rounded-full bg-amber-400/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
              <span className="ml-3 text-xs font-mono text-slate-400">app.klyro.com/dashboard</span>
            </div>

            {/* Preview Tabs */}
            <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-slate-800/80 p-1 rounded-lg text-xs font-medium">
              <button
                onClick={() => setActiveTab("crm")}
                className={`px-3 py-1 rounded-md transition-all ${
                  activeTab === "crm"
                    ? "bg-white dark:bg-slate-900 text-blue-600 shadow-xs"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                Customers CRM
              </button>
              <button
                onClick={() => setActiveTab("inventory")}
                className={`px-3 py-1 rounded-md transition-all ${
                  activeTab === "inventory"
                    ? "bg-white dark:bg-slate-900 text-blue-600 shadow-xs"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                Inventory & Stock
              </button>
              <button
                onClick={() => setActiveTab("invoices")}
                className={`px-3 py-1 rounded-md transition-all ${
                  activeTab === "invoices"
                    ? "bg-white dark:bg-slate-900 text-blue-600 shadow-xs"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                PDF Invoices
              </button>
              <button
                onClick={() => setActiveTab("analytics")}
                className={`px-3 py-1 rounded-md transition-all ${
                  activeTab === "analytics"
                    ? "bg-white dark:bg-slate-900 text-blue-600 shadow-xs"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                Profit/Loss
              </button>
            </div>
          </div>

          {/* Interactive Tab Body */}
          <div className="p-6 md:p-8 bg-slate-50/30 dark:bg-slate-950/30 min-h-[340px]">
            {activeTab === "crm" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold font-display">Active Customer Directory</h4>
                    <p className="text-xs text-slate-500">Live sync with purchase history and spend tiers</p>
                  </div>
                  <span className="text-xs font-mono text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded-md border border-emerald-200 dark:border-emerald-800">
                    248 Active Accounts
                  </span>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/80">
                  <div className="p-3.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center">
                        AC
                      </div>
                      <div>
                        <span className="font-medium text-slate-900 dark:text-slate-100">Apex Consulting LLC</span>
                        <p className="text-[11px] text-slate-400">billing@apexcorp.com</p>
                      </div>
                    </div>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">$18,450.00 spend</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                      VIP Client
                    </span>
                  </div>
                  <div className="p-3.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center">
                        BL
                      </div>
                      <div>
                        <span className="font-medium text-slate-900 dark:text-slate-100">BioLab Diagnostics</span>
                        <p className="text-[11px] text-slate-400">orders@biolab.io</p>
                      </div>
                    </div>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">$9,230.00 spend</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "inventory" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold font-display">Inventory & Low-Stock Alerts</h4>
                    <p className="text-xs text-slate-500">Auto-decremented when sales and invoices are processed</p>
                  </div>
                  <span className="text-xs font-mono text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-1 rounded-md border border-amber-200 dark:border-amber-800 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> 2 Items Low Stock
                  </span>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/80">
                  <div className="p-3.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-medium text-slate-900 dark:text-slate-100">Ergonomic Office Chair X-1</span>
                      <p className="text-[11px] font-mono text-slate-400">SKU: FUR-CHR-004</p>
                    </div>
                    <div className="text-center">
                      <span className="font-bold text-amber-600">3 units left</span>
                      <p className="text-[10px] text-slate-400">Threshold: 10</p>
                    </div>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">$289.00</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                      Reorder Alert
                    </span>
                  </div>
                  <div className="p-3.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-medium text-slate-900 dark:text-slate-100">Wireless Noise-Canceling Headset</span>
                      <p className="text-[11px] font-mono text-slate-400">SKU: AUD-HD-99</p>
                    </div>
                    <div className="text-center">
                      <span className="font-bold text-slate-900 dark:text-slate-100">42 in stock</span>
                      <p className="text-[10px] text-slate-400">Threshold: 8</p>
                    </div>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">$149.50</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Healthy Stock
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "invoices" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold font-display">Automated Invoicing & Instant PDF Engine</h4>
                    <p className="text-xs text-slate-500">Calculates line items, sales tax, discounts, and renders PDF</p>
                  </div>
                  <span className="text-xs font-mono text-blue-600 bg-blue-50 dark:bg-blue-950/40 px-2 py-1 rounded-md border border-blue-200 dark:border-blue-800 flex items-center gap-1.5">
                    <FileCheck2 className="w-3.5 h-3.5" /> PDF Verified
                  </span>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center font-mono font-bold">
                      PDF
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">INV-2026-089</span>
                      <p className="text-[11px] text-slate-400">Due in 14 days • Billed to Apex Consulting</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">$3,420.00</span>
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Paid via Stripe
                  </span>
                </div>
              </div>
            )}

            {activeTab === "analytics" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold font-display">Real-Time Financial Formulas</h4>
                    <p className="text-xs text-slate-500">Revenue minus COGS and Operating Expenses</p>
                  </div>
                  <span className="text-xs font-mono text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded-md border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" /> +28.4% Margin
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <span className="text-[11px] text-slate-400">Total Revenue</span>
                    <p className="text-lg font-bold font-display text-slate-900 dark:text-slate-100">$54,820</p>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <span className="text-[11px] text-slate-400">Expenses & COGS</span>
                    <p className="text-lg font-bold font-display text-slate-900 dark:text-slate-100">$21,430</p>
                  </div>
                  <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/30">
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400">Net Profit</span>
                    <p className="text-lg font-bold font-display text-emerald-600 dark:text-emerald-400">$33,390</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Social Proof Strip */}
      <section className="py-12 border-y border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-6">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">
            Powering dynamic SMBs, high-growth agencies, and retail innovators worldwide
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all">
            <span className="font-display font-bold text-lg text-slate-600 dark:text-slate-400">APEX VENTURES</span>
            <span className="font-display font-bold text-lg text-slate-600 dark:text-slate-400">QUANTUM LABS</span>
            <span className="font-display font-bold text-lg text-slate-600 dark:text-slate-400">KINETIC SUPPLY</span>
            <span className="font-display font-bold text-lg text-slate-600 dark:text-slate-400">NORTHSTAR RETAIL</span>
            <span className="font-display font-bold text-lg text-slate-600 dark:text-slate-400">LUMEN STUDIO</span>
          </div>
        </div>
      </section>

      {/* Feature Highlights - Bento Grid */}
      <section id="features" className="py-20 px-6 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
            Integrated Modules
          </h2>
          <h3 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
            Every operational tool, engineered to work in harmony.
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            No more manual exports or duct-taped integrations. Data updates across all your business records in real-time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: CRM */}
          <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Users className="w-5 h-5" />
            </div>
            <h4 className="font-display text-lg font-semibold">Customer Intelligence & CRM</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Track lifetime value, past invoices, order frequencies, and notes per client. Categorize leads and VIPs with custom tags.
            </p>
          </div>

          {/* Card 2: Inventory */}
          <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Package className="w-5 h-5" />
            </div>
            <h4 className="font-display text-lg font-semibold">Inventory & Low-Stock Alerts</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Automated reorder threshold alerts. When sales occur, stock counts decrement instantly to eliminate overselling.
            </p>
          </div>

          {/* Card 3: Invoicing */}
          <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <FileText className="w-5 h-5" />
            </div>
            <h4 className="font-display text-lg font-semibold">Professional Invoicing & PDF</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Generate pixel-perfect branded PDF invoices with server-side mathematical validation and automatic tax calculation.
            </p>
          </div>

          {/* Card 4: Financials */}
          <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h4 className="font-display text-lg font-semibold">Sales & Expense Reconciliation</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Log sales and operating expenses in seconds. Monitor net margins with customizable date filters (7d, 30d, 90d, custom).
            </p>
          </div>

          {/* Card 5: Roles & Security */}
          <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-display text-lg font-semibold">Role-Based Multi-Tenancy</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Owner, Admin, Manager, and Staff roles with Postgres Row Level Security. Zero risk of cross-workspace data leakage.
            </p>
          </div>

          {/* Card 6: Audit Logs */}
          <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950 flex items-center justify-center text-red-600 dark:text-red-400">
              <BellRing className="w-5 h-5" />
            </div>
            <h4 className="font-display text-lg font-semibold">Audit Logs & Instant Alerts</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Comprehensive activity trails for compliance and team transparency. Real-time bell notifications for critical events.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/30 dark:bg-slate-900/20">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
              Simple, Transparent Pricing
            </h2>
            <h3 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
              Invest in operations that scale effortlessly.
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              Start free, upgrade as your business expands. No hidden transaction fees.
            </p>

            {/* Toggle */}
            <div className="flex items-center justify-center gap-3 pt-4">
              <span className={`text-xs font-medium ${billingPeriod === "monthly" ? "text-slate-900 dark:text-white" : "text-slate-400"}`}>
                Monthly billing
              </span>
              <button
                onClick={() => setBillingPeriod(billingPeriod === "monthly" ? "annual" : "monthly")}
                className="w-12 h-6 rounded-full bg-slate-200 dark:bg-slate-700 p-1 flex items-center transition-colors relative"
              >
                <div
                  className={`w-4 h-4 rounded-full bg-blue-600 transition-transform ${
                    billingPeriod === "annual" ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
              <span className={`text-xs font-medium ${billingPeriod === "annual" ? "text-slate-900 dark:text-white" : "text-slate-400"}`}>
                Annual billing <span className="text-emerald-600 font-bold">(Save 20%)</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {/* Starter Plan */}
            <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Starter</span>
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-3xl font-extrabold text-slate-900 dark:text-white">
                    {billingPeriod === "monthly" ? "$29" : "$24"}
                  </span>
                  <span className="text-xs text-slate-400">/ month</span>
                </div>
                <p className="text-xs text-slate-500">Perfect for solo founders and micro-businesses.</p>
                <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 pt-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    Up to 2 staff seats
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    Up to 150 inventory SKUs
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    Unlimited PDF invoices
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    Basic sales analytics
                  </li>
                </ul>
              </div>
              <Link href="/signup">
                <Button variant="outline" className="w-full" size="sm">
                  Start Starter Trial
                </Button>
              </Link>
            </div>

            {/* Growth Plan - Highlighted */}
            <div className="p-8 rounded-2xl border-2 border-blue-600 bg-white dark:bg-slate-900 shadow-xl flex flex-col justify-between space-y-6 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white uppercase tracking-wider shadow-xs">
                Most Popular
              </div>
              <div className="space-y-4">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Growth</span>
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-3xl font-extrabold text-slate-900 dark:text-white">
                    {billingPeriod === "monthly" ? "$79" : "$64"}
                  </span>
                  <span className="text-xs text-slate-400">/ month</span>
                </div>
                <p className="text-xs text-slate-500">For scaling businesses needing complete team workflows.</p>
                <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 pt-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    Up to 10 staff seats with roles
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    Unlimited inventory & alerts
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    Automated low-stock notifications
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    CSV import & export engine
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    Advanced profit/loss reports
                  </li>
                </ul>
              </div>
              <Link href="/signup">
                <Button className="w-full" size="sm">
                  Get Growth Plan
                </Button>
              </Link>
            </div>

            {/* Scale / Enterprise Plan */}
            <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Enterprise</span>
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-3xl font-extrabold text-slate-900 dark:text-white">
                    {billingPeriod === "monthly" ? "$199" : "$159"}
                  </span>
                  <span className="text-xs text-slate-400">/ month</span>
                </div>
                <p className="text-xs text-slate-500">For multi-location businesses requiring custom limits.</p>
                <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 pt-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    Unlimited staff seats
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    Custom invoice branding & terms
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    Complete audit trail history
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    Dedicated onboarding & support
                  </li>
                </ul>
              </div>
              <Link href="/signup">
                <Button variant="outline" className="w-full" size="sm">
                  Contact Sales
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-100 dark:border-slate-800/80 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center text-white font-display font-bold text-xs">
              K
            </div>
            <span className="font-display font-bold text-sm tracking-tight">Klyro Inc.</span>
            <span className="text-xs text-slate-400">© 2026. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-slate-500 dark:text-slate-400">
            <Link href="/login" className="hover:text-blue-600">Login</Link>
            <Link href="/signup" className="hover:text-blue-600">Signup</Link>
            <a href="#features" className="hover:text-blue-600">Features</a>
            <a href="#pricing" className="hover:text-blue-600">Pricing</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
