import { NextResponse, type NextRequest } from "next/server";
import { processDueRecurringInvoices } from "@/lib/actions/recurring-invoices";

export async function GET(request: NextRequest) {
  // Check authorization header for Vercel Cron or custom secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await processDueRecurringInvoices();
    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      ...result,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Cron processing error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
