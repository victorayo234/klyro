import * as React from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { CommandPalette } from "@/components/dashboard/command-palette";
import { createClient } from "@/lib/supabase/server";
import { getTerminology } from "@/lib/terminology";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let businessName = "Workspace";
  let userRole = "Owner";
  let userName = "Team Member";
  let lowStockCount = 0;
  let unreadNotificationsCount = 0;
  let industry = "General";

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, role, business_id, businesses(name, industry)")
        .eq("id", user.id)
        .single();

      if (profile) {
        userName = profile.full_name || user.email?.split("@")[0] || "User";
        userRole = profile.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : "Staff";
        
        if (profile.businesses && typeof profile.businesses === "object") {
          const b = profile.businesses as { name?: string; industry?: string };
          if (b.name) businessName = b.name;
          if (b.industry) industry = b.industry;
        }

        if (profile.business_id) {
          // Real low-stock count
          const { count: stockCount } = await supabase
            .from("products")
            .select("id", { count: "exact", head: true })
            .eq("business_id", profile.business_id)
            .filter("quantity", "lte", "reorder_threshold");
          
          if (typeof stockCount === "number") lowStockCount = stockCount;

          // Real unread notifications count
          const { count: notifCount } = await supabase
            .from("notifications")
            .select("id", { count: "exact", head: true })
            .eq("business_id", profile.business_id)
            .eq("is_read", false);

          if (typeof notifCount === "number") unreadNotificationsCount = notifCount;
        }
      }
    }
  } catch {
    // Graceful fallback
  }

  const terminology = getTerminology(industry);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50/50 dark:bg-slate-950">
      <Sidebar
        businessName={businessName}
        userRole={userRole}
        userName={userName}
        lowStockCount={lowStockCount}
        terminology={terminology}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar
          businessName={businessName}
          unreadNotificationsCount={unreadNotificationsCount}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">{children}</div>
        </main>
      </div>
      <MobileNav terminology={terminology} />
      <CommandPalette />
    </div>
  );
}
