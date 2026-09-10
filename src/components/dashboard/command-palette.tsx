"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  LayoutDashboard,
  Users,
  Package,
  BadgeDollarSign,
  FileText,
  BarChart3,
  UserCheck,
  History,
  Settings,
  PlusCircle,
  Sun,
  Moon,
  Search,
  Download,
  RefreshCw,
  Upload,
  Target,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { exportAllBusinessData } from "@/lib/actions/settings";
import { processDueRecurringInvoices } from "@/lib/actions/recurring-invoices";
import { toast } from "sonner";

export function CommandPalette() {
  const router = useRouter();
  const {
    isCommandPaletteOpen,
    closeCommandPalette,
    toggleCommandPalette,
    toggleDarkMode,
    isDarkMode,
    themePreference,
    setTheme,
  } = useAppStore();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        e.preventDefault();
        toggleCommandPalette();
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [toggleCommandPalette]);

  if (!isCommandPaletteOpen) return null;

  const runCommand = (command: () => void) => {
    closeCommandPalette();
    command();
  };

  const handleExportData = async () => {
    try {
      toast.loading("Exporting workspace data...", { id: "export" });
      const data = await exportAllBusinessData();
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `klyro-export-${new Date().toISOString().split("T")[0]}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Data exported successfully", { id: "export" });
    } catch {
      toast.error("Export failed", { id: "export" });
    }
  };

  const handleProcessRecurring = async () => {
    try {
      toast.loading("Processing recurring invoices...", { id: "recurring" });
      const result = await processDueRecurringInvoices();
      toast.success(`Processed ${result.count ?? 0} recurring invoice(s)`, { id: "recurring" });
    } catch {
      toast.error("Failed to process recurring invoices", { id: "recurring" });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        onClick={closeCommandPalette}
      />

      {/* Command Dialog */}
      <div className="relative w-full max-w-xl rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden z-10">
        <Command className="flex flex-col w-full">
          <div className="flex items-center px-4 border-b border-slate-100 dark:border-slate-800">
            <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2" />
            <Command.Input
              autoFocus
              placeholder="Type a command, action, or page name..."
              className="w-full h-12 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none"
            />
            <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
              ESC
            </kbd>
          </div>

          <Command.List className="max-h-[420px] overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-slate-800/40">
            <Command.Empty className="py-8 text-center text-xs text-slate-400">
              No matching commands or pages found.
            </Command.Empty>

            {/* Quick Actions */}
            <Command.Group heading="Quick Actions" className="p-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <Command.Item
                onSelect={() => runCommand(() => router.push("/dashboard/invoices/new"))}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer select-none transition-colors"
              >
                <PlusCircle className="w-4 h-4 text-blue-500" />
                <span>Create New Invoice</span>
                <kbd className="ml-auto text-[10px] font-mono text-slate-300 dark:text-slate-600">⌘ I</kbd>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => router.push("/dashboard/customers?action=new"))}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer select-none transition-colors"
              >
                <Users className="w-4 h-4 text-emerald-500" />
                <span>Add New Customer</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => router.push("/dashboard/inventory?action=new"))}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer select-none transition-colors"
              >
                <Package className="w-4 h-4 text-amber-500" />
                <span>Add New Product</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => router.push("/dashboard/sales?action=new"))}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer select-none transition-colors"
              >
                <BadgeDollarSign className="w-4 h-4 text-purple-500" />
                <span>Record New Sale</span>
              </Command.Item>
            </Command.Group>

            {/* Power Actions */}
            <Command.Group heading="Power Actions" className="p-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <Command.Item
                onSelect={() => runCommand(handleProcessRecurring)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer select-none transition-colors"
              >
                <RefreshCw className="w-4 h-4 text-indigo-500" />
                <span>Process Recurring Invoices</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(handleExportData)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer select-none transition-colors"
              >
                <Download className="w-4 h-4 text-indigo-500" />
                <span>Export All Workspace Data</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => router.push("/dashboard/customers?action=import"))}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer select-none transition-colors"
              >
                <Upload className="w-4 h-4 text-indigo-500" />
                <span>Import Customers from CSV</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => router.push("/dashboard#goals"))}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer select-none transition-colors"
              >
                <Target className="w-4 h-4 text-indigo-500" />
                <span>View Goal Tracker</span>
              </Command.Item>
            </Command.Group>

            {/* Navigation */}
            <Command.Group heading="Navigation" className="p-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {[
                { label: "Overview Dashboard", href: "/dashboard", icon: LayoutDashboard },
                { label: "Customers CRM", href: "/dashboard/customers", icon: Users },
                { label: "Inventory & Products", href: "/dashboard/inventory", icon: Package },
                { label: "Sales & Expenses", href: "/dashboard/sales", icon: BadgeDollarSign },
                { label: "Invoices", href: "/dashboard/invoices", icon: FileText },
                { label: "Analytics & Margins", href: "/dashboard/analytics", icon: BarChart3 },
                { label: "Staff & Roles", href: "/dashboard/staff", icon: UserCheck },
                { label: "Activity Logs", href: "/dashboard/activity", icon: History },
                { label: "Business Settings", href: "/dashboard/settings", icon: Settings },
              ].map(({ label, href, icon: Icon }) => (
                <Command.Item
                  key={href}
                  onSelect={() => runCommand(() => router.push(href))}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer select-none transition-colors"
                >
                  <Icon className="w-4 h-4 text-slate-500" />
                  <span>{label}</span>
                </Command.Item>
              ))}
            </Command.Group>

            {/* Preferences */}
            <Command.Group heading="Preferences" className="p-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <Command.Item
                onSelect={() => runCommand(toggleDarkMode)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer select-none transition-colors"
              >
                {isDarkMode ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-500" />
                    <span>Switch to Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-blue-500" />
                    <span>Switch to Dark Mode</span>
                  </>
                )}
                <kbd className="ml-auto text-[10px] font-mono text-slate-300 dark:text-slate-600">⌘ D</kbd>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => {
                  const next = themePreference === "system" ? "light" : themePreference === "light" ? "dark" : "system";
                  setTheme(next);
                  toast.success(`Theme set to ${next}`);
                })}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer select-none transition-colors"
              >
                <RefreshCw className="w-4 h-4 text-slate-500" />
                <span>Cycle Theme (Light → Dark → System)</span>
                <span className="ml-auto text-[11px] text-slate-400 capitalize">{themePreference}</span>
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
