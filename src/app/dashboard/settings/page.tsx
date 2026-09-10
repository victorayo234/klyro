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
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = React.useState<"general" | "billing" | "security" | "danger">("general");

  // General business profile state
  const [bizName, setBizName] = React.useState("Acme Global Solutions");
  const [bizIndustry, setBizIndustry] = React.useState("Retail & E-commerce");
  const [bizCurrency, setBizCurrency] = React.useState("USD");
  const [bizTimezone, setBizTimezone] = React.useState("America/New_York (EST)");
  const [bizAddress, setBizAddress] = React.useState("100 Financial Way, New York, NY 10005");
  const [bizContact, setBizContact] = React.useState("billing@acmeglobalsolutions.com");

  // Password change state
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [isChangingPassword, setIsChangingPassword] = React.useState(false);

  // Danger zone modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [confirmDeleteText, setConfirmDeleteText] = React.useState("");

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Business profile preferences updated successfully!");
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

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight font-display text-slate-900 dark:text-slate-100">
          Business Settings & Profile
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Configure corporate identifiers, billing plan, security controls, and currency
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 pb-px text-xs font-medium">
        <button
          onClick={() => setActiveTab("general")}
          className={`px-4 py-2 border-b-2 transition-all ${
            activeTab === "general"
              ? "border-blue-600 text-blue-600 font-semibold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Company Profile
        </button>
        <button
          onClick={() => setActiveTab("billing")}
          className={`px-4 py-2 border-b-2 transition-all ${
            activeTab === "billing"
              ? "border-blue-600 text-blue-600 font-semibold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Plan & Billing
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`px-4 py-2 border-b-2 transition-all ${
            activeTab === "security"
              ? "border-blue-600 text-blue-600 font-semibold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Security
        </button>
        <button
          onClick={() => setActiveTab("danger")}
          className={`px-4 py-2 border-b-2 transition-all ${
            activeTab === "danger"
              ? "border-red-600 text-red-600 font-semibold"
              : "border-transparent text-slate-500 hover:text-red-600"
          }`}
        >
          Danger Zone
        </button>
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
                    { label: "Retail & E-commerce", value: "Retail & E-commerce" },
                    { label: "Wholesale & Distribution", value: "Wholesale & Distribution" },
                    { label: "Professional Services", value: "Professional Services" },
                    { label: "Manufacturing", value: "Manufacturing" },
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
                  ]}
                />
                <Select
                  label="Operating Timezone"
                  value={bizTimezone}
                  onChange={(e) => setBizTimezone(e.target.value)}
                  options={[
                    { label: "America/New_York (EST)", value: "America/New_York (EST)" },
                    { label: "America/Chicago (CST)", value: "America/Chicago (CST)" },
                    { label: "America/Los_Angeles (PST)", value: "America/Los_Angeles (PST)" },
                    { label: "Europe/London (GMT)", value: "Europe/London (GMT)" },
                  ]}
                />
              </div>

              <Input
                label="Physical Address"
                value={bizAddress}
                onChange={(e) => setBizAddress(e.target.value)}
              />

              <Input
                label="Billing Contact Email"
                type="email"
                value={bizContact}
                onChange={(e) => setBizContact(e.target.value)}
              />
            </CardContent>
            <CardFooter className="justify-end">
              <Button type="submit" size="sm" className="gap-1.5 shadow-xs">
                <Save className="w-3.5 h-3.5" />
                Save Changes
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
                    $79.00 / month • Renews on April 1, 2026
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
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 3: Security */}
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

      {/* Tab 4: Danger Zone */}
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
              Once deleted, all Postgres Row Level Security tables linked to this business workspace will be permanently wiped. This action cannot be reversed.
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
