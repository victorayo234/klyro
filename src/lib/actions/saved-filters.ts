"use server";

import { createClient } from "@/lib/supabase/server";
import { SavedFilter } from "@/types/database";

export async function getSavedFilters(tableName: "customers" | "inventory" | "invoices" | "sales"): Promise<SavedFilter[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data: profile } = await supabase
      .from("profiles")
      .select("business_id")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile?.business_id) return [];

    const { data, error } = await supabase
      .from("saved_filters")
      .select("*")
      .eq("business_id", profile.business_id)
      .eq("table_name", tableName)
      .order("created_at", { ascending: false });

    if (error) return [];
    return (data || []) as SavedFilter[];
  } catch {
    return [];
  }
}

export async function createSavedFilter(
  tableName: "customers" | "inventory" | "invoices" | "sales",
  name: string,
  filterCriteria: Record<string, unknown>
) {
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
    .from("saved_filters")
    .insert({
      business_id: profile.business_id,
      user_id: user.id,
      table_name: tableName,
      name,
      filter_criteria: filterCriteria,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as SavedFilter;
}

export async function deleteSavedFilter(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("saved_filters").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
