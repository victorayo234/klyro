"use server";

import { createClient } from "@/lib/supabase/server";
import { Customer } from "@/types/database";
import { logActivity } from "./activity";

export async function getCustomers(): Promise<Customer[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Error fetching customers from Supabase:", error.message);
      return [];
    }

    return (data || []) as Customer[];
  } catch {
    return [];
  }
}

export async function createCustomer(formData: {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  tags?: string[];
  status?: "active" | "inactive" | "lead";
  custom_fields?: Record<string, string>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("profiles")
    .select("business_id")
    .eq("id", user.id)
    .single();

  if (!profile?.business_id) throw new Error("Business profile not found");

  const { data, error } = await supabase
    .from("customers")
    .insert({
      business_id: profile.business_id,
      name: formData.name,
      email: formData.email || null,
      phone: formData.phone || null,
      address: formData.address || null,
      notes: formData.notes || null,
      tags: formData.tags || [],
      status: formData.status || "active",
      custom_fields: formData.custom_fields || {},
      total_spend: 0,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  await logActivity({
    entityType: "customer",
    entityId: data.id,
    action: `Created customer ${formData.name}`,
    details: { name: formData.name, email: formData.email },
  });

  return data;
}

export async function updateCustomer(
  id: string,
  updates: Partial<Customer>
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customers")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  await logActivity({
    entityType: "customer",
    entityId: id,
    action: `Updated customer ${updates.name || id}`,
    details: updates,
  });

  return data;
}

export async function deleteCustomer(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("customers").delete().eq("id", id);
  if (error) throw new Error(error.message);

  await logActivity({
    entityType: "customer",
    entityId: id,
    action: `Deleted customer`,
  });
}

export async function bulkDeleteCustomers(ids: string[]) {
  if (ids.length === 0) return;
  const supabase = await createClient();
  const { error } = await supabase.from("customers").delete().in("id", ids);
  if (error) throw new Error(error.message);

  await logActivity({
    entityType: "customer",
    action: `Bulk deleted ${ids.length} customers`,
    details: { count: ids.length, ids },
  });
}

export async function bulkUpdateCustomerStatus(ids: string[], status: "active" | "inactive" | "lead") {
  if (ids.length === 0) return;
  const supabase = await createClient();
  const { error } = await supabase
    .from("customers")
    .update({ status, updated_at: new Date().toISOString() })
    .in("id", ids);
  if (error) throw new Error(error.message);

  await logActivity({
    entityType: "customer",
    action: `Bulk updated status to ${status} for ${ids.length} customers`,
    details: { count: ids.length, status },
  });
}

export async function batchImportCustomers(
  records: Array<{
    name: string;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    notes?: string | null;
    tags?: string[];
    custom_fields?: Record<string, string>;
  }>
) {
  if (records.length === 0) return { count: 0 };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("profiles")
    .select("business_id")
    .eq("id", user.id)
    .single();

  if (!profile?.business_id) throw new Error("Business profile not found");

  const rows = records.map((r) => ({
    business_id: profile.business_id,
    name: r.name,
    email: r.email || null,
    phone: r.phone || null,
    address: r.address || null,
    notes: r.notes || null,
    tags: r.tags || [],
    status: "active" as const,
    total_spend: 0,
    custom_fields: r.custom_fields || {},
  }));

  const { data, error } = await supabase.from("customers").insert(rows).select("id");
  if (error) throw new Error(error.message);

  await logActivity({
    entityType: "customer",
    action: `Batch imported ${data.length} customers from CSV`,
    details: { count: data.length },
  });

  return { count: data.length };
}
