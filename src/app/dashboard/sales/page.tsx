"use client";

import * as React from "react";
import { toast } from "sonner";
import { exportToCsv } from "@/lib/export";
import {
  BadgeDollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Download,
  Receipt,
  Calendar,
  CreditCard,
  Building,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { Sale, Expense, Customer, Product } from "@/types/database";
import { getSales, getExpenses, recordSale, createExpense } from "@/lib/actions/sales";
import { getCustomers } from "@/lib/actions/customers";
import { getProducts } from "@/lib/actions/products";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function SalesAndExpensesPage() {
  const [activeTab, setActiveTab] = React.useState<"sales" | "expenses">("sales");
  const [sales, setSales] = React.useState<Sale[]>([]);
  const [expenses, setExpenses] = React.useState<Expense[]>([]);
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // New Sale Modal State
  const [isSaleModalOpen, setIsSaleModalOpen] = React.useState(false);
  const [saleCustomerId, setSaleCustomerId] = React.useState("");
  const [saleProductId, setSaleProductId] = React.useState("");
  const [saleQuantity, setSaleQuantity] = React.useState(1);
  const [salePaymentMethod, setSalePaymentMethod] = React.useState<"credit_card" | "bank_transfer" | "cash" | "other">("credit_card");
  const [saleNotes, setSaleNotes] = React.useState("");

  // New Expense Modal State
  const [isExpenseModalOpen, setIsExpenseModalOpen] = React.useState(false);
  const [expCategory, setExpCategory] = React.useState("Software & SaaS");
  const [expVendor, setExpVendor] = React.useState("");
  const [expAmount, setExpAmount] = React.useState<number>(100);
  const [expNotes, setExpNotes] = React.useState("");

  const loadAll = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const [salesData, expensesData, custsData, prodsData] = await Promise.all([
        getSales(),
        getExpenses(),
        getCustomers(),
        getProducts(),
      ]);
      setSales(salesData);
      setExpenses(expensesData);
      setCustomers(custsData);
      setProducts(prodsData);
      if (custsData.length > 0) setSaleCustomerId(custsData[0].id);
      if (prodsData.length > 0) setSaleProductId(prodsData[0].id);
    } catch {
      toast.error("Failed to load records");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Financial summary
  const totalSalesRevenue = sales.reduce((acc, s) => acc + Number(s.total_amount), 0);
  const totalExpensesSum = expenses.reduce((acc, e) => acc + Number(e.amount), 0);
  const netProfit = totalSalesRevenue - totalExpensesSum;

  const handleCreateSale = async (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find((p) => p.id === saleProductId);
    if (!product) {
      toast.error("Please select a product");
      return;
    }

    if (product.quantity < saleQuantity) {
      toast.error(`Insufficient inventory. Only ${product.quantity} units available.`);
      return;
    }

    try {
      await recordSale({
        customerId: saleCustomerId || undefined,
        paymentMethod: salePaymentMethod,
        notes: saleNotes,
        items: [
          {
            productId: product.id,
            quantity: Number(saleQuantity),
            unitPrice: product.sale_price,
          },
        ],
      });
      toast.success("Sale logged & inventory decremented");
      setIsSaleModalOpen(false);
      loadAll();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error recording sale";
      toast.error(msg);
    }
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createExpense({
        category: expCategory,
        vendor: expVendor,
        amount: Number(expAmount),
        notes: expNotes,
      });
      toast.success("Expense logged successfully");
      setIsExpenseModalOpen(false);
      loadAll();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error logging expense";
      toast.error(msg);
    }
  };

  const handleExportCSV = async () => {
    if (activeTab === "sales") {
      if (sales.length === 0) return toast.error("No sales to export");
      const data = sales.map((s) => ({
        ID: s.id,
        Date: s.sale_date,
        Customer: s.customer?.name || "Walk-in",
        Subtotal: s.subtotal,
        Tax: s.tax,
        Total: s.total_amount,
        PaymentMethod: s.payment_method,
        Status: s.status,
      }));
      await exportToCsv(data, "sales-records.csv");
    } else {
      if (expenses.length === 0) return toast.error("No expenses to export");
      const data = expenses.map((e) => ({
        ID: e.id,
        Date: e.expense_date,
        Category: e.category,
        Vendor: e.vendor,
        Amount: e.amount,
        Notes: e.notes || "",
      }));
      await exportToCsv(data, "business-expenses.csv");
    }
    toast.success("Export downloaded");
  };

  const downloadBlob = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight font-display text-slate-900 dark:text-slate-100">
            Sales & Operating Expenses
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time income logging, auto-stock decrement, and P&L financial reconciliation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-1.5">
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </Button>
          {activeTab === "sales" ? (
            <Button size="sm" onClick={() => setIsSaleModalOpen(true)} className="gap-1.5 shadow-xs">
              <Plus className="w-3.5 h-3.5" />
              Record Sale
            </Button>
          ) : (
            <Button size="sm" onClick={() => setIsExpenseModalOpen(true)} className="gap-1.5 shadow-xs">
              <Plus className="w-3.5 h-3.5" />
              Log Expense
            </Button>
          )}
        </div>
      </div>

      {/* P&L Financial Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Gross Sales Revenue</span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-xl font-bold font-display text-slate-900 dark:text-slate-100 mt-2">
            {formatCurrency(totalSalesRevenue)}
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Operating Expenses</span>
            <TrendingDown className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-xl font-bold font-display text-red-600 dark:text-red-400 mt-2">
            {formatCurrency(totalExpensesSum)}
          </p>
        </div>

        <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-800 dark:text-emerald-300">
              Net Profit (Formula: Rev – Exp)
            </span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-bold font-display text-emerald-600 dark:text-emerald-400 mt-2">
            {formatCurrency(netProfit)}
          </p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-medium">
          <button
            onClick={() => setActiveTab("sales")}
            className={`px-4 py-1.5 rounded-lg transition-all ${
              activeTab === "sales"
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs font-semibold"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            Sales Transactions ({sales.length})
          </button>
          <button
            onClick={() => setActiveTab("expenses")}
            className={`px-4 py-1.5 rounded-lg transition-all ${
              activeTab === "expenses"
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs font-semibold"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            Business Expenses ({expenses.length})
          </button>
        </div>
      </div>

      {/* Sales Tab Content */}
      {activeTab === "sales" && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
          {sales.length === 0 ? (
            <EmptyState
              type="sales"
              title="No sales logged"
              description="Record your first customer sale to automatically update revenue and decrement warehouse inventory."
              actionLabel="Record Sale"
              onAction={() => setIsSaleModalOpen(true)}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 font-medium">
                  <tr>
                    <th className="px-6 py-3.5">Date</th>
                    <th className="px-6 py-3.5">Customer</th>
                    <th className="px-6 py-3.5">Items & Description</th>
                    <th className="px-6 py-3.5">Payment Method</th>
                    <th className="px-6 py-3.5">Total Amount</th>
                    <th className="px-6 py-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {sales.map((sale) => (
                    <tr
                      key={sale.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="px-6 py-4 text-slate-500 font-mono">
                        {formatDate(sale.sale_date)}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">
                        {sale.customer?.name || "Direct Customer"}
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                        {sale.notes || `${sale.items?.length || 1} line item(s)`}
                      </td>
                      <td className="px-6 py-4 uppercase font-mono text-[11px] text-slate-500">
                        {sale.payment_method.replace("_", " ")}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-100 font-mono">
                        {formatCurrency(sale.total_amount)}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="success">Completed</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Expenses Tab Content */}
      {activeTab === "expenses" && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
          {expenses.length === 0 ? (
            <EmptyState
              type="sales"
              title="No expenses logged"
              description="Track operational expenses, vendor disbursements, and recurring subscriptions."
              actionLabel="Log Expense"
              onAction={() => setIsExpenseModalOpen(true)}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 font-medium">
                  <tr>
                    <th className="px-6 py-3.5">Date</th>
                    <th className="px-6 py-3.5">Vendor / Payee</th>
                    <th className="px-6 py-3.5">Category</th>
                    <th className="px-6 py-3.5">Notes</th>
                    <th className="px-6 py-3.5">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {expenses.map((exp) => (
                    <tr
                      key={exp.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="px-6 py-4 text-slate-500 font-mono">
                        {formatDate(exp.expense_date)}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">
                        {exp.vendor}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {exp.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{exp.notes || "-"}</td>
                      <td className="px-6 py-4 font-bold text-red-600 dark:text-red-400 font-mono">
                        {formatCurrency(exp.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal: Record Sale */}
      <Modal
        isOpen={isSaleModalOpen}
        onClose={() => setIsSaleModalOpen(false)}
        title="Record New Sale"
        description="Select client and inventory items. Stock will automatically decrement."
      >
        <form onSubmit={handleCreateSale} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Customer Account
            </label>
            <select
              value={saleCustomerId}
              onChange={(e) => setSaleCustomerId(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.email || "No email"})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Product to Sell
            </label>
            <select
              value={saleProductId}
              onChange={(e) => setSaleProductId(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} - ${p.sale_price} ({p.quantity} in stock)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Quantity to Sell"
              type="number"
              min={1}
              required
              value={saleQuantity}
              onChange={(e) => setSaleQuantity(Number(e.target.value))}
            />
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Payment Method
              </label>
              <select
                value={salePaymentMethod}
                onChange={(e) => setSalePaymentMethod(e.target.value as any)}
                className="w-full h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
              >
                <option value="credit_card">Credit Card</option>
                <option value="bank_transfer">Bank Transfer (ACH)</option>
                <option value="cash">Cash</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <Input
            label="Sale Notes (Optional)"
            placeholder="e.g. Order #4082, delivered to branch"
            value={saleNotes}
            onChange={(e) => setSaleNotes(e.target.value)}
          />

          <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsSaleModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Confirm & Decrement Stock
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Log Expense */}
      <Modal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        title="Log Business Expense"
        description="Record operating costs to reconcile net margins"
      >
        <form onSubmit={handleCreateExpense} className="space-y-4">
          <Input
            label="Vendor / Payee Name"
            placeholder="e.g. AWS, FedEx, WeWork"
            required
            value={expVendor}
            onChange={(e) => setExpVendor(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Category
              </label>
              <select
                value={expCategory}
                onChange={(e) => setExpCategory(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
              >
                <option value="Software & SaaS">Software & SaaS</option>
                <option value="Logistics & Freight">Logistics & Freight</option>
                <option value="Office & Facilities">Office & Facilities</option>
                <option value="Marketing & Growth">Marketing & Growth</option>
                <option value="Payroll & Contractors">Payroll & Contractors</option>
                <option value="Utilities & Hardware">Utilities & Hardware</option>
              </select>
            </div>

            <Input
              label="Expense Amount ($)"
              type="number"
              step="0.01"
              required
              value={expAmount}
              onChange={(e) => setExpAmount(Number(e.target.value))}
            />
          </div>

          <Input
            label="Notes / Receipt reference"
            placeholder="Invoice or reference number..."
            value={expNotes}
            onChange={(e) => setExpNotes(e.target.value)}
          />

          <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsExpenseModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Save Expense
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
