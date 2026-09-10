"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logActivity } from "./activity";

export async function processDueRecurringInvoices() {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  // Find all active recurring invoices where next_issue_date <= today
  const { data: recurringTemplates, error } = await supabase
    .from("invoices")
    .select("*, invoice_items(*)")
    .eq("is_recurring", true)
    .neq("status", "cancelled")
    .lte("next_issue_date", today);

  if (error) {
    console.error("Error fetching due recurring invoices:", error.message);
    return { success: false, count: 0, error: error.message };
  }

  if (!recurringTemplates || recurringTemplates.length === 0) {
    return { success: true, count: 0, message: "No recurring invoices are currently due." };
  }

  let generatedCount = 0;

  for (const template of recurringTemplates) {
    try {
      // Generate new invoice sequence number
      const seq = Math.floor(1000 + Math.random() * 9000);
      const newInvoiceNumber = `INV-${new Date().getFullYear()}-${seq}`;

      // Calculate new due date (default Net 30 from today)
      const dueDateObj = new Date();
      dueDateObj.setDate(dueDateObj.getDate() + 30);
      const newDueDate = dueDateObj.toISOString().split("T")[0];

      // Insert new child invoice
      const { data: newInvoice, error: invError } = await supabase
        .from("invoices")
        .insert({
          business_id: template.business_id,
          customer_id: template.customer_id,
          invoice_number: newInvoiceNumber,
          issue_date: today,
          due_date: newDueDate,
          subtotal: template.subtotal,
          tax_rate: template.tax_rate,
          tax_amount: template.tax_amount,
          discount_amount: template.discount_amount,
          total_amount: template.total_amount,
          status: template.auto_send ? "sent" : "draft",
          notes: template.notes,
          terms: template.terms,
          is_recurring: false, // The child is not recurring itself
        })
        .select()
        .single();

      if (invError || !newInvoice) continue;

      // Clone items
      if (template.invoice_items && template.invoice_items.length > 0) {
        const itemRows = template.invoice_items.map((it: {
          product_id: string | null;
          description: string;
          quantity: number;
          unit_price: number;
          total_price: number;
        }) => ({
          invoice_id: newInvoice.id,
          product_id: it.product_id,
          description: it.description,
          quantity: it.quantity,
          unit_price: it.unit_price,
          total_price: it.total_price,
        }));
        await supabase.from("invoice_items").insert(itemRows);
      }

      // Advance next_issue_date on parent template
      const nextDate = new Date();
      const interval = template.recurrence_interval || "monthly";
      if (interval === "weekly") nextDate.setDate(nextDate.getDate() + 7);
      else if (interval === "monthly") nextDate.setMonth(nextDate.getMonth() + 1);
      else if (interval === "quarterly") nextDate.setMonth(nextDate.getMonth() + 3);
      else if (interval === "yearly") nextDate.setFullYear(nextDate.getFullYear() + 1);

      await supabase
        .from("invoices")
        .update({
          next_issue_date: nextDate.toISOString().split("T")[0],
          updated_at: new Date().toISOString(),
        })
        .eq("id", template.id);

      // Log activity
      await logActivity({
        entityType: "invoice",
        entityId: newInvoice.id,
        action: `Auto-generated recurring invoice ${newInvoiceNumber}`,
        details: { parent_template_id: template.id, interval },
      });

      generatedCount++;
    } catch (itemErr) {
      console.error("Failed to generate child recurring invoice:", itemErr);
    }
  }

  revalidatePath("/dashboard/invoices");
  return {
    success: true,
    count: generatedCount,
    message: `Generated ${generatedCount} recurring invoice${generatedCount !== 1 ? "s" : ""}.`,
  };
}
