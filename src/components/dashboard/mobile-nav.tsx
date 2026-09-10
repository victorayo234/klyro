"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, LayoutDashboard, Users, Package, BadgeDollarSign, FileText, BarChart3, UserCheck, History, Settings } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { KlyroLogo } from "@/components/ui/logo";
import { TerminologyConfig } from "@/lib/terminology";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  terminology?: TerminologyConfig;
}

export function MobileNav({ terminology }: MobileNavProps) {
  const pathname = usePathname();
  const { isMobileNavOpen, setMobileNavOpen } = useAppStore();

  if (!isMobileNavOpen) return null;

  const navItems = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/customers", label: terminology?.customersLabel || "Customers", icon: Users },
    { href: "/dashboard/inventory", label: terminology?.inventoryLabel || "Inventory", icon: Package },
    { href: "/dashboard/sales", label: `${terminology?.salesLabel || "Sales"} & Expenses`, icon: BadgeDollarSign },
    { href: "/dashboard/invoices", label: "Invoices", icon: FileText },
    { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/dashboard/staff", label: "Staff & Roles", icon: UserCheck },
    { href: "/dashboard/activity", label: "Activity Logs", icon: History },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        onClick={() => setMobileNavOpen(false)}
      />
      <div className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 p-4 flex flex-col z-10">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <KlyroLogo size="sm" href="/dashboard" />
          <button
            onClick={() => setMobileNavOpen(false)}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 space-y-1">
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
                onClick={() => setMobileNavOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors",
                  isActive
                    ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
