"use server";

import { createClient } from "@/lib/supabase/server";
import { Product } from "@/types/database";
import { logActivity } from "./activity";

export async function getProducts(): Promise<Product[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Error fetching products from Supabase:", error.message);
      return [];
    }

    return (data || []) as Product[];
  } catch {
    return [];
  }
}

export async function createProduct(formData: {
  name: string;
  sku: string;
  category?: string;
  cost_price: number;
  sale_price: number;
  quantity: number;
  reorder_threshold: number;
  description?: string;
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
    .from("products")
    .insert({
      business_id: profile.business_id,
      name: formData.name,
      sku: formData.sku,
      category: formData.category || "General",
      cost_price: formData.cost_price,
      sale_price: formData.sale_price,
      quantity: formData.quantity,
      reorder_threshold: formData.reorder_threshold,
      description: formData.description || null,
      custom_fields: formData.custom_fields || {},
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  await logActivity({
    entityType: "product",
    entityId: data.id,
    action: `Created product ${formData.name} (${formData.sku})`,
    details: { name: formData.name, sku: formData.sku, quantity: formData.quantity },
  });

  return data;
}

export async function updateProduct(
  id: string,
  updates: Partial<Product>
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  await logActivity({
    entityType: "product",
    entityId: id,
    action: `Updated product ${updates.name || id}`,
    details: updates,
  });

  return data;
}

export async function deleteProduct(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);

  await logActivity({
    entityType: "product",
    entityId: id,
    action: `Deleted product`,
  });
}

export async function bulkDeleteProducts(ids: string[]) {
  if (ids.length === 0) return;
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().in("id", ids);
  if (error) throw new Error(error.message);

  await logActivity({
    entityType: "product",
    action: `Bulk deleted ${ids.length} products`,
    details: { count: ids.length, ids },
  });
}

export async function bulkRestockProducts(items: Array<{ id: string; addQuantity: number }>) {
  if (items.length === 0) return;
  const supabase = await createClient();

  for (const item of items) {
    const { data: prod } = await supabase.from("products").select("quantity").eq("id", item.id).single();
    if (prod) {
      await supabase
        .from("products")
        .update({ quantity: (prod.quantity || 0) + item.addQuantity, updated_at: new Date().toISOString() })
        .eq("id", item.id);
    }
  }

  await logActivity({
    entityType: "product",
    action: `Restocked ${items.length} products`,
    details: { count: items.length },
  });
}

export async function batchImportProducts(
  records: Array<{
    name: string;
    sku: string;
    category?: string | null;
    cost_price?: number;
    sale_price?: number;
    quantity?: number;
    reorder_threshold?: number;
    description?: string | null;
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
    sku: r.sku,
    category: r.category || "General",
    cost_price: r.cost_price ?? 0,
    sale_price: r.sale_price ?? 0,
    quantity: r.quantity ?? 0,
    reorder_threshold: r.reorder_threshold ?? 5,
    description: r.description || null,
    custom_fields: r.custom_fields || {},
  }));

  const { data, error } = await supabase.from("products").upsert(rows, { onConflict: "business_id,sku" }).select("id");
  if (error) throw new Error(error.message);

  await logActivity({
    entityType: "product",
    action: `Batch imported ${data.length} products from CSV`,
    details: { count: data.length },
  });

  return { count: data.length };
}
