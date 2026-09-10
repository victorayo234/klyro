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

    if (error || !data || data.length === 0) {
      return getDemoProducts();
    }

    return data as Product[];
  } catch {
    return getDemoProducts();
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
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let businessId = "00000000-0000-0000-0000-000000000001";
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("business_id")
      .eq("id", user.id)
      .single();
    if (profile?.business_id) businessId = profile.business_id;
  }

  const { data, error } = await supabase
    .from("products")
    .insert({
      business_id: businessId,
      name: formData.name,
      sku: formData.sku,
      category: formData.category || "General",
      cost_price: formData.cost_price,
      sale_price: formData.sale_price,
      quantity: formData.quantity,
      reorder_threshold: formData.reorder_threshold,
      description: formData.description || null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  await logActivity({
    entityType: "product",
    entityId: data.id,
    action: `Added product ${formData.name} (SKU: ${formData.sku})`,
    details: { name: formData.name, sku: formData.sku, quantity: formData.quantity },
  });

  return data;
}

export async function adjustStock(productId: string, newQuantity: number, reason: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .update({ quantity: newQuantity, updated_at: new Date().toISOString() })
    .eq("id", productId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  await logActivity({
    entityType: "product",
    entityId: productId,
    action: `Adjusted inventory quantity to ${newQuantity}`,
    details: { newQuantity, reason },
  });

  return data;
}

export async function deleteProduct(productId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", productId);
  if (error) throw new Error(error.message);

  await logActivity({
    entityType: "product",
    entityId: productId,
    action: `Deleted product from inventory`,
  });
}

function getDemoProducts(): Product[] {
  return [
    {
      id: "prod-1",
      business_id: "biz-demo",
      name: "Ergonomic Task Chair Alpha",
      sku: "FUR-CHR-001",
      category: "Office Furniture",
      cost_price: 140.0,
      sale_price: 289.0,
      quantity: 3, // LOW STOCK (<= 8)
      reorder_threshold: 8,
      description: "Mesh breathable back, adjustable lumbar support and 4D armrests.",
      image_url: null,
      created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "prod-2",
      business_id: "biz-demo",
      name: "Smart Motorized Standing Desk (60x30)",
      sku: "FUR-DSK-010",
      category: "Office Furniture",
      cost_price: 290.0,
      sale_price: 549.0,
      quantity: 14,
      reorder_threshold: 5,
      description: "Dual motor electric adjustable height desk with memory keypad.",
      image_url: null,
      created_at: new Date(Date.now() - 45 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "prod-3",
      business_id: "biz-demo",
      name: "USB-C Dual 4K Docking Station",
      sku: "TECH-DOC-22",
      category: "Hardware & Tech",
      cost_price: 65.0,
      sale_price: 149.0,
      quantity: 4, // LOW STOCK (<= 10)
      reorder_threshold: 10,
      description: "100W Power Delivery, 2x HDMI 2.0, Gigabit Ethernet, 4x USB-A.",
      image_url: null,
      created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "prod-4",
      business_id: "biz-demo",
      name: "Wireless Active Noise Cancelling Headset",
      sku: "AUD-HD-99",
      category: "Hardware & Tech",
      cost_price: 52.0,
      sale_price: 119.0,
      quantity: 38,
      reorder_threshold: 12,
      description: "Bluetooth 5.3, 40-hour battery life, AI noise-filtering microphone.",
      image_url: null,
      created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "prod-5",
      business_id: "biz-demo",
      name: "Acoustic Fabric Privacy Screen 48-inch",
      sku: "FUR-DIV-05",
      category: "Acoustics & Partition",
      cost_price: 45.0,
      sale_price: 95.0,
      quantity: 2, // LOW STOCK (<= 6)
      reorder_threshold: 6,
      description: "Sound-absorbing desk mounted acoustic felt privacy divider.",
      image_url: null,
      created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];
}
