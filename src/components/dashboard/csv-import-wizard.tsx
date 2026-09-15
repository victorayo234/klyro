"use client";

import * as React from "react";
import Papa from "papaparse";
import { toast } from "sonner";
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  X,
  Download,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { batchImportCustomers } from "@/lib/actions/customers";
import { batchImportProducts } from "@/lib/actions/products";
import { cn } from "@/lib/utils";

interface CSVImportWizardProps {
  type: "customers" | "products";
  onSuccess?: (count: number) => void;
  onCancel?: () => void;
  embedded?: boolean;
}

export function CSVImportWizard({
  type,
  onSuccess,
  onCancel,
  embedded = false,
}: CSVImportWizardProps) {
  const [step, setStep] = React.useState<1 | 2 | 3>(1);
  const [fileName, setFileName] = React.useState<string>("");
  const [csvHeaders, setCsvHeaders] = React.useState<string[]>([]);
  const [rawRows, setRawRows] = React.useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = React.useState<Record<string, string>>({});
  const [isImporting, setIsImporting] = React.useState(false);

  // Target schema fields depending on type
  const targetFields = React.useMemo(() => {
    if (type === "customers") {
      return [
        { key: "name", label: "Customer / Client Name", required: true },
        { key: "email", label: "Email Address", required: false },
        { key: "phone", label: "Phone Number", required: false },
        { key: "address", label: "Physical / Billing Address", required: false },
        { key: "notes", label: "Notes / Relationship Details", required: false },
      ];
    } else {
      return [
        { key: "name", label: "Product / Item Name", required: true },
        { key: "sku", label: "SKU / Code", required: true },
        { key: "category", label: "Category", required: false },
        { key: "sale_price", label: "Selling Price", required: true },
        { key: "cost_price", label: "Cost Price", required: false },
        { key: "quantity", label: "Current Stock Level", required: false },
        { key: "reorder_threshold", label: "Reorder Threshold", required: false },
        { key: "description", label: "Description", required: false },
      ];
    }
  }, [type]);

  // Handle file drop/selection
  const handleFile = (file: File) => {
    if (!file.name.endsWith(".csv")) {
      toast.error("Invalid file format. Please upload a .csv file.");
      return;
    }

    setFileName(file.name);
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (!results.data || results.data.length === 0) {
          toast.error("The selected CSV file appears to be empty.");
          return;
        }

        const headers = results.meta.fields || [];
        setCsvHeaders(headers);
        setRawRows(results.data);

        // Auto-match headers by normalized similarity
        const initialMap: Record<string, string> = {};
        targetFields.forEach((tf) => {
          const match = headers.find((h) => {
            const hClean = h.toLowerCase().replace(/[^a-z0-9]/g, "");
            const tfClean = tf.key.toLowerCase().replace(/[^a-z0-9]/g, "");
            const labelClean = tf.label.toLowerCase().replace(/[^a-z0-9]/g, "");
            return hClean === tfClean || hClean.includes(tfClean) || labelClean.includes(hClean);
          });
          if (match) initialMap[tf.key] = match;
        });

        setMapping(initialMap);
        setStep(2);
      },
      error: (err) => {
        toast.error("Failed to parse CSV", { description: err.message });
      },
    });
  };

  // Generate downloadable sample template
  const handleDownloadTemplate = () => {
    let sampleHeaders: string[];
    let sampleRow: Record<string, string>;

    if (type === "customers") {
      sampleHeaders = ["Name", "Email", "Phone", "Address", "Notes"];
      sampleRow = {
        Name: "Acme Enterprises",
        Email: "contact@acme.com",
        Phone: "+1 (555) 123-4567",
        Address: "100 Market St, Suite 400",
        Notes: "VIP Corporate Account",
      };
    } else {
      sampleHeaders = ["Name", "SKU", "Category", "SalePrice", "CostPrice", "Quantity", "ReorderThreshold"];
      sampleRow = {
        Name: "Ergonomic Desk Pro",
        SKU: "DSK-001",
        Category: "Office",
        SalePrice: "450.00",
        CostPrice: "210.00",
        Quantity: "25",
        ReorderThreshold: "5",
      };
    }

    const csv = Papa.unparse({
      fields: sampleHeaders,
      data: [sampleRow],
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `klyro_${type}_template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Preview data rows
  const parsedRecords = React.useMemo(() => {
    return rawRows.map((row) => {
      const record: Record<string, unknown> = {};
      targetFields.forEach((f) => {
        const csvCol = mapping[f.key];
        const val = csvCol ? row[csvCol]?.trim() : "";
        record[f.key] = val;
      });
      return record;
    });
  }, [rawRows, mapping, targetFields]);

  // Validation report
  const validationReport = React.useMemo(() => {
    let validCount = 0;
    const errors: string[] = [];

    parsedRecords.forEach((rec, idx) => {
      let isRowValid = true;
      if (type === "customers") {
        if (!rec.name) {
          isRowValid = false;
          if (errors.length < 5) errors.push(`Row ${idx + 1}: Missing customer name.`);
        }
      } else {
        if (!rec.name || !rec.sku) {
          isRowValid = false;
          if (errors.length < 5) errors.push(`Row ${idx + 1}: Missing product name or SKU.`);
        }
      }
      if (isRowValid) validCount++;
    });

    return {
      total: parsedRecords.length,
      valid: validCount,
      invalid: parsedRecords.length - validCount,
      errors,
    };
  }, [parsedRecords, type]);

  // Commit batch import to Supabase
  const handleCommitImport = async () => {
    setIsImporting(true);
    try {
      if (type === "customers") {
        const payload = parsedRecords
          .filter((r) => Boolean(r.name))
          .map((r) => ({
            name: String(r.name),
            email: r.email ? String(r.email) : null,
            phone: r.phone ? String(r.phone) : null,
            address: r.address ? String(r.address) : null,
            notes: r.notes ? String(r.notes) : null,
          }));

        const result = await batchImportCustomers(payload);
        toast.success(`Import successful! Added ${result.count} customers.`);
        onSuccess?.(result.count);
      } else {
        const payload = parsedRecords
          .filter((r) => Boolean(r.name && r.sku))
          .map((r) => ({
            name: String(r.name),
            sku: String(r.sku),
            category: r.category ? String(r.category) : "General",
            sale_price: Number(r.sale_price) || 0,
            cost_price: Number(r.cost_price) || 0,
            quantity: Number(r.quantity) || 0,
            reorder_threshold: Number(r.reorder_threshold) || 5,
            description: r.description ? String(r.description) : null,
          }));

        const result = await batchImportProducts(payload);
        toast.success(`Import successful! Added or updated ${result.count} items.`);
        onSuccess?.(result.count);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Import failed";
      toast.error("Import error", { description: msg });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className={cn("w-full space-y-4", !embedded && "p-4")}>
      {/* Wizard Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="font-display font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
            CSV Import Wizard: {type === "customers" ? "Customer Directory" : "Product & Inventory Catalog"}
          </h3>
          <p className="text-xs text-slate-500">
            {step === 1 && "Upload your existing spreadsheet to migrate data in seconds"}
            {step === 2 && `Map your CSV columns to Klyro ${type} fields`}
            {step === 3 && "Review validation report and commit import"}
          </p>
        </div>

        {onCancel && (
          <button
            onClick={onCancel}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Step Progress Indicators */}
      <div className="grid grid-cols-3 gap-2">
        <div
          className={cn(
            "h-1.5 rounded-full transition-all",
            step >= 1 ? "bg-indigo-600" : "bg-slate-200 dark:bg-slate-800"
          )}
        />
        <div
          className={cn(
            "h-1.5 rounded-full transition-all",
            step >= 2 ? "bg-indigo-600" : "bg-slate-200 dark:bg-slate-800"
          )}
        />
        <div
          className={cn(
            "h-1.5 rounded-full transition-all",
            step === 3 ? "bg-indigo-600" : "bg-slate-200 dark:bg-slate-800"
          )}
        />
      </div>

      {/* STEP 1: Upload */}
      {step === 1 && (
        <div className="space-y-4 py-3">
          <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 transition-all">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
              <UploadCloud className="w-6 h-6" />
            </div>
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Click to select or drag & drop a .csv file
            </span>
            <span className="text-xs text-slate-400 mt-1">
              Supports CSV files exported from Excel, Google Sheets, or existing ERPs
            </span>
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
          </label>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
            <span>Need a formatted starter sheet?</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadTemplate}
              className="gap-1.5 text-xs h-8"
            >
              <Download className="w-3.5 h-3.5" />
              Download sample CSV template
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: Column Mapping */}
      {step === 2 && (
        <div className="space-y-4 py-2">
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-300 font-medium">
              Loaded: <strong className="font-mono text-indigo-600">{fileName}</strong> ({rawRows.length} rows detected)
            </span>
            <button
              onClick={() => setStep(1)}
              className="text-xs text-indigo-600 hover:underline"
            >
              Change file
            </button>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {targetFields.map((tf) => (
              <div
                key={tf.key}
                className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-center p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div>
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    {tf.label} {tf.required && <span className="text-red-500">*</span>}
                  </span>
                  <p className="text-[11px] text-slate-400 font-mono">Field: {tf.key}</p>
                </div>
                <div>
                  <select
                    value={mapping[tf.key] || ""}
                    onChange={(e) =>
                      setMapping((prev) => ({ ...prev, [tf.key]: e.target.value }))
                    }
                    className="w-full h-8 px-2.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="">-- Ignore / Not mapped --</option>
                    {csvHeaders.map((hdr) => (
                      <option key={hdr} value={hdr}>
                        CSV Column: {hdr}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </Button>
            <Button
              size="sm"
              onClick={() => setStep(3)}
              disabled={
                type === "customers" ? !mapping.name : !mapping.name || !mapping.sku
              }
              className="gap-1"
            >
              Review & Validate <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: Validation & Commit */}
      {step === 3 && (
        <div className="space-y-4 py-2">
          {/* Validation Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-[11px] text-slate-500 font-medium">Total Rows</span>
              <p className="text-lg font-bold font-display text-slate-900 dark:text-slate-100">
                {validationReport.total}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 text-center">
              <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">Valid</span>
              <p className="text-lg font-bold font-display text-emerald-600 dark:text-emerald-400">
                {validationReport.valid}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-center">
              <span className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">Skipped</span>
              <p className="text-lg font-bold font-display text-amber-600 dark:text-amber-400">
                {validationReport.invalid}
              </p>
            </div>
          </div>

          {validationReport.errors.length > 0 && (
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 space-y-1">
              <div className="font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                Validation notes (these rows will be skipped):
              </div>
              <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                {validationReport.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Quick Preview Table (first 4 items) */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Sample Preview (first {Math.min(3, parsedRecords.length)} rows)
            </span>
            <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden text-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-[11px] text-slate-500">
                    <tr>
                      {targetFields.slice(0, 4).map((f) => (
                        <th key={f.key} className="p-2 font-medium">
                          {f.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {parsedRecords.slice(0, 3).map((rec, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                        {targetFields.slice(0, 4).map((f) => (
                          <td key={f.key} className="p-2 font-mono text-[11px] truncate max-w-[140px]">
                            {String(rec[f.key] || "-")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" size="sm" onClick={() => setStep(2)} className="gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </Button>
            <Button
              size="sm"
              onClick={handleCommitImport}
              isLoading={isImporting}
              disabled={isImporting || validationReport.valid === 0}
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Commit {validationReport.valid} Records
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
