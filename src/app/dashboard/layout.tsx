import * as React from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { CommandPalette } from "@/components/dashboard/command-palette";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let businessName = "Acme Global Solutions";
  let userRole = "Owner";
  let userName = "Alex Morgan";
  let lowStockCount = 3;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, role, business_id, businesses(name)")
        .eq("id", user.id)
        .single();

      if (profile) {
        userName = profile.full_name || user.email?.split("@")[0] || userName;
        userRole = (profile.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : userRole);
        if (profile.businesses && typeof profile.businesses === "object" && "name" in profile.businesses) {
          businessName = (profile.businesses as { name: string }).name;
        }

        // Count low-stock items
        if (profile.business_id) {
          const { count } = await supabase
            .from("products")
            .select("id", { count: "exact", head: true })
            .eq("business_id", profile.business_id)
            .filter("quantity", "lte", "reorder_threshold");
          
          if (typeof count === "number") lowStockCount = count;
        }
      }
    }
  } catch {
    // If Supabase is still connecting or tables initializing, fallback gracefully
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50/50 dark:bg-slate-950">
      <Sidebar
        businessName={businessName}
        userRole={userRole}
        userName={userName}
        lowStockCount={lowStockCount}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar businessName={businessName} unreadNotificationsCount={2} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">{children}</div>
        </main>
      </div>
      <MobileNav />
      <CommandPalette />
    </div>
  );
}
