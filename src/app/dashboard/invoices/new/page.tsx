"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Customer, Product, RecurrenceInterval } from "@/types/database";
import { getCustomers } from "@/lib/actions/customers";
import { getProducts } from "@/lib/actions/products";
import { createInvoice } from "@/lib/actions/invoices";
import { formatCurrency } from "@/lib/utils";

interface LineItemRow {
  productId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export default function NewInvoicePage() {
  const router = useRouter();
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = React.useState("");
  const [dueDate, setDueDate] = React.useState(
    new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0]
  );
  const [taxRate, setTaxRate] = React.useState<number>(8.25);
  const [discountAmount, setDiscountAmount] = React.useState<number>(0);
  const [notes, setNotes] = React.useState("Thank you for your business.");
  const [terms, setTerms] = React.useState(
    "Standard Net 30 days. Payments accepted via wire or credit card."
  );

  const [items, setItems] = React.useState<LineItemRow[]>([
    { description: "", quantity: 1, unitPrice: 0 },
  ]);

  // Recurring invoice controls
  const [isRecurring, setIsRecurring] = React.useState(false);
  const [recurrenceInterval, setRecurrenceInterval] = React.useState<RecurrenceInterval>("monthly");
  const [autoSend, setAutoSend] = React.useState(false);

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    async function loadData() {
      const [custs, prods] = await Promise.all([getCustomers(), getProducts()]);
      setCustomers(custs);
      setProducts(prods);
      if (custs.length > 0) setSelectedCustomerId(custs[0].id);
      if (prods.length > 0) {
        setItems([
          {
            productId: prods[0].id,
            description: prods[0].name,
            quantity: 1,
            unitPrice: prods[0].sale_price,
          },
        ]);
      }
    }
    loadData();
  }, []);

  const handleAddItem = () => {
    setItems((prev) => [...prev, { description: "", quantity: 1, unitPrice: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSelectProduct = (index: number, productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = {
        productId: prod.id,
        description: prod.name,
        quantity: copy[index].quantity || 1,
        unitPrice: prod.sale_price,
      };
      return copy;
    });
  };

  const updateItem = (index: number, field: keyof LineItemRow, value: any) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  // Math calculations
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const taxAmount = Number(((subtotal * taxRate) / 100).toFixed(2));
  const totalDue = Math.max(0, subtotal + taxAmount - discountAmount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      toast.error("Please select a customer");
      return;
    }

    if (items.some((item) => !item.description || item.unitPrice <= 0)) {
      toast.error("All line items must have a valid description and positive price");
      return;
    }

    setIsSubmitting(true);
    try {
      await createInvoice({
        customerId: selectedCustomerId,
        dueDate,
        taxRate: Number(taxRate),
        discountAmount: Number(discountAmount),
        notes,
        terms,
        items,
        isRecurring,
        recurrenceInterval: isRecurring ? recurrenceInterval : undefined,
        autoSend: isRecurring ? autoSend : undefined,
      });

      toast.success("Invoice created successfully!", {
        description: "PDF ready for client review and dispatch.",
      });

      router.push("/dashboard/invoices");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create invoice";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/invoices">
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-xl font-bold font-display text-slate-900 dark:text-slate-100">
              New Invoice
            </h2>
            <p className="text-xs text-slate-500">
              Compose line items and issue professional billing documents
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer & Dates Card */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Metadata</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Select Billed Customer
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.email || "No email"})
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Payment Due Date"
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            {/* Recurring Invoice Controls */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <div
                  className={`w-9 h-5 rounded-full transition-colors flex items-center relative ${
                    isRecurring ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-700"
                  }`}
                  onClick={() => setIsRecurring((v) => !v)}
                >
                  <div
                    className={`absolute w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform ${
                      isRecurring ? "translate-x-[18px]" : "translate-x-[3px]"
                    }`}
                  />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <RefreshCw className="w-3 h-3 text-blue-500" />
                    Make this a Recurring Invoice
                  </p>
                  <p className="text-[11px] text-slate-400">Auto-generate on a schedule</p>
                </div>
              </label>

              {isRecurring && (
                <div className="grid grid-cols-2 gap-3 pl-1 pt-1 animate-in fade-in duration-200">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Recurrence Interval</label>
                    <select
                      value={recurrenceInterval}
                      onChange={(e) => setRecurrenceInterval(e.target.value as RecurrenceInterval)}
                      className="w-full h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                    >
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer mt-5">
                    <input
                      type="checkbox"
                      checked={autoSend}
                      onChange={(e) => setAutoSend(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <p className="text-xs font-medium text-slate-700 dark:text-slate-300">Auto-send to client</p>
                      <p className="text-[11px] text-slate-400">Send via email automatically</p>
                    </div>
                  </label>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Line Items Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Line Items</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddItem}
              className="gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Add Row
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {items.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-12 gap-2.5 items-end p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40"
              >
                {/* Catalog Quick Picker */}
                <div className="col-span-12 sm:col-span-3 space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">
                    Product Preset
                  </label>
                  <select
                    value={item.productId || ""}
                    onChange={(e) => handleSelectProduct(index, e.target.value)}
                    className="w-full h-8 px-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  >
                    <option value="">Custom Item...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (${p.sale_price})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div className="col-span-12 sm:col-span-4 space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">
                    Description
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Item or service description"
                    value={item.description}
                    onChange={(e) => updateItem(index, "description", e.target.value)}
                    className="w-full h-8 px-2.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>

                {/* Quantity */}
                <div className="col-span-4 sm:col-span-2 space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Qty</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={item.quantity}
                    onChange={(e) => updateItem(index, "quantity", Number(e.target.value))}
                    className="w-full h-8 px-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-right font-mono"
                  />
                </div>

                {/* Unit Price */}
                <div className="col-span-6 sm:col-span-2 space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    required
                    value={item.unitPrice}
                    onChange={(e) => updateItem(index, "unitPrice", Number(e.target.value))}
                    className="w-full h-8 px-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-right font-mono"
                  />
                </div>

                {/* Remove button */}
                <div className="col-span-2 sm:col-span-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    disabled={items.length === 1}
                    className="h-8 w-8 rounded-md flex items-center justify-center text-slate-400 hover:text-red-600 disabled:opacity-30"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {/* Calculations and Breakdown */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between gap-6">
              <div className="space-y-3 sm:w-1/2">
                <Input
                  label="Sales Tax Rate (%)"
                  type="number"
                  step="0.1"
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                />
                <Input
                  label="Discount Amount ($)"
                  type="number"
                  step="0.01"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(Number(e.target.value))}
                />
              </div>

              <div className="space-y-2 sm:w-1/2 rounded-xl p-4 bg-slate-50 dark:bg-slate-900 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal:</span>
                  <span className="font-mono font-medium">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Tax ({taxRate}%):</span>
                  <span className="font-mono font-medium">{formatCurrency(taxAmount)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount:</span>
                    <span className="font-mono font-medium">-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-slate-100 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span>Total Amount Due:</span>
                  <span className="font-mono text-blue-600 dark:text-blue-400">
                    {formatCurrency(totalDue)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes & Terms */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Notes & Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              label="Notes to Client"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <Input
              label="Payment Terms & Remittance Info"
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
            />
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href="/dashboard/invoices">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" isLoading={isSubmitting} className="gap-2 px-6">
            <Save className="w-4 h-4" />
            Generate & Issue Invoice
          </Button>
        </div>
      </form>
    </div>
  );
}
