"use server";

import { createClient } from "@/lib/supabase/server";
import { ActivityLog } from "@/types/database";

export async function getActivityLogs(): Promise<ActivityLog[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("activity_logs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return getDemoActivityLogs();
    }

    return data as ActivityLog[];
  } catch {
    return getDemoActivityLogs();
  }
}

function getDemoActivityLogs(): ActivityLog[] {
  return [
    {
      id: "log-1",
      business_id: "biz-demo",
      user_id: "usr-1",
      user_name: "Alex Morgan",
      entity_type: "invoice",
      entity_id: "inv-1",
      action: "Marked invoice INV-2026-089 as PAID ($3,420.70)",
      details: { invoiceNumber: "INV-2026-089", amount: 3420.7 },
      created_at: new Date(Date.now() - 35 * 60000).toISOString(),
    },
    {
      id: "log-2",
      business_id: "biz-demo",
      user_id: "usr-1",
      user_name: "Alex Morgan",
      entity_type: "product",
      entity_id: "prod-1",
      action: "Adjusted stock for Ergonomic Task Chair Alpha: 5 -> 3",
      details: { oldQty: 5, newQty: 3, reason: "Showroom floor unit allocation" },
      created_at: new Date(Date.now() - 3 * 3600000).toISOString(),
    },
    {
      id: "log-3",
      business_id: "biz-demo",
      user_id: "usr-2",
      user_name: "Elena Rostova",
      entity_type: "sale",
      entity_id: "sale-101",
      action: "Recorded new sale: $1,248.48 for Apex Consulting LLC",
      details: { totalAmount: 1248.48, customerName: "Apex Consulting LLC" },
      created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
    },
    {
      id: "log-4",
      business_id: "biz-demo",
      user_id: "usr-1",
      user_name: "Alex Morgan",
      entity_type: "expense",
      entity_id: "exp-1",
      action: "Logged expense: $420.00 to Amazon Web Services (Software & SaaS)",
      details: { amount: 420.0, category: "Software & SaaS" },
      created_at: new Date(Date.now() - 48 * 3600000).toISOString(),
    },
    {
      id: "log-5",
      business_id: "biz-demo",
      user_id: "usr-1",
      user_name: "Alex Morgan",
      entity_type: "customer",
      entity_id: "cust-4",
      action: "Added new prospective customer: Vanguard Logistics",
      details: { name: "Vanguard Logistics", status: "lead" },
      created_at: new Date(Date.now() - 72 * 3600000).toISOString(),
    },
  ];
}
