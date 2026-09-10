"use server";

import { createClient } from "@/lib/supabase/server";
import { Notification } from "@/types/database";

export async function getNotifications(): Promise<Notification[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return getDemoNotifications();
    }

    return data as Notification[];
  } catch {
    return getDemoNotifications();
  }
}

export async function markNotificationRead(id: string) {
  try {
    const supabase = await createClient();
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
  } catch {
    // ignore
  }
}

export async function markAllNotificationsRead() {
  try {
    const supabase = await createClient();
    await supabase.from("notifications").update({ is_read: true }).filter("is_read", "eq", false);
  } catch {
    // ignore
  }
}

function getDemoNotifications(): Notification[] {
  return [
    {
      id: "notif-1",
      business_id: "biz-demo",
      user_id: null,
      title: "Low Stock Alert: Ergonomic Task Chair Alpha",
      message: "Current inventory (3 units) is at or below the reorder threshold (8 units).",
      type: "stock_alert",
      is_read: false,
      link: "/dashboard/inventory",
      created_at: new Date(Date.now() - 25 * 60000).toISOString(),
    },
    {
      id: "notif-2",
      business_id: "biz-demo",
      user_id: null,
      title: "Invoice Overdue: INV-2026-077",
      message: "Invoice for Kinetics Fitness Co ($963.43) is 24 days past due date.",
      type: "invoice_overdue",
      is_read: false,
      link: "/dashboard/invoices",
      created_at: new Date(Date.now() - 3 * 3600000).toISOString(),
    },
    {
      id: "notif-3",
      business_id: "biz-demo",
      user_id: null,
      title: "New Sale Processed",
      message: "Apex Consulting LLC completed payment for INV-2026-089 ($3,420.70).",
      type: "new_sale",
      is_read: true,
      link: "/dashboard/sales",
      created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
    },
  ];
}
