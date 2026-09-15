"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  LogOut,
  AlertTriangle,
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import { KlyroGlyph } from "@/components/ui/logo";
import { useRouteTransition } from "@/components/dashboard/route-transition-loader";

import { TerminologyConfig } from "@/lib/terminology";

interface SidebarProps {
  businessName?: string;
  userRole?: string;
  userName?: string;
  lowStockCount?: number;
  terminology?: TerminologyConfig;
}

export function Sidebar({
  businessName = "Klyro Workspace",
  userRole = "Owner",
  userName = "Business Admin",
  lowStockCount = 0,
  terminology,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isSidebarCollapsed, toggleSidebar } = useAppStore();
  const { startTransition } = useRouteTransition();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDarkMode = mounted ? resolvedTheme === "dark" : false;
  const toggleDarkMode = () => {
    setTheme(isDarkMode ? "light" : "dark");
  };

  const navItems = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/customers", label: terminology?.customersLabel || "Customers", icon: Users },
    { href: "/dashboard/inventory", label: terminology?.inventoryLabel || "Inventory", icon: Package, badgeKey: "lowStock" },
    { href: "/dashboard/sales", label: `${terminology?.salesLabel || "Sales"} & Expenses`, icon: BadgeDollarSign },
    { href: "/dashboard/invoices", label: "Invoices", icon: FileText },
    { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/dashboard/staff", label: "Staff & Roles", icon: UserCheck },
    { href: "/dashboard/activity", label: "Activity Logs", icon: History },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ];

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    router.push("/login");
  };

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 transition-all duration-250 ease-in-out shrink-0 z-30 select-none",
        isSidebarCollapsed ? "w-[72px]" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div className="h-16 border-b border-slate-100 dark:border-slate-800/80 px-4 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden group">
          <KlyroGlyph size={30} />
          {!isSidebarCollapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="font-display font-bold text-base text-slate-900 dark:text-slate-100 tracking-tight leading-none group-hover:text-indigo-600 transition-colors">
                Klyro
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-1 font-medium">
                {businessName}
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Role Pill */}
      {!isSidebarCollapsed && (
        <div className="px-4 py-2.5 mx-3 my-2 rounded-lg bg-slate-50 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800/70 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Role</span>
          <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
            {userRole}
          </span>
        </div>
      )}

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => startTransition(item.href)}
              title={isSidebarCollapsed ? item.label : undefined}
              className={cn(
                "group flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors relative",
                isActive
                  ? "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/60 hover:text-slate-900 dark:hover:text-slate-200"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 shrink-0 transition-colors",
                  isActive
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                )}
              />
              {!isSidebarCollapsed && (
                <span className="truncate flex-1">{item.label}</span>
              )}

              {/* Low stock badge */}
              {item.badgeKey === "lowStock" && lowStockCount > 0 && !isSidebarCollapsed && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  <AlertTriangle className="w-2.5 h-2.5" />
                  {lowStockCount}
                </span>
              )}
              {item.badgeKey === "lowStock" && lowStockCount > 0 && isSidebarCollapsed && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Controls */}
      <div className="border-t border-slate-100 dark:border-slate-800/80 p-3 space-y-1">
        {/* Dark mode toggle */}
        <button
          onClick={toggleDarkMode}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
        >
          {isDarkMode ? (
            <Sun className="w-4 h-4 text-amber-500 shrink-0" />
          ) : (
            <Moon className="w-4 h-4 text-blue-500 shrink-0" />
          )}
          {!isSidebarCollapsed && (
            <span>{isDarkMode ? "Light Theme" : "Dark Theme"}</span>
          )}
        </button>

        {/* Collapse button */}
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="w-4 h-4 shrink-0" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4 shrink-0" />
              <span>Collapse Sidebar</span>
            </>
          )}
        </button>

        {/* User profile & Logout */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-semibold text-slate-700 dark:text-slate-200 shrink-0">
              {userName.charAt(0).toUpperCase()}
            </div>
            {!isSidebarCollapsed && (
              <span className="text-xs text-slate-700 dark:text-slate-300 font-medium truncate">
                {userName}
              </span>
            )}
          </div>
          <button
            onClick={handleSignOut}
            title="Sign out"
            className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
