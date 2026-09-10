"use server";

import { createClient } from "@/lib/supabase/server";
import { Sale, Expense } from "@/types/database";
import { logActivity } from "./activity";

export async function getSales(): Promise<Sale[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("sales")
      .select("*, customer:customers(*), items:sale_items(*, product:products(*))")
      .order("sale_date", { ascending: false });

    if (error) {
      console.warn("Error fetching sales from Supabase:", error.message);
      return [];
    }

    return (data || []) as Sale[];
  } catch {
    return [];
  }
}

export async function getExpenses(): Promise<Expense[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .order("expense_date", { ascending: false });

    if (error) {
      console.warn("Error fetching expenses from Supabase:", error.message);
      return [];
    }

    return (data || []) as Expense[];
  } catch {
    return [];
  }
}

export async function recordSale(payload: {
  customerId?: string;
  items: Array<{ productId: string; quantity: number; unitPrice: number }>;
  paymentMethod: "credit_card" | "bank_transfer" | "cash" | "other";
  notes?: string;
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

  // Calculate subtotal & tax (8%)
  const subtotal = payload.items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
  const tax = Number((subtotal * 0.08).toFixed(2));
  const totalAmount = subtotal + tax;

  // Insert sale record
  const { data: sale, error: saleError } = await supabase
    .from("sales")
    .insert({
      business_id: profile.business_id,
      customer_id: payload.customerId || null,
      subtotal,
      tax,
      discount: 0,
      total_amount: totalAmount,
      payment_method: payload.paymentMethod,
      status: "completed",
      notes: payload.notes || null,
      created_by: user.id,
    })
    .select()
    .single();

  if (saleError) throw new Error(saleError.message);

  // Insert line items & decrement stock
  for (const item of payload.items) {
    await supabase.from("sale_items").insert({
      sale_id: sale.id,
      product_id: item.productId,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total_price: item.quantity * item.unitPrice,
    });

    // Auto-decrement product stock
    const { data: currentProduct } = await supabase
      .from("products")
      .select("quantity")
      .eq("id", item.productId)
      .single();

    if (currentProduct) {
      const newQty = Math.max(0, currentProduct.quantity - item.quantity);
      await supabase.from("products").update({ quantity: newQty }).eq("id", item.productId);
    }
  }

  await logActivity({
    entityType: "sale",
    entityId: sale.id,
    action: `Recorded sale of $${totalAmount.toFixed(2)}`,
    details: { totalAmount, itemCount: payload.items.length },
  });

  return sale;
}

export async function createExpense(formData: {
  category: string;
  vendor: string;
  amount: number;
  notes?: string;
  expenseDate?: string;
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
    .from("expenses")
    .insert({
      business_id: profile.business_id,
      category: formData.category,
      vendor: formData.vendor,
      amount: formData.amount,
      expense_date: formData.expenseDate || new Date().toISOString(),
      notes: formData.notes || null,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  await logActivity({
    entityType: "expense",
    entityId: data.id,
    action: `Logged expense: $${formData.amount} to ${formData.vendor} (${formData.category})`,
    details: formData,
  });

  return data;
}

export async function bulkDeleteSales(ids: string[]) {
  if (ids.length === 0) return;
  const supabase = await createClient();
  const { error } = await supabase.from("sales").delete().in("id", ids);
  if (error) throw new Error(error.message);

  await logActivity({
    entityType: "sale",
    action: `Bulk deleted ${ids.length} sales`,
    details: { count: ids.length },
  });
}
