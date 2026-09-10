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
  RefreshCw,
  Repeat,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { DownloadInvoicePDFButton } from "@/components/invoices/pdf-document";
import { SavedFilters } from "@/components/dashboard/saved-filters";
import { BulkActionsBar } from "@/components/dashboard/bulk-actions-bar";
import { Invoice, SavedFilter, InvoiceStatus } from "@/types/database";
import {
  getInvoices,
  markInvoicePaid,
  bulkDeleteInvoices,
  bulkUpdateInvoiceStatus,
} from "@/lib/actions/invoices";
import { processDueRecurringInvoices } from "@/lib/actions/recurring-invoices";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function InvoicesPage() {
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRunningRecurring, setIsRunningRecurring] = React.useState(false);

  // Saved Filters state
  const [activeSavedFilter, setActiveSavedFilter] = React.useState<SavedFilter | null>(null);

  // Multi-select bulk state
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

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

  const handleRunRecurring = async () => {
    setIsRunningRecurring(true);
    try {
      const res = await processDueRecurringInvoices();
      if (res.success) {
        toast.success(res.message || "Processed recurring invoices");
        loadData();
      } else {
        toast.error(res.error || "Failed to process recurring invoices");
      }
    } catch {
      toast.error("Error executing recurring batch");
    } finally {
      setIsRunningRecurring(false);
    }
  };

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

  const handleExportCSV = (recordsToExport = invoices) => {
    if (recordsToExport.length === 0) {
      toast.error("No invoices to export");
      return;
    }

    const csvData = recordsToExport.map((inv) => ({
      InvoiceNumber: inv.invoice_number,
      Customer: inv.customer?.name || "N/A",
      IssueDate: inv.issue_date,
      DueDate: inv.due_date,
      Subtotal: inv.subtotal,
      TaxAmount: inv.tax_amount,
      TotalAmount: inv.total_amount,
      Status: inv.status,
      Recurring: inv.is_recurring ? inv.recurrence_interval : "No",
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

  // Bulk Operations
  const handleBulkDelete = async () => {
    await bulkDeleteInvoices(selectedIds);
    setInvoices((prev) => prev.filter((i) => !selectedIds.includes(i.id)));
    setSelectedIds([]);
    toast.success("Selected invoices removed");
  };

  const handleBulkStatusChange = async (newStatus: string) => {
    await bulkUpdateInvoiceStatus(selectedIds, newStatus as InvoiceStatus);
    setInvoices((prev) =>
      prev.map((i) => (selectedIds.includes(i.id) ? { ...i, status: newStatus as InvoiceStatus } : i))
    );
    setSelectedIds([]);
    toast.success(`Updated ${selectedIds.length} invoices to ${newStatus.toUpperCase()}`);
  };

  // Select all toggle
  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredInvoices.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredInvoices.map((i) => i.id));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Filter logic
  const filteredInvoices = React.useMemo(() => {
    return invoices.filter((inv) => {
      const matchesSearch =
        inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.customer?.name.toLowerCase().includes(searchQuery.toLowerCase());

      const activeStatus = activeSavedFilter?.filter_criteria?.statusFilter
        ? String(activeSavedFilter.filter_criteria.statusFilter)
        : statusFilter;

      const matchesStatus = activeStatus === "all" || inv.status === activeStatus;
      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchQuery, statusFilter, activeSavedFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight font-display text-slate-900 dark:text-slate-100">
            Invoices & Billing
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Create professional branded bills, track recurring retainers, and download PDF documents
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRunRecurring}
            isLoading={isRunningRecurring}
            className="gap-1.5 shadow-xs text-xs"
            title="Check and generate any recurring invoices due today"
          >
            <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
            Process Recurring
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExportCSV()}
            className="gap-1.5"
          >
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

      {/* Saved Views Pills */}
      <SavedFilters
        tableName="invoices"
        currentFilter={{ statusFilter, searchQuery }}
        activeSavedFilterId={activeSavedFilter?.id || null}
        onSelectSavedFilter={(sf) => {
          setActiveSavedFilter(sf);
          if (sf?.filter_criteria?.statusFilter) {
            setStatusFilter(String(sf.filter_criteria.statusFilter));
          }
        }}
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by invoice number or client name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-medium">
          {["all", "draft", "sent", "paid", "overdue"].map((status) => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status);
                setActiveSavedFilter(null);
              }}
              className={`px-2.5 py-1 rounded-md capitalize transition-all ${
                statusFilter === status && !activeSavedFilter
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading invoices...</div>
        ) : filteredInvoices.length === 0 ? (
          <EmptyState
            type="invoices"
            title="No invoices found"
            description="Create your first client invoice or modify filter criteria."
            actionLabel="Create Invoice"
            onAction={() => window.location.href = "/dashboard/invoices/new"}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="p-3.5 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={
                        filteredInvoices.length > 0 &&
                        selectedIds.length === filteredInvoices.length
                      }
                      onChange={handleToggleSelectAll}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </th>
                  <th className="p-3.5 font-semibold">Invoice #</th>
                  <th className="p-3.5 font-semibold">Client / Customer</th>
                  <th className="p-3.5 font-semibold">Issue Date</th>
                  <th className="p-3.5 font-semibold">Due Date</th>
                  <th className="p-3.5 font-semibold">Status</th>
                  <th className="p-3.5 font-semibold text-right">Amount</th>
                  <th className="p-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredInvoices.map((inv) => {
                  const isSelected = selectedIds.includes(inv.id);
                  return (
                    <tr
                      key={inv.id}
                      className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors ${
                        isSelected ? "bg-indigo-50/40 dark:bg-indigo-950/30" : ""
                      }`}
                    >
                      <td className="p-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectRow(inv.id)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="p-3.5 font-semibold font-mono text-indigo-600 dark:text-indigo-400">
                        <div className="flex items-center gap-1.5">
                          <span>{inv.invoice_number}</span>
                          {inv.is_recurring && (
                            <span
                              className="p-0.5 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300"
                              title={`Recurring: ${inv.recurrence_interval}`}
                            >
                              <Repeat className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5 font-medium text-slate-800 dark:text-slate-200">
                        {inv.customer?.name || "Anonymous Client"}
                      </td>
                      <td className="p-3.5 text-slate-500">{formatDate(inv.issue_date)}</td>
                      <td className="p-3.5 text-slate-500">{formatDate(inv.due_date)}</td>
                      <td className="p-3.5">
                        <Badge
                          variant={
                            inv.status === "paid"
                              ? "success"
                              : inv.status === "sent"
                              ? "default"
                              : inv.status === "overdue"
                              ? "destructive"
                              : "secondary"
                          }
                          className="capitalize text-[10px]"
                        >
                          {inv.status}
                        </Badge>
                      </td>
                      <td className="p-3.5 text-right font-semibold font-mono text-slate-900 dark:text-slate-100">
                        {formatCurrency(inv.total_amount)}
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPreviewInvoice(inv)}
                            className="h-7 px-2 text-xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>

                          <DownloadInvoicePDFButton invoice={inv} />

                          {inv.status !== "paid" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMarkPaid(inv.id)}
                              className="h-7 text-[11px] gap-1 px-2"
                            >
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                              Paid
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Floating Bulk Actions Bar */}
      <BulkActionsBar
        selectedCount={selectedIds.length}
        totalCount={filteredInvoices.length}
        onClearSelection={() => setSelectedIds([])}
        onDeleteSelected={handleBulkDelete}
        onStatusChangeSelected={handleBulkStatusChange}
        onExportSelected={() => {
          const selected = invoices.filter((i) => selectedIds.includes(i.id));
          handleExportCSV(selected);
        }}
        statusOptions={[
          { label: "Draft", value: "draft" },
          { label: "Sent", value: "sent" },
          { label: "Paid", value: "paid" },
          { label: "Cancelled", value: "cancelled" },
        ]}
        entityName="invoices"
      />

      {/* Invoice Detail & PDF Preview Modal */}
      {previewInvoice && (
        <Modal
          isOpen={Boolean(previewInvoice)}
          onClose={() => setPreviewInvoice(null)}
          title={`Invoice Preview: ${previewInvoice.invoice_number}`}
          description={`Issued to ${previewInvoice.customer?.name || "Client"} on ${formatDate(
            previewInvoice.issue_date
          )}`}
        >
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Total Amount:</span>
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  {formatCurrency(previewInvoice.total_amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <Badge
                  variant={previewInvoice.status === "paid" ? "success" : "destructive"}
                  className="capitalize text-[10px]"
                >
                  {previewInvoice.status}
                </Badge>
              </div>
              {previewInvoice.is_recurring && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Recurrence:</span>
                  <span className="font-semibold text-indigo-600 capitalize">
                    {previewInvoice.recurrence_interval} (Next: {previewInvoice.next_issue_date || "N/A"})
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <DownloadInvoicePDFButton invoice={previewInvoice} />
              <Button variant="outline" onClick={() => setPreviewInvoice(null)}>
                Close Preview
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
