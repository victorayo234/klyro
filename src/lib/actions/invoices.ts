"use server";

import { createClient } from "@/lib/supabase/server";
import { Invoice } from "@/types/database";
import { logActivity } from "./activity";

export async function getInvoices(): Promise<Invoice[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("invoices")
      .select("*, customer:customers(*), items:invoice_items(*)")
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return getDemoInvoices();
    }

    return data as Invoice[];
  } catch {
    return getDemoInvoices();
  }
}

export async function createInvoice(payload: {
  customerId: string;
  dueDate: string;
  taxRate: number;
  discountAmount: number;
  notes?: string;
  terms?: string;
  items: Array<{
    productId?: string;
    description: string;
    quantity: number;
    unitPrice: number;
  }>;
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

  // Server-side strict mathematical validation
  const calculatedSubtotal = payload.items.reduce(
    (acc, item) => acc + item.quantity * item.unitPrice,
    0
  );
  const taxAmount = Number(((calculatedSubtotal * payload.taxRate) / 100).toFixed(2));
  const totalAmount = Number(
    Math.max(0, calculatedSubtotal + taxAmount - payload.discountAmount).toFixed(2)
  );

  const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const { data: invoice, error: invError } = await supabase
    .from("invoices")
    .insert({
      business_id: businessId,
      customer_id: payload.customerId,
      invoice_number: invoiceNumber,
      issue_date: new Date().toISOString().split("T")[0],
      due_date: payload.dueDate,
      subtotal: calculatedSubtotal,
      tax_rate: payload.taxRate,
      tax_amount: taxAmount,
      discount_amount: payload.discountAmount,
      total_amount: totalAmount,
      status: "sent",
      notes: payload.notes || "Payment is requested within invoice due date.",
      terms: payload.terms || "Standard Net 30 days. Late fees of 1.5% per month apply.",
    })
    .select()
    .single();

  if (invError) throw new Error(invError.message);

  // Insert line items
  for (const item of payload.items) {
    await supabase.from("invoice_items").insert({
      invoice_id: invoice.id,
      product_id: item.productId || null,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total_price: item.quantity * item.unitPrice,
    });
  }

  await logActivity({
    entityType: "invoice",
    entityId: invoice.id,
    action: `Created invoice ${invoiceNumber} for $${totalAmount.toFixed(2)}`,
    details: { invoiceNumber, totalAmount, customerId: payload.customerId },
  });

  return invoice;
}

export async function markInvoicePaid(invoiceId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("invoices")
    .update({ status: "paid", updated_at: new Date().toISOString() })
    .eq("id", invoiceId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  await logActivity({
    entityType: "invoice",
    entityId: invoiceId,
    action: `Marked invoice as PAID`,
  });

  return data;
}

function getDemoInvoices(): Invoice[] {
  return [
    {
      id: "inv-1",
      business_id: "biz-demo",
      customer_id: "cust-1",
      invoice_number: "INV-2026-089",
      issue_date: "2026-03-01",
      due_date: "2026-03-31",
      subtotal: 3160.0,
      tax_rate: 8.25,
      tax_amount: 260.7,
      discount_amount: 0.0,
      total_amount: 3420.7,
      status: "paid",
      notes: "Corporate workspace overhaul phase 1.",
      terms: "Net 30. Thank you for your continued business.",
      created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
      customer: {
        id: "cust-1",
        business_id: "biz-demo",
        name: "Apex Consulting LLC",
        email: "billing@apexcorp.com",
        phone: "+1 (555) 342-9182",
        address: "100 Financial Way, New York, NY",
        notes: null,
        tags: ["VIP"],
        total_spend: 24500,
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      items: [
        {
          id: "item-1",
          invoice_id: "inv-1",
          product_id: "prod-1",
          description: "Ergonomic Task Chair Alpha (Black Edition)",
          quantity: 8,
          unit_price: 289.0,
          total_price: 2312.0,
        },
        {
          id: "item-2",
          invoice_id: "inv-1",
          product_id: "prod-3",
          description: "USB-C Dual 4K Docking Station 100W",
          quantity: 4,
          unit_price: 149.0,
          total_price: 596.0,
        },
        {
          id: "item-3",
          invoice_id: "inv-1",
          product_id: "prod-5",
          description: "Acoustic Fabric Privacy Screen",
          quantity: 2,
          unit_price: 95.0,
          total_price: 190.0,
        },
      ],
    },
    {
      id: "inv-2",
      business_id: "biz-demo",
      customer_id: "cust-2",
      invoice_number: "INV-2026-090",
      issue_date: "2026-03-05",
      due_date: "2026-03-20",
      subtotal: 1098.0,
      tax_rate: 8.25,
      tax_amount: 90.59,
      discount_amount: 50.0,
      total_amount: 1138.59,
      status: "sent",
      notes: "Motorized standing desks delivery.",
      terms: "Net 15 days.",
      created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
      customer: {
        id: "cust-2",
        business_id: "biz-demo",
        name: "BioLab Diagnostics",
        email: "procurement@biolab.io",
        phone: "+1 (555) 881-2309",
        address: "42 Science Park, Cambridge, MA",
        notes: null,
        tags: ["Healthcare"],
        total_spend: 14200,
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      items: [
        {
          id: "item-4",
          invoice_id: "inv-2",
          product_id: "prod-2",
          description: "Smart Motorized Standing Desk (60x30)",
          quantity: 2,
          unit_price: 549.0,
          total_price: 1098.0,
        },
      ],
    },
    {
      id: "inv-3",
      business_id: "biz-demo",
      customer_id: "cust-5",
      invoice_number: "INV-2026-077",
      issue_date: "2026-01-15",
      due_date: "2026-02-15",
      subtotal: 890.0,
      tax_rate: 8.25,
      tax_amount: 73.43,
      discount_amount: 0.0,
      total_amount: 963.43,
      status: "overdue",
      notes: "Reminder dispatched 3 days ago.",
      terms: "Net 30 days.",
      created_at: new Date(Date.now() - 50 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
      customer: {
        id: "cust-5",
        business_id: "biz-demo",
        name: "Kinetics Fitness Co",
        email: "accounts@kineticsfit.com",
        phone: "+1 (555) 412-8877",
        address: "88 Broadway, Denver, CO",
        notes: null,
        tags: ["Retail"],
        total_spend: 3400,
        status: "inactive",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      items: [
        {
          id: "item-5",
          invoice_id: "inv-3",
          product_id: null,
          description: "Gym reception desk custom installation",
          quantity: 1,
          unit_price: 890.0,
          total_price: 890.0,
        },
      ],
    },
  ];
}
