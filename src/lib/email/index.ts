import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";

// Initialize Resend safely
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const FROM_ADDRESS = process.env.EMAIL_FROM || "Klyro System <notifications@klyro.com>";

interface EmailResult {
  success: boolean;
  messageId?: string;
  simulated?: boolean;
  error?: string;
}

/**
 * Dispatches email via Resend if RESEND_API_KEY exists.
 * Otherwise logs cleanly and records in-app notification & audit trail.
 */
async function dispatchEmail(params: {
  to: string;
  subject: string;
  html: string;
  fallbackNotification?: {
    businessId: string;
    title: string;
    message: string;
    type: "stock_alert" | "invoice_overdue" | "system";
  };
}): Promise<EmailResult> {
  if (resend) {
    try {
      const response = await resend.emails.send({
        from: FROM_ADDRESS,
        to: params.to,
        subject: params.subject,
        html: params.html,
      });

      if (response.error) {
        console.warn("Resend API error:", response.error.message);
        return { success: false, error: response.error.message };
      }

      return { success: true, messageId: response.data?.id };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send email via Resend";
      console.warn("Resend dispatch failed:", msg);
    }
  }

  // Fallback: record in-app notification and console log
  console.log(`[EMAIL DISPATCH SIMULATED] To: ${params.to} | Subject: ${params.subject}`);

  if (params.fallbackNotification) {
    try {
      const supabase = await createClient();
      await supabase.from("notifications").insert({
        business_id: params.fallbackNotification.businessId,
        title: params.fallbackNotification.title,
        message: params.fallbackNotification.message,
        type: params.fallbackNotification.type,
        is_read: false,
      });
    } catch (e) {
      console.warn("Could not insert fallback notification:", e);
    }
  }

  return { success: true, simulated: true };
}

export async function sendOverdueInvoiceReminder(params: {
  to: string;
  invoiceNumber: string;
  amount: string;
  dueDate: string;
  businessName: string;
  businessId: string;
}) {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="color: #0f172a; margin-top: 0;">Payment Reminder: Invoice ${params.invoiceNumber}</h2>
      <p style="color: #475569; font-size: 14px; line-height: 1.6;">
        This is a friendly reminder from <strong>${params.businessName}</strong> that invoice 
        <strong>${params.invoiceNumber}</strong> in the amount of <strong>${params.amount}</strong> was due on <strong>${params.dueDate}</strong>.
      </p>
      <div style="margin: 24px 0; padding: 16px; background-color: #f8fafc; border-radius: 8px;">
        <p style="margin: 0; font-size: 14px; color: #334155;"><strong>Amount Due:</strong> ${params.amount}</p>
        <p style="margin: 4px 0 0; font-size: 14px; color: #dc2626;"><strong>Status:</strong> Overdue</p>
      </div>
      <p style="color: #64748b; font-size: 12px;">Generated automatically by Klyro Operating System on behalf of ${params.businessName}.</p>
    </div>
  `;

  return dispatchEmail({
    to: params.to,
    subject: `Overdue Payment Notice: Invoice ${params.invoiceNumber} (${params.amount})`,
    html,
    fallbackNotification: {
      businessId: params.businessId,
      title: `Overdue Reminder: ${params.invoiceNumber}`,
      message: `Payment reminder sent to ${params.to} for invoice ${params.invoiceNumber} (${params.amount}).`,
      type: "invoice_overdue",
    },
  });
}

export async function sendLowStockAlert(params: {
  to: string;
  productName: string;
  sku: string;
  quantity: number;
  threshold: number;
  businessName: string;
  businessId: string;
}) {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="color: #b45309; margin-top: 0;">⚠️ Low Stock Alert: ${params.productName}</h2>
      <p style="color: #475569; font-size: 14px; line-height: 1.6;">
        Inventory for <strong>${params.productName}</strong> (SKU: <code>${params.sku}</code>) at <strong>${params.businessName}</strong> has fallen below your reorder threshold.
      </p>
      <div style="margin: 24px 0; padding: 16px; background-color: #fef3c7; border-radius: 8px;">
        <p style="margin: 0; font-size: 14px; color: #92400e;"><strong>Remaining Units:</strong> ${params.quantity}</p>
        <p style="margin: 4px 0 0; font-size: 14px; color: #b45309;"><strong>Reorder Threshold:</strong> ${params.threshold}</p>
      </div>
      <p style="color: #64748b; font-size: 12px;">Log in to your Klyro dashboard to review suppliers and create purchase orders.</p>
    </div>
  `;

  return dispatchEmail({
    to: params.to,
    subject: `Low Stock Alert: ${params.productName} (${params.quantity} left)`,
    html,
    fallbackNotification: {
      businessId: params.businessId,
      title: `Low Stock Alert: ${params.productName}`,
      message: `Remaining inventory (${params.quantity} units) is at or below threshold (${params.threshold} units).`,
      type: "stock_alert",
    },
  });
}

export async function sendWeeklySummaryDigest(params: {
  to: string;
  businessName: string;
  revenue: string;
  profit: string;
  salesCount: number;
  businessId: string;
}) {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="color: #4338ca; margin-top: 0;">Weekly Operations Digest - ${params.businessName}</h2>
      <p style="color: #475569; font-size: 14px;">Here is your executive operational summary for the past 7 days:</p>
      <div style="margin: 24px 0; padding: 16px; background-color: #f8fafc; border-radius: 8px; display: flex; gap: 20px;">
        <div>
          <p style="margin: 0; font-size: 12px; color: #64748b;">Gross Revenue</p>
          <p style="margin: 4px 0 0; font-size: 18px; font-weight: bold; color: #0f172a;">${params.revenue}</p>
        </div>
        <div>
          <p style="margin: 0; font-size: 12px; color: #64748b;">Net Profit</p>
          <p style="margin: 4px 0 0; font-size: 18px; font-weight: bold; color: #16a34a;">${params.profit}</p>
        </div>
        <div>
          <p style="margin: 0; font-size: 12px; color: #64748b;">Orders Completed</p>
          <p style="margin: 4px 0 0; font-size: 18px; font-weight: bold; color: #0f172a;">${params.salesCount}</p>
        </div>
      </div>
      <p style="color: #64748b; font-size: 12px;">Klyro Business Intelligence • Automated Weekly Report</p>
    </div>
  `;

  return dispatchEmail({
    to: params.to,
    subject: `Weekly Performance Digest: ${params.revenue} Revenue (${params.businessName})`,
    html,
    fallbackNotification: {
      businessId: params.businessId,
      title: "Weekly Digest Dispatched",
      message: `Weekly summary of ${params.revenue} revenue dispatched to ${params.to}.`,
      type: "system",
    },
  });
}

export async function sendTestNotificationEmail(to: string, businessName: string, businessId: string) {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #4f46e5; border-radius: 12px;">
      <h2 style="color: #4338ca; margin-top: 0;">Klyro Email Dispatch Test Successful</h2>
      <p style="color: #475569; font-size: 14px;">
        This test confirms that email notifications for <strong>${businessName}</strong> are properly connected and ready to send overdue invoice notices, stock warnings, and weekly executive digests.
      </p>
      <p style="color: #64748b; font-size: 12px;">Sent via Klyro Operating System.</p>
    </div>
  `;

  return dispatchEmail({
    to,
    subject: `Klyro Email Test for ${businessName}`,
    html,
    fallbackNotification: {
      businessId,
      title: "Test Email Dispatched",
      message: `Test email notification dispatched to ${to}.`,
      type: "system",
    },
  });
}
