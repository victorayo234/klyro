"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Search,
  Bell,
  Plus,
  Menu,
  FileText,
  Users,
  Package,
  BadgeDollarSign,
  CheckCircle2,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TopbarProps {
  businessName?: string;
  unreadNotificationsCount?: number;
}

export function Topbar({
  businessName = "Klyro",
  unreadNotificationsCount = 0,
}: TopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { openCommandPalette, setMobileNavOpen } = useAppStore();
  const [isQuickActionOpen, setIsQuickActionOpen] = React.useState(false);

  // Generate clean breadcrumb title
  const getPageTitle = () => {
    if (pathname === "/dashboard") return "Overview";
    if (pathname.includes("/customers")) return "Customers & CRM";
    if (pathname.includes("/inventory")) return "Inventory & Products";
    if (pathname.includes("/sales")) return "Sales & Expenses";
    if (pathname.includes("/invoices")) return "Invoices";
    if (pathname.includes("/analytics")) return "Analytics & Reports";
    if (pathname.includes("/staff")) return "Staff & Roles";
    if (pathname.includes("/activity")) return "Activity Logs";
    if (pathname.includes("/settings")) return "Settings";
    return "Dashboard";
  };

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xs px-4 md:px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Mobile hamburger & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileNavOpen(true)}
          className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-block text-xs font-medium text-slate-400 dark:text-slate-500">
            {businessName}
          </span>
          <span className="hidden sm:inline-block text-xs text-slate-300 dark:text-slate-700">
            /
          </span>
          <h1 className="text-sm md:text-base font-semibold text-slate-900 dark:text-slate-100 font-display">
            {getPageTitle()}
          </h1>
        </div>
      </div>

      {/* Right: Search, Quick Action, Notification */}
      <div className="flex items-center gap-2.5">
        {/* Command Palette Trigger */}
        <button
          onClick={openCommandPalette}
          className="flex items-center gap-2.5 h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 text-xs transition-colors cursor-pointer"
        >
          <Search className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline-block">Search or run command...</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 shadow-xs">
            ⌘K
          </kbd>
        </button>

        {/* Quick Action Dropdown */}
        <div className="relative">
          <Button
            size="sm"
            onClick={() => setIsQuickActionOpen(!isQuickActionOpen)}
            className="h-9 gap-1.5 font-medium shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Action</span>
          </Button>

          {isQuickActionOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setIsQuickActionOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl py-1.5 z-40">
                <button
                  onClick={() => {
                    setIsQuickActionOpen(false);
                    router.push("/dashboard/invoices/new");
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-blue-500" />
                  <span>Create Invoice</span>
                </button>
                <button
                  onClick={() => {
                    setIsQuickActionOpen(false);
                    router.push("/dashboard/sales?action=new-sale");
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer"
                >
                  <BadgeDollarSign className="w-4 h-4 text-emerald-500" />
                  <span>Record Sale</span>
                </button>
                <button
                  onClick={() => {
                    setIsQuickActionOpen(false);
                    router.push("/dashboard/customers?action=new");
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer"
                >
                  <Users className="w-4 h-4 text-indigo-500" />
                  <span>Add Customer</span>
                </button>
                <button
                  onClick={() => {
                    setIsQuickActionOpen(false);
                    router.push("/dashboard/inventory?action=new");
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer"
                >
                  <Package className="w-4 h-4 text-amber-500" />
                  <span>Add Product</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Notifications */}
        <Link
          href="/dashboard/notifications"
          className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
          )}
        </Link>
      </div>
    </header>
  );
}
