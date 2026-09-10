"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logActivity } from "./activity";

export async function updateBusinessSettings(updates: {
  name?: string;
  industry?: string;
  currency?: string;
  timezone?: string;
  address?: string;
  contact_email?: string;
  team_size_bracket?: string;
  primary_goal?: string;
  monthly_revenue_target?: number;
  monthly_profit_target?: number;
  custom_fields_config?: Record<string, unknown>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("profiles")
    .select("business_id, role")
    .eq("id", user.id)
    .single();

  if (!profile?.business_id) throw new Error("Business profile not found");
  if (profile.role !== "owner" && profile.role !== "admin") {
    throw new Error("Only owners or admins can update business settings");
  }

  const { error } = await supabase
    .from("businesses")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", profile.business_id);

  if (error) throw new Error(error.message);

  await logActivity({
    entityType: "business",
    entityId: profile.business_id,
    action: "Updated workspace settings and configurations",
    details: updates,
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function exportAllBusinessData() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("profiles")
    .select("business_id, role")
    .eq("id", user.id)
    .single();

  if (!profile?.business_id) throw new Error("Business profile not found");

  // Fetch all business collections in parallel
  const [
    { data: business },
    { data: customers },
    { data: products },
    { data: sales },
    { data: expenses },
    { data: invoices },
    { data: activities },
  ] = await Promise.all([
    supabase.from("businesses").select("*").eq("id", profile.business_id).single(),
    supabase.from("customers").select("*").eq("business_id", profile.business_id),
    supabase.from("products").select("*").eq("business_id", profile.business_id),
    supabase.from("sales").select("*, sale_items(*)").eq("business_id", profile.business_id),
    supabase.from("expenses").select("*").eq("business_id", profile.business_id),
    supabase.from("invoices").select("*, invoice_items(*)").eq("business_id", profile.business_id),
    supabase.from("activity_logs").select("*").eq("business_id", profile.business_id).limit(200),
  ]);

  await logActivity({
    entityType: "business",
    entityId: profile.business_id,
    action: "Exported complete workspace data archive",
  });

  return {
    exported_at: new Date().toISOString(),
    business: business || {},
    customers: customers || [],
    products: products || [],
    sales: sales || [],
    expenses: expenses || [],
    invoices: invoices || [],
    activity_logs: activities || [],
  };
}
