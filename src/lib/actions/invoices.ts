"use server";

import { createClient } from "@/lib/supabase/server";
import { Invoice, InvoiceStatus, RecurrenceInterval } from "@/types/database";
import { logActivity } from "./activity";

export async function getInvoices(): Promise<Invoice[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("invoices")
      .select("*, customer:customers(*), items:invoice_items(*)")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Error fetching invoices from Supabase:", error.message);
      return [];
    }

    return (data || []) as Invoice[];
  } catch {
    return [];
  }
}

export async function createInvoice(payload: {
  customerId: string;
  dueDate: string;
  taxRate: number;
  discountAmount: number;
  notes?: string;
  terms?: string;
  isRecurring?: boolean;
  recurrenceInterval?: RecurrenceInterval;
  autoSend?: boolean;
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

  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("profiles")
    .select("business_id")
    .eq("id", user.id)
    .single();

  if (!profile?.business_id) throw new Error("Business profile not found");

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

  // Compute next_issue_date if recurring
  let nextIssueDate: string | null = null;
  if (payload.isRecurring) {
    const nextDate = new Date();
    const interval = payload.recurrenceInterval || "monthly";
    if (interval === "weekly") nextDate.setDate(nextDate.getDate() + 7);
    else if (interval === "monthly") nextDate.setMonth(nextDate.getMonth() + 1);
    else if (interval === "quarterly") nextDate.setMonth(nextDate.getMonth() + 3);
    else if (interval === "yearly") nextDate.setFullYear(nextDate.getFullYear() + 1);
    nextIssueDate = nextDate.toISOString().split("T")[0];
  }

  const { data: invoice, error: invError } = await supabase
    .from("invoices")
    .insert({
      business_id: profile.business_id,
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
      is_recurring: payload.isRecurring || false,
      recurrence_interval: payload.recurrenceInterval || null,
      next_issue_date: nextIssueDate,
      auto_send: payload.autoSend || false,
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
    action: `Created invoice ${invoiceNumber} for $${totalAmount.toFixed(2)}${payload.isRecurring ? " (Recurring)" : ""}`,
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

export async function updateInvoiceStatus(invoiceId: string, status: InvoiceStatus) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("invoices")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", invoiceId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  await logActivity({
    entityType: "invoice",
    entityId: invoiceId,
    action: `Updated invoice status to ${status.toUpperCase()}`,
  });

  return data;
}

export async function deleteInvoice(invoiceId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("invoices").delete().eq("id", invoiceId);
  if (error) throw new Error(error.message);

  await logActivity({
    entityType: "invoice",
    entityId: invoiceId,
    action: `Deleted invoice`,
  });
}

export async function bulkDeleteInvoices(ids: string[]) {
  if (ids.length === 0) return;
  const supabase = await createClient();
  const { error } = await supabase.from("invoices").delete().in("id", ids);
  if (error) throw new Error(error.message);

  await logActivity({
    entityType: "invoice",
    action: `Bulk deleted ${ids.length} invoices`,
    details: { count: ids.length },
  });
}

export async function bulkUpdateInvoiceStatus(ids: string[], status: InvoiceStatus) {
  if (ids.length === 0) return;
  const supabase = await createClient();
  const { error } = await supabase
    .from("invoices")
    .update({ status, updated_at: new Date().toISOString() })
    .in("id", ids);
  if (error) throw new Error(error.message);

  await logActivity({
    entityType: "invoice",
    action: `Bulk updated status to ${status} for ${ids.length} invoices`,
    details: { count: ids.length, status },
  });
}
