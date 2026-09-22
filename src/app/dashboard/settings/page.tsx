"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Settings,
  Building,
  CreditCard,
  Bell,
  Shield,
  Trash2,
  Save,
  AlertTriangle,
  Download,
  Sun,
  Moon,
  Monitor,
  Sliders,
  Plus,
  Loader2,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { createClient } from "@/lib/supabase/client";
import { updateBusinessSettings, exportAllBusinessData } from "@/lib/actions/settings";
import { useTheme } from "next-themes";
import { useAppStore } from "@/lib/store";

type ThemeOption = "light" | "dark" | "system";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = React.useState<"general" | "billing" | "notifications" | "security" | "data" | "danger">("general");
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const themePreference = mounted ? (theme || "system") : "system";

  // General business profile state
  const [userRole, setUserRole] = React.useState<string>("staff");
  const [bizName, setBizName] = React.useState("Acme Global Solutions");
  const [bizIndustry, setBizIndustry] = React.useState("Retail & E-commerce");
  const [bizCurrency, setBizCurrency] = React.useState("USD");
  const [bizTimezone, setBizTimezone] = React.useState("Europe/London (GMT)");
  const [bizAddress, setBizAddress] = React.useState("");
  const [bizContact, setBizContact] = React.useState("");
  const [isSavingProfile, setIsSavingProfile] = React.useState(false);

  // Custom fields config state
  const [customerFields, setCustomerFields] = React.useState<Array<{label: string; type: string}>>([]);
  const [productFields, setProductFields] = React.useState<Array<{label: string; type: string}>>([]);

  // Notification preferences
  const [notifyOverdueInvoices, setNotifyOverdueInvoices] = React.useState(true);
  const [notifyLowStock, setNotifyLowStock] = React.useState(true);
  const [notifyWeeklySummary, setNotifyWeeklySummary] = React.useState(false);
  const [notifyNewSale, setNotifyNewSale] = React.useState(false);
  const [isSendingTestEmail, setIsSendingTestEmail] = React.useState(false);

  // Security password state
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [isChangingPassword, setIsChangingPassword] = React.useState(false);

  // Data export
  const [isExporting, setIsExporting] = React.useState(false);

  // Danger zone modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [confirmDeleteText, setConfirmDeleteText] = React.useState("");

  // Load biz data from Supabase on mount
  React.useEffect(() => {
    async function loadBizInfo() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("business_id, role")
        .eq("id", user.id)
        .maybeSingle();
      if (profile?.role) {
        setUserRole(profile.role);
      }
      if (!profile?.business_id) return;
      const { data: biz } = await supabase
        .from("businesses")
        .select("*")
        .eq("id", profile.business_id)
        .maybeSingle();
      if (biz) {
        setBizName(biz.name || "");
        setBizCurrency(biz.currency || "USD");
        setBizAddress(biz.address || "");
        setBizContact(biz.contact_email || "");
        if (biz.custom_fields_config) {
          const config = biz.custom_fields_config as { customer?: Array<{label: string; type: string}>; product?: Array<{label: string; type: string}> };
          setCustomerFields(config.customer || []);
          setProductFields(config.product || []);
        }
      }
    }
    loadBizInfo();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      await updateBusinessSettings({
        name: bizName,
        currency: bizCurrency,
        address: bizAddress,
        contact_email: bizContact,
      });
      toast.success("Business profile updated successfully");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save settings";
      toast.error(msg);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setIsChangingPassword(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success("Password updated successfully");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error changing password";
      toast.error(msg);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteBusiness = () => {
    if (confirmDeleteText !== bizName) {
      toast.error("Please type the exact business name to confirm deletion");
      return;
    }
    toast.error("Business deletion requires owner two-factor authentication.");
    setIsDeleteModalOpen(false);
  };

  const handleExportAllData = async () => {
    setIsExporting(true);
    try {
      const data = await exportAllBusinessData();
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `klyro-export-${new Date().toISOString().split("T")[0]}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Full workspace data exported successfully");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Export failed";
      toast.error(msg);
    } finally {
      setIsExporting(false);
    }
  };

  const handleSendTestEmail = async () => {
    setIsSendingTestEmail(true);
    try {
      // Trigger a test notification via the email service
      const res = await fetch("/api/notifications/test", { method: "POST" });
      if (!res.ok) throw new Error("Test email request failed");
      toast.success("Test email sent - check your inbox");
    } catch {
      toast.info("Email service not configured. Check RESEND_API_KEY in environment variables.", {
        duration: 6000,
      });
    } finally {
      setIsSendingTestEmail(false);
    }
  };

  const addCustomField = (type: "customer" | "product") => {
    const setter = type === "customer" ? setCustomerFields : setProductFields;
    const current = type === "customer" ? customerFields : productFields;
    if (current.length >= 3) {
      toast.error("Maximum 3 custom fields allowed per entity");
      return;
    }
    setter((prev) => [...prev, { label: `Custom Field ${prev.length + 1}`, type: "text" }]);
  };

  const removeCustomField = (type: "customer" | "product", index: number) => {
    const setter = type === "customer" ? setCustomerFields : setProductFields;
    setter((prev) => prev.filter((_, i) => i !== index));
  };

  const updateCustomField = (type: "customer" | "product", index: number, field: { label?: string; type?: string }) => {
    const setter = type === "customer" ? setCustomerFields : setProductFields;
    setter((prev) => prev.map((f, i) => i === index ? { ...f, ...field } : f));
  };

  const tabs = [
    { id: "general", label: "Company Profile", icon: Building },
    { id: "billing", label: "Plan & Billing", icon: CreditCard },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "data", label: "Data & Export", icon: Download },
    ...(userRole === "owner" ? [{ id: "danger", label: "Danger Zone", icon: Trash2, danger: true }] : []),
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight font-display text-slate-900 dark:text-slate-100">
          Business Settings &amp; Profile
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Configure your workspace, notifications, security, and data management
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 pb-px text-xs font-medium overflow-x-auto">
        {tabs.map(({ id, label, danger }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as typeof activeTab)}
            className={`px-3 py-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === id
                ? danger
                  ? "border-red-600 text-red-600 font-semibold"
                  : "border-blue-600 text-blue-600 font-semibold"
                : danger
                ? "border-transparent text-slate-500 hover:text-red-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab 1: General Business Profile */}
      {activeTab === "general" && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Organization Details</CardTitle>
              <CardDescription>
                Information displayed on invoices, receipts, and customer statements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Legal Business Name"
                  value={bizName}
                  onChange={(e) => setBizName(e.target.value)}
                  required
                />
                <Select
                  label="Industry Category"
                  value={bizIndustry}
                  onChange={(e) => setBizIndustry(e.target.value)}
                  options={[
                    { label: "Restaurant & Food Service", value: "restaurant" },
                    { label: "Agency & Consulting", value: "agency" },
                    { label: "Healthcare & Wellness", value: "healthcare" },
                    { label: "Manufacturing", value: "manufacturing" },
                    { label: "Retail & E-commerce", value: "retail" },
                    { label: "SaaS & Technology", value: "saas" },
                    { label: "Other", value: "other" },
                  ]}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Default Billing Currency"
                  value={bizCurrency}
                  onChange={(e) => setBizCurrency(e.target.value)}
                  options={[
                    { label: "USD ($) - United States Dollar", value: "USD" },
                    { label: "EUR (€) - Euro", value: "EUR" },
                    { label: "GBP (£) - British Pound", value: "GBP" },
                    { label: "CAD ($) - Canadian Dollar", value: "CAD" },
                    { label: "NGN (₦) - Nigerian Naira", value: "NGN" },
                    { label: "AUD ($) - Australian Dollar", value: "AUD" },
                  ]}
                />
                <Select
                  label="Operating Timezone"
                  value={bizTimezone}
                  onChange={(e) => setBizTimezone(e.target.value)}
                  options={[
                    { label: "Europe/London (GMT)", value: "Europe/London (GMT)" },
                    { label: "America/New_York (EST)", value: "America/New_York (EST)" },
                    { label: "America/Chicago (CST)", value: "America/Chicago (CST)" },
                    { label: "America/Los_Angeles (PST)", value: "America/Los_Angeles (PST)" },
                    { label: "Africa/Lagos (WAT)", value: "Africa/Lagos (WAT)" },
                    { label: "Asia/Dubai (GST)", value: "Asia/Dubai (GST)" },
                  ]}
                />
              </div>

              <Input
                label="Physical Address"
                value={bizAddress}
                onChange={(e) => setBizAddress(e.target.value)}
                placeholder="123 Business Ave, Suite 100"
              />

              <Input
                label="Billing Contact Email"
                type="email"
                value={bizContact}
                onChange={(e) => setBizContact(e.target.value)}
                placeholder="billing@yourbusiness.com"
              />
            </CardContent>
          </Card>

          {/* Theme Preference */}
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Choose your preferred color scheme</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {([
                  { id: "light", label: "Light", icon: Sun },
                  { id: "dark", label: "Dark", icon: Moon },
                  { id: "system", label: "System", icon: Monitor },
                ] as Array<{ id: ThemeOption; label: string; icon: React.FC<React.SVGProps<SVGSVGElement>> }>).map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setTheme(id)}
                    className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                      themePreference === id
                        ? "border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-600"
                        : "border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Custom Fields */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-slate-500" />
                Custom Fields
              </CardTitle>
              <CardDescription>
                Define up to 3 extra fields for Customers and Products. These appear in create/edit forms.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Customer fields */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Customer Fields</p>
                  <button
                    type="button"
                    onClick={() => addCustomField("customer")}
                    disabled={customerFields.length >= 3}
                    className="text-[11px] text-blue-600 hover:underline disabled:opacity-40 disabled:no-underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Field
                  </button>
                </div>
                <div className="space-y-2">
                  {customerFields.length === 0 && (
                    <p className="text-[11px] text-slate-400 italic">No custom fields yet.</p>
                  )}
                  {customerFields.map((f, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={f.label}
                        onChange={(e) => updateCustomField("customer", i, { label: e.target.value })}
                        className="flex-1 h-8 px-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                        placeholder="Field label"
                      />
                      <select
                        value={f.type}
                        onChange={(e) => updateCustomField("customer", i, { type: e.target.value })}
                        className="h-8 px-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                      >
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                        <option value="date">Date</option>
                        <option value="boolean">Yes/No</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => removeCustomField("customer", i)}
                        className="text-slate-400 hover:text-red-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Product fields */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Product Fields</p>
                  <button
                    type="button"
                    onClick={() => addCustomField("product")}
                    disabled={productFields.length >= 3}
                    className="text-[11px] text-blue-600 hover:underline disabled:opacity-40 disabled:no-underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Field
                  </button>
                </div>
                <div className="space-y-2">
                  {productFields.length === 0 && (
                    <p className="text-[11px] text-slate-400 italic">No custom fields yet.</p>
                  )}
                  {productFields.map((f, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={f.label}
                        onChange={(e) => updateCustomField("product", i, { label: e.target.value })}
                        className="flex-1 h-8 px-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                        placeholder="Field label"
                      />
                      <select
                        value={f.type}
                        onChange={(e) => updateCustomField("product", i, { type: e.target.value })}
                        className="h-8 px-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                      >
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                        <option value="date">Date</option>
                        <option value="boolean">Yes/No</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => removeCustomField("product", i)}
                        className="text-slate-400 hover:text-red-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-end">
              <Button type="submit" size="sm" className="gap-1.5 shadow-xs" isLoading={isSavingProfile}>
                <Save className="w-3.5 h-3.5" />
                Save All Changes
              </Button>
            </CardFooter>
          </Card>
        </form>
      )}

      {/* Tab 2: Plan & Billing */}
      {activeTab === "billing" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Subscription</CardTitle>
              <CardDescription>
                Manage your Klyro business tier and seat allocations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-lg text-slate-900 dark:text-slate-100">
                      Growth Plan
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white">
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    $79.00 / month • Renews in 30 days
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Change Plan
                </Button>
              </div>

              <div className="space-y-2 pt-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Staff Seats:</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">4 of 10 used</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Inventory Catalog Limit:</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">Unlimited SKUs</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Invoice PDF Engine:</span>
                  <span className="font-medium text-emerald-600">Active</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Recurring Invoices:</span>
                  <span className="font-medium text-emerald-600">Active</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 3: Notifications */}
      {activeTab === "notifications" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Notification Preferences</CardTitle>
              <CardDescription>
                Control which alerts are sent to your billing contact email via Resend
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  id: "overdue",
                  label: "Overdue Invoice Alerts",
                  description: "Get notified when invoices pass their due date",
                  value: notifyOverdueInvoices,
                  setter: setNotifyOverdueInvoices,
                },
                {
                  id: "lowstock",
                  label: "Low Stock Alerts",
                  description: "Notify when a product falls below its reorder threshold",
                  value: notifyLowStock,
                  setter: setNotifyLowStock,
                },
                {
                  id: "weekly",
                  label: "Weekly Business Summary",
                  description: "Receive a weekly digest of revenue, new customers, and key metrics",
                  value: notifyWeeklySummary,
                  setter: setNotifyWeeklySummary,
                },
              ].map(({ id, label, description, value, setter }) => (
                <div key={id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                  <div>
                    <p className="text-xs font-medium text-slate-800 dark:text-slate-200">{label}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{description}</p>
                  </div>
                  <button
                    onClick={() => setter((v) => !v)}
                    className={`w-10 h-6 rounded-full transition-colors relative flex-shrink-0 ${
                      value ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-700"
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                        value ? "translate-x-5" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              ))}

              <div className="pt-2 flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSendTestEmail}
                  isLoading={isSendingTestEmail}
                  className="gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Send Test Email
                </Button>
                <p className="text-[11px] text-slate-400">
                  Requires <code className="font-mono">RESEND_API_KEY</code> in env vars
                </p>
              </div>
            </CardContent>
            <CardFooter className="justify-end">
              <Button
                size="sm"
                className="gap-1.5"
                onClick={() => toast.success("Notification preferences saved")}
              >
                <Save className="w-3.5 h-3.5" />
                Save Preferences
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* Tab 4: Security */}
      {activeTab === "security" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Update Password</CardTitle>
              <CardDescription>
                Ensure your account is protected with a strong credentials policy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                <Input
                  label="New Password"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                />
                <Button type="submit" size="sm" isLoading={isChangingPassword}>
                  Update Password
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 5: Data & Export */}
      {activeTab === "data" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-4 h-4 text-slate-500" />
                Export Workspace Data
              </CardTitle>
              <CardDescription>
                Download a complete JSON backup of all your business data: customers, products, invoices, sales, and staff
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  The export includes all records scoped to your business workspace: customers, inventory, 
                  sales transactions, invoices, staff members, activity logs, and notification history. 
                  No passwords or auth tokens are included.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportAllData}
                className="gap-1.5"
                isLoading={isExporting}
              >
                {isExporting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                Export All Data (.json)
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Retention</CardTitle>
              <CardDescription>How long Klyro retains different types of data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-xs">
                {[
                  { label: "Invoices & Sales", retention: "Indefinite (your records)" },
                  { label: "Activity Logs", retention: "90 days rolling" },
                  { label: "Notification History", retention: "30 days rolling" },
                  { label: "Audit Trail", retention: "1 year" },
                ].map(({ label, retention }) => (
                  <div key={label} className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">{label}:</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">{retention}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 6: Danger Zone */}
      {activeTab === "danger" && (
        <Card className="border-red-200 dark:border-red-900/60 bg-red-50/20 dark:bg-red-950/10">
          <CardHeader>
            <CardTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Danger Zone
            </CardTitle>
            <CardDescription>
              Permanently delete this business organization and all customer records, invoices, and stock data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
              Once deleted, all Postgres Row Level Security tables linked to this business workspace will be permanently wiped. This action cannot be reversed. Export your data first if you need a backup.
            </p>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsDeleteModalOpen(true)}
              className="gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Business Workspace
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modal: Confirmation for Danger Zone */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Business Deletion"
        description="This will destroy all database records associated with this business."
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Please type <strong className="text-red-600">{bizName}</strong> below to confirm deletion:
          </p>
          <Input
            value={confirmDeleteText}
            onChange={(e) => setConfirmDeleteText(e.target.value)}
            placeholder="Type business name exactly"
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteBusiness}
              disabled={confirmDeleteText !== bizName}
            >
              Permanently Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
