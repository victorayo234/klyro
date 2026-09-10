"use client";

import * as React from "react";
import Papa from "papaparse";
import { toast } from "sonner";
import {
  Users,
  Search,
  Plus,
  Download,
  MoreVertical,
  Mail,
  Phone,
  MapPin,
  Tag,
  Filter,
  Trash2,
  Edit2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Drawer } from "@/components/ui/drawer";
import { EmptyState } from "@/components/ui/empty-state";
import { Customer } from "@/types/database";
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "@/lib/actions/customers";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function CustomersPage() {
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [isLoading, setIsLoading] = React.useState(true);

  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [selectedCustomer, setSelectedCustomer] = React.useState<Customer | null>(null);

  // Form state
  const [formName, setFormName] = React.useState("");
  const [formEmail, setFormEmail] = React.useState("");
  const [formPhone, setFormPhone] = React.useState("");
  const [formAddress, setFormAddress] = React.useState("");
  const [formNotes, setFormNotes] = React.useState("");
  const [formStatus, setFormStatus] = React.useState<"active" | "inactive" | "lead">("active");
  const [formTags, setFormTags] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch {
      toast.error("Failed to load customers");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const openCreateDrawer = () => {
    setSelectedCustomer(null);
    setFormName("");
    setFormEmail("");
    setFormPhone("");
    setFormAddress("");
    setFormNotes("");
    setFormStatus("active");
    setFormTags("");
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (cust: Customer) => {
    setSelectedCustomer(cust);
    setFormName(cust.name);
    setFormEmail(cust.email || "");
    setFormPhone(cust.phone || "");
    setFormAddress(cust.address || "");
    setFormNotes(cust.notes || "");
    setFormStatus(cust.status);
    setFormTags(cust.tags?.join(", ") || "");
    setIsDrawerOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const tagsArray = formTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      if (selectedCustomer) {
        await updateCustomer(selectedCustomer.id, {
          name: formName,
          email: formEmail,
          phone: formPhone,
          address: formAddress,
          notes: formNotes,
          status: formStatus,
          tags: tagsArray,
        });
        toast.success("Customer record updated");
      } else {
        await createCustomer({
          name: formName,
          email: formEmail,
          phone: formPhone,
          address: formAddress,
          notes: formNotes,
          status: formStatus,
          tags: tagsArray,
        });
        toast.success("Customer created successfully");
      }
      setIsDrawerOpen(false);
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving customer";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name}?`)) return;
    try {
      await deleteCustomer(id);
      toast.success("Customer removed");
      loadData();
    } catch {
      toast.error("Failed to delete customer");
    }
  };

  // CSV Export via PapaParse
  const handleExportCSV = () => {
    if (customers.length === 0) {
      toast.error("No customer records to export.");
      return;
    }

    const csvData = customers.map((c) => ({
      ID: c.id,
      Name: c.name,
      Email: c.email || "",
      Phone: c.phone || "",
      Status: c.status,
      TotalSpend: c.total_spend,
      Tags: c.tags?.join("; ") || "",
      Address: c.address || "",
      DateAdded: c.created_at,
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `klyro-customers-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Customer list exported to CSV");
  };

  // Filtering
  const filteredCustomers = customers.filter((cust) => {
    const matchesSearch =
      cust.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cust.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cust.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === "all" || cust.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight font-display text-slate-900 dark:text-slate-100">
            Customers & Accounts (CRM)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your client accounts, purchase histories, and contact profiles
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-1.5">
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </Button>
          <Button size="sm" onClick={openCreateDrawer} className="gap-1.5 shadow-xs">
            <Plus className="w-3.5 h-3.5" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by client name, email, or tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-500">Status:</span>
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-medium">
            {["all", "active", "lead", "inactive"].map((status) => (
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
      </div>

      {/* Customer Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        {filteredCustomers.length === 0 ? (
          <EmptyState
            type="customers"
            title="No customers found"
            description="Get started by adding your first business customer to begin logging sales and generating invoices."
            actionLabel="Add Customer"
            onAction={openCreateDrawer}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 font-medium">
                <tr>
                  <th className="px-6 py-3.5">Customer / Organization</th>
                  <th className="px-6 py-3.5">Contact Details</th>
                  <th className="px-6 py-3.5">Tags</th>
                  <th className="px-6 py-3.5">Total Lifetime Spend</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredCustomers.map((cust) => (
                  <tr
                    key={cust.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center shrink-0">
                          {cust.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {cust.name}
                          </span>
                          {cust.address && (
                            <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3" /> {cust.address}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 space-y-1">
                      {cust.email && (
                        <p className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                          <Mail className="w-3 h-3 text-slate-400" /> {cust.email}
                        </p>
                      )}
                      {cust.phone && (
                        <p className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                          <Phone className="w-3 h-3 text-slate-400" /> {cust.phone}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {cust.tags?.map((tag, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100 font-mono">
                      {formatCurrency(cust.total_spend)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          cust.status === "active"
                            ? "success"
                            : cust.status === "lead"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {cust.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditDrawer(cust)}
                          className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(cust.id, cust.name)}
                          className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Slide-over Drawer for Add/Edit Customer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={selectedCustomer ? "Edit Customer Record" : "Add New Customer"}
        description="Fill out the profile details to maintain up-to-date CRM records"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Company or Individual Name"
            placeholder="e.g. Apex Global Industries"
            required
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="billing@apexcorp.com"
            value={formEmail}
            onChange={(e) => setFormEmail(e.target.value)}
          />

          <Input
            label="Phone Number"
            placeholder="+1 (555) 019-2834"
            value={formPhone}
            onChange={(e) => setFormPhone(e.target.value)}
          />

          <Input
            label="Business Address"
            placeholder="123 Financial District, Suite 400"
            value={formAddress}
            onChange={(e) => setFormAddress(e.target.value)}
          />

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Account Status
            </label>
            <select
              value={formStatus}
              onChange={(e) => setFormStatus(e.target.value as "active" | "inactive" | "lead")}
              className="w-full h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
            >
              <option value="active">Active Client</option>
              <option value="lead">Prospect / Lead</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <Input
            label="Tags (Comma separated)"
            placeholder="VIP, Wholesale, Net 30"
            value={formTags}
            onChange={(e) => setFormTags(e.target.value)}
          />

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Account Notes & Terms
            </label>
            <textarea
              rows={3}
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              placeholder="Add internal procurement notes, billing schedules, or preferences..."
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsDrawerOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isSubmitting}>
              {selectedCustomer ? "Save Changes" : "Create Customer"}
            </Button>
          </div>
        </form>
      </Drawer>
    </div>
  );
}
