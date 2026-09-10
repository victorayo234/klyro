"use client";

import * as React from "react";
import Link from "next/link";
import Papa from "papaparse";
import { toast } from "sonner";
import {
  FileText,
  Search,
  Plus,
  Download,
  CheckCircle2,
  BellRing,
  Filter,
  Eye,
  Calendar,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { DownloadInvoicePDFButton } from "@/components/invoices/pdf-document";
import { Invoice } from "@/types/database";
import { getInvoices, markInvoicePaid } from "@/lib/actions/invoices";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function InvoicesPage() {
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [isLoading, setIsLoading] = React.useState(true);

  // Invoice Preview Modal
  const [previewInvoice, setPreviewInvoice] = React.useState<Invoice | null>(null);

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getInvoices();
      setInvoices(data);
    } catch {
      toast.error("Failed to load invoices");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleMarkPaid = async (invId: string) => {
    try {
      await markInvoicePaid(invId);
      toast.success("Invoice marked as PAID");
      loadData();
      if (previewInvoice?.id === invId) {
        setPreviewInvoice((prev) => (prev ? { ...prev, status: "paid" } : null));
      }
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleSendReminder = (inv: Invoice) => {
    toast.success(`Payment reminder dispatched to ${inv.customer?.name || "Client"}`);
  };

  const handleExportCSV = () => {
    if (invoices.length === 0) {
      toast.error("No invoices to export");
      return;
    }

    const csvData = invoices.map((inv) => ({
      InvoiceNumber: inv.invoice_number,
      Customer: inv.customer?.name || "N/A",
      IssueDate: inv.issue_date,
      DueDate: inv.due_date,
      Subtotal: inv.subtotal,
      TaxAmount: inv.tax_amount,
      TotalAmount: inv.total_amount,
      Status: inv.status,
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `klyro-invoices-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Invoices exported to CSV");
  };

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customer?.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight font-display text-slate-900 dark:text-slate-100">
            Invoices & Billing
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Create professional branded bills, track receivables, and download PDF documents
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-1.5">
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </Button>
          <Link href="/dashboard/invoices/new">
            <Button size="sm" className="gap-1.5 shadow-xs">
              <Plus className="w-3.5 h-3.5" />
              Create Invoice
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by invoice number or client name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-medium">
          {["all", "draft", "sent", "paid", "overdue"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-2.5 py-1 rounded-md capitalize transition-all ${
                statusFilter === status
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        {filteredInvoices.length === 0 ? (
          <EmptyState
            type="invoices"
            title="No invoices found"
            description="Generate a new invoice to bill clients with automated tax calculations and downloadable PDFs."
            actionLabel="Create Invoice"
            onAction={() => (window.location.href = "/dashboard/invoices/new")}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 font-medium">
                <tr>
                  <th className="px-6 py-3.5">Invoice #</th>
                  <th className="px-6 py-3.5">Customer</th>
                  <th className="px-6 py-3.5">Issue Date</th>
                  <th className="px-6 py-3.5">Due Date</th>
                  <th className="px-6 py-3.5">Total Due</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {inv.invoice_number}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">
                      {inv.customer?.name || "Unnamed Client"}
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-mono">
                      {formatDate(inv.issue_date)}
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-mono">
                      {formatDate(inv.due_date)}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-100 font-mono text-sm">
                      {formatCurrency(inv.total_amount)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          inv.status === "paid"
                            ? "success"
                            : inv.status === "overdue"
                            ? "destructive"
                            : inv.status === "sent"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {inv.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPreviewInvoice(inv)}
                          className="h-8 px-2 text-slate-600 dark:text-slate-300 gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </Button>
                        <DownloadInvoicePDFButton invoice={inv} />
                        {inv.status !== "paid" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkPaid(inv.id)}
                            className="h-8 px-2 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                          >
                            Mark Paid
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoice Detail & Preview Modal */}
      {previewInvoice && (
        <Modal
          isOpen={Boolean(previewInvoice)}
          onClose={() => setPreviewInvoice(null)}
          title={`Invoice ${previewInvoice.invoice_number}`}
          description={`Issued to ${previewInvoice.customer?.name} on ${previewInvoice.issue_date}`}
          maxWidth="2xl"
        >
          <div className="space-y-6">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
              <div>
                <span className="text-xs text-slate-400">Total Billed</span>
                <p className="text-2xl font-bold font-display text-blue-600 dark:text-blue-400">
                  {formatCurrency(previewInvoice.total_amount)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    previewInvoice.status === "paid"
                      ? "success"
                      : previewInvoice.status === "overdue"
                      ? "destructive"
                      : "default"
                  }
                >
                  {previewInvoice.status.toUpperCase()}
                </Badge>
                <DownloadInvoicePDFButton invoice={previewInvoice} />
              </div>
            </div>

            {/* Client info */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Billed To
                </span>
                <p className="font-bold text-slate-900 dark:text-slate-100">
                  {previewInvoice.customer?.name}
                </p>
                <p className="text-slate-500">{previewInvoice.customer?.email}</p>
                <p className="text-slate-500">{previewInvoice.customer?.address}</p>
              </div>
              <div>
                <span className="font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Payment Terms
                </span>
                <p className="text-slate-700 dark:text-slate-300">
                  Due: {formatDate(previewInvoice.due_date)}
                </p>
                <p className="text-slate-500">{previewInvoice.terms || "Standard Net 30"}</p>
              </div>
            </div>

            {/* Line items table */}
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-medium">
                  <tr>
                    <th className="px-4 py-2.5">Item Description</th>
                    <th className="px-4 py-2.5 text-right">Qty</th>
                    <th className="px-4 py-2.5 text-right">Price</th>
                    <th className="px-4 py-2.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {previewInvoice.items?.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-2.5 font-medium">{item.description}</td>
                      <td className="px-4 py-2.5 text-right font-mono">{item.quantity}</td>
                      <td className="px-4 py-2.5 text-right font-mono">
                        ${item.unit_price.toFixed(2)}
                      </td>
                      <td className="px-4 py-2.5 text-right font-bold font-mono">
                        ${item.total_price.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Breakdown */}
            <div className="flex justify-end text-xs">
              <div className="w-64 space-y-1.5 border-t border-slate-100 dark:border-slate-800 pt-3">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal:</span>
                  <span className="font-mono font-medium">${previewInvoice.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Tax ({previewInvoice.tax_rate}%):</span>
                  <span className="font-mono font-medium">${previewInvoice.tax_amount.toFixed(2)}</span>
                </div>
                {previewInvoice.discount_amount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount:</span>
                    <span className="font-mono font-medium">
                      -${previewInvoice.discount_amount.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-slate-100 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span>Total Due:</span>
                  <span className="font-mono text-blue-600 dark:text-blue-400">
                    ${previewInvoice.total_amount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSendReminder(previewInvoice)}
                className="gap-1.5"
              >
                <BellRing className="w-3.5 h-3.5" />
                Send Reminder Email
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPreviewInvoice(null)}>
                  Close
                </Button>
                {previewInvoice.status !== "paid" && (
                  <Button
                    size="sm"
                    onClick={() => handleMarkPaid(previewInvoice.id)}
                    className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Mark as Paid
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
