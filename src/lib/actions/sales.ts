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

    if (error || !data || data.length === 0) {
      return getDemoSales();
    }

    return data as Sale[];
  } catch {
    return getDemoSales();
  }
}

export async function getExpenses(): Promise<Expense[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .order("expense_date", { ascending: false });

    if (error || !data || data.length === 0) {
      return getDemoExpenses();
    }

    return data as Expense[];
  } catch {
    return getDemoExpenses();
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

  let businessId = "00000000-0000-0000-0000-000000000001";
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("business_id")
      .eq("id", user.id)
      .single();
    if (profile?.business_id) businessId = profile.business_id;
  }

  // Calculate subtotal & tax (8%)
  const subtotal = payload.items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
  const tax = Number((subtotal * 0.08).toFixed(2));
  const totalAmount = subtotal + tax;

  // Insert sale record
  const { data: sale, error: saleError } = await supabase
    .from("sales")
    .insert({
      business_id: businessId,
      customer_id: payload.customerId || null,
      subtotal,
      tax,
      discount: 0,
      total_amount: totalAmount,
      payment_method: payload.paymentMethod,
      status: "completed",
      notes: payload.notes || null,
      created_by: user?.id || null,
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
    .from("expenses")
    .insert({
      business_id: businessId,
      category: formData.category,
      vendor: formData.vendor,
      amount: formData.amount,
      expense_date: formData.expenseDate || new Date().toISOString(),
      notes: formData.notes || null,
      created_by: user?.id || null,
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

function getDemoSales(): Sale[] {
  return [
    {
      id: "sale-101",
      business_id: "biz-demo",
      customer_id: "cust-1",
      sale_date: new Date(Date.now() - 1 * 86400000).toISOString(),
      subtotal: 1156.0,
      tax: 92.48,
      discount: 0,
      total_amount: 1248.48,
      payment_method: "bank_transfer",
      status: "completed",
      notes: "4x Ergonomic Task Chairs delivered to HQ.",
      created_by: "usr-alex",
      created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
      customer: {
        id: "cust-1",
        business_id: "biz-demo",
        name: "Apex Consulting LLC",
        email: "billing@apexcorp.com",
        phone: "+1 (555) 342-9182",
        address: "New York, NY",
        notes: null,
        tags: ["VIP"],
        total_spend: 24500,
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    },
    {
      id: "sale-102",
      business_id: "biz-demo",
      customer_id: "cust-2",
      sale_date: new Date(Date.now() - 3 * 86400000).toISOString(),
      subtotal: 1098.0,
      tax: 87.84,
      discount: 0,
      total_amount: 1185.84,
      payment_method: "credit_card",
      status: "completed",
      notes: "2x Motorized Standing Desks.",
      created_by: "usr-alex",
      created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      customer: {
        id: "cust-2",
        business_id: "biz-demo",
        name: "BioLab Diagnostics",
        email: "procurement@biolab.io",
        phone: "+1 (555) 881-2309",
        address: "Cambridge, MA",
        notes: null,
        tags: ["Healthcare"],
        total_spend: 14200,
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    },
    {
      id: "sale-103",
      business_id: "biz-demo",
      customer_id: "cust-3",
      sale_date: new Date(Date.now() - 5 * 86400000).toISOString(),
      subtotal: 596.0,
      tax: 47.68,
      discount: 0,
      total_amount: 643.68,
      payment_method: "credit_card",
      status: "completed",
      notes: "Docking stations and headsets.",
      created_by: "usr-alex",
      created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
      customer: {
        id: "cust-3",
        business_id: "biz-demo",
        name: "Solarium Studios",
        email: "clara@solarium.design",
        phone: "+1 (555) 712-4491",
        address: "San Francisco, CA",
        notes: null,
        tags: ["Design"],
        total_spend: 6850,
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    },
  ];
}

function getDemoExpenses(): Expense[] {
  return [
    {
      id: "exp-1",
      business_id: "biz-demo",
      category: "Software & SaaS",
      vendor: "Amazon Web Services",
      amount: 420.0,
      expense_date: new Date(Date.now() - 2 * 86400000).toISOString(),
      notes: "Cloud hosting and database instances",
      receipt_url: null,
      created_by: "usr-alex",
      created_at: new Date().toISOString(),
    },
    {
      id: "exp-2",
      business_id: "biz-demo",
      category: "Logistics & Freight",
      vendor: "FedEx Freight Corp",
      amount: 650.0,
      expense_date: new Date(Date.now() - 6 * 86400000).toISOString(),
      notes: "Pallet shipment from manufacturing hub",
      receipt_url: null,
      created_by: "usr-alex",
      created_at: new Date().toISOString(),
    },
    {
      id: "exp-3",
      business_id: "biz-demo",
      category: "Office & Facilities",
      vendor: "WeWork Global",
      amount: 1200.0,
      expense_date: new Date(Date.now() - 10 * 86400000).toISOString(),
      notes: "Dedicated team room monthly rent",
      receipt_url: null,
      created_by: "usr-alex",
      created_at: new Date().toISOString(),
    },
    {
      id: "exp-4",
      business_id: "biz-demo",
      category: "Marketing & Growth",
      vendor: "Google Ads",
      amount: 850.0,
      expense_date: new Date(Date.now() - 14 * 86400000).toISOString(),
      notes: "High-intent search campaign for commercial office refits",
      receipt_url: null,
      created_by: "usr-alex",
      created_at: new Date().toISOString(),
    },
  ];
}
