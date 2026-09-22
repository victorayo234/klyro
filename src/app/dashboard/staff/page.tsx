"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  UserCheck,
  Plus,
  Shield,
  ShieldAlert,
  User,
  Trash2,
  Edit2,
  Mail,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Profile, Role } from "@/types/database";
import { getStaffMembers, inviteStaffMember, updateStaffRole } from "@/lib/actions/staff";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";

export default function StaffPage() {
  const [staff, setStaff] = React.useState<Profile[]>([]);
  const [currentUserRole, setCurrentUserRole] = React.useState<Role>("staff");
  const [isLoading, setIsLoading] = React.useState(true);

  // Invite Modal State
  const [isInviteModalOpen, setIsInviteModalOpen] = React.useState(false);
  const [inviteName, setInviteName] = React.useState("");
  const [inviteEmail, setInviteEmail] = React.useState("");
  const [inviteRole, setInviteRole] = React.useState<Role>("staff");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Edit Role Modal State
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [selectedStaff, setSelectedStaff] = React.useState<Profile | null>(null);
  const [newRole, setNewRole] = React.useState<Role>("staff");

  const isOwnerOrAdmin = currentUserRole === "owner" || currentUserRole === "admin";

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const [{ data: staffData }, { data: authUser }] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: true }),
        supabase.auth.getUser(),
      ]);

      if (staffData) setStaff(staffData as Profile[]);

      if (authUser?.user) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", authUser.user.id)
          .maybeSingle();
        if (prof?.role) setCurrentUserRole(prof.role as Role);
      }
    } catch {
      toast.error("Failed to load staff list");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await inviteStaffMember({
        fullName: inviteName,
        email: inviteEmail,
        role: inviteRole,
      });
      toast.success(`Invitation dispatched to ${inviteEmail}`);
      setIsInviteModalOpen(false);
      setInviteName("");
      setInviteEmail("");
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to invite staff member";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;
    try {
      await updateStaffRole(selectedStaff.id, newRole);
      toast.success(`Updated role for ${selectedStaff.full_name}`);
      setIsEditModalOpen(false);
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update role";
      toast.error(msg);
    }
  };

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case "owner":
        return <Badge variant="default">Owner</Badge>;
      case "admin":
        return <Badge variant="success">Admin</Badge>;
      case "manager":
        return <Badge variant="warning">Manager</Badge>;
      default:
        return <Badge variant="secondary">Staff</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight font-display text-slate-900 dark:text-slate-100">
            Staff & Role Permissions
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage team access, designate financial visibility, and assign workspace roles
          </p>
        </div>

        {isOwnerOrAdmin ? (
          <Button size="sm" onClick={() => setIsInviteModalOpen(true)} className="gap-1.5 shadow-xs">
            <Plus className="w-3.5 h-3.5" />
            Invite Team Member
          </Button>
        ) : (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
            Role: {currentUserRole.toUpperCase()}
          </span>
        )}
      </div>

      {/* Role Permission Guidance Banner */}
      <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20 flex items-start gap-3">
        <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <span className="font-semibold text-blue-950 dark:text-blue-200 block">
            Role-Based Access Enforcement (Postgres RLS)
          </span>
          <p className="text-blue-800 dark:text-blue-300/90 leading-relaxed">
            <strong>Owner & Admin</strong> have unrestricted access to billing, team invites, and company settings.
            <strong>Manager</strong> can oversee invoices, customers, and inventory adjustments.
            <strong>Staff</strong> can log sales and record inventory counts.
          </p>
        </div>
      </div>

      {/* Staff Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-3.5">Team Member</th>
                <th className="px-6 py-3.5">Role</th>
                <th className="px-6 py-3.5">Email</th>
                <th className="px-6 py-3.5">Date Joined</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {staff.map((member) => (
                <tr
                  key={member.id}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold flex items-center justify-center">
                        {member.full_name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {member.full_name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">{getRoleBadge(member.role)}</td>
                  <td className="px-6 py-4 text-slate-500 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {member.email}
                  </td>
                  <td className="px-6 py-4 text-slate-400 font-mono">
                    {formatDate(member.created_at)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {isOwnerOrAdmin && member.role !== "owner" && (
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setSelectedStaff(member);
                            setNewRole(member.role);
                            setIsEditModalOpen(true);
                          }}
                          className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Change Role"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Invite Staff */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Invite New Team Member"
        description="Dispatches an email invitation with workspace access and assigned role"
      >
        <form onSubmit={handleInvite} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. Jordan Miller"
            required
            value={inviteName}
            onChange={(e) => setInviteName(e.target.value)}
          />

          <Input
            label="Work Email Address"
            type="email"
            placeholder="jordan@company.com"
            required
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
          />

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Workspace Role
            </label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as Role)}
              className="w-full h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
            >
              <option value="staff">Staff (Sales & inventory access only)</option>
              <option value="manager">Manager (Invoicing & CRM management)</option>
              <option value="admin">Admin (Full administrative & financial control)</option>
            </select>
          </div>

          <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsInviteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isSubmitting}>
              Send Invitation
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Role */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Modify Member Permissions"
        description={selectedStaff ? `Adjusting role for ${selectedStaff.full_name}` : ""}
      >
        <form onSubmit={handleUpdateRole} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Assigned Role
            </label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as Role)}
              className="w-full h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
            >
              <option value="staff">Staff</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Save Role
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
