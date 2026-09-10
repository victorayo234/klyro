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
} from "lucide-react";
import { useAppStore } from "@/lib/store";

export function CommandPalette() {
  const router = useRouter();
  const {
    isCommandPaletteOpen,
    closeCommandPalette,
    toggleCommandPalette,
    toggleDarkMode,
    isDarkMode,
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

          <Command.List className="max-h-80 overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-slate-800/40">
            <Command.Empty className="py-8 text-center text-xs text-slate-400">
              No matching commands or pages found.
            </Command.Empty>

            <Command.Group heading="Quick Actions" className="p-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <Command.Item
                onSelect={() => runCommand(() => router.push("/dashboard/invoices/new"))}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer select-none transition-colors"
              >
                <PlusCircle className="w-4 h-4 text-blue-500" />
                <span>Create New Invoice</span>
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
            </Command.Group>

            <Command.Group heading="Navigation" className="p-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <Command.Item
                onSelect={() => runCommand(() => router.push("/dashboard"))}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer select-none transition-colors"
              >
                <LayoutDashboard className="w-4 h-4 text-slate-500" />
                <span>Overview Dashboard</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => router.push("/dashboard/customers"))}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer select-none transition-colors"
              >
                <Users className="w-4 h-4 text-slate-500" />
                <span>Customers CRM</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => router.push("/dashboard/inventory"))}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer select-none transition-colors"
              >
                <Package className="w-4 h-4 text-slate-500" />
                <span>Inventory & Products</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => router.push("/dashboard/sales"))}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer select-none transition-colors"
              >
                <BadgeDollarSign className="w-4 h-4 text-slate-500" />
                <span>Sales & Expenses</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => router.push("/dashboard/invoices"))}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer select-none transition-colors"
              >
                <FileText className="w-4 h-4 text-slate-500" />
                <span>Invoices</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => router.push("/dashboard/analytics"))}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer select-none transition-colors"
              >
                <BarChart3 className="w-4 h-4 text-slate-500" />
                <span>Analytics & Margins</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => router.push("/dashboard/staff"))}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer select-none transition-colors"
              >
                <UserCheck className="w-4 h-4 text-slate-500" />
                <span>Staff & Roles</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => router.push("/dashboard/activity"))}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer select-none transition-colors"
              >
                <History className="w-4 h-4 text-slate-500" />
                <span>Activity Logs</span>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => router.push("/dashboard/settings"))}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer select-none transition-colors"
              >
                <Settings className="w-4 h-4 text-slate-500" />
                <span>Business Settings</span>
              </Command.Item>
            </Command.Group>

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
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
