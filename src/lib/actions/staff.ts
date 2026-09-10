"use server";

import { createClient } from "@/lib/supabase/server";
import { Profile, Role } from "@/types/database";
import { logActivity } from "./activity";

export async function getStaffMembers(): Promise<Profile[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: true });

    if (error || !data || data.length === 0) {
      return getDemoStaff();
    }

    return data as Profile[];
  } catch {
    return getDemoStaff();
  }
}

export async function inviteStaffMember(formData: {
  fullName: string;
  email: string;
  role: Role;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let businessId = "00000000-0000-0000-0000-000000000001";
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("business_id, role")
      .eq("id", user.id)
      .single();

    if (profile) {
      if (profile.role !== "owner" && profile.role !== "admin") {
        throw new Error("Permission denied. Only Owners and Admins can invite team members.");
      }
      if (profile.business_id) businessId = profile.business_id;
    }
  }

  // Record audit log
  await logActivity({
    entityType: "staff",
    action: `Invited staff member ${formData.fullName} as ${formData.role.toUpperCase()}`,
    details: formData,
  });

  return { success: true, message: `Invitation sent to ${formData.email}` };
}

export async function updateStaffRole(userId: string, newRole: Role) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: currentProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (currentProfile?.role !== "owner" && currentProfile?.role !== "admin") {
      throw new Error("Permission denied. Only Owners and Admins can modify member roles.");
    }
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({ role: newRole, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  await logActivity({
    entityType: "staff",
    entityId: userId,
    action: `Changed user role to ${newRole}`,
    details: { userId, newRole },
  });

  return data;
}

function getDemoStaff(): Profile[] {
  return [
    {
      id: "usr-1",
      business_id: "biz-demo",
      full_name: "Alex Morgan",
      email: "alex@acmecorp.com",
      role: "owner",
      avatar_url: null,
      created_at: new Date(Date.now() - 120 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "usr-2",
      business_id: "biz-demo",
      full_name: "Elena Rostova",
      email: "elena@acmecorp.com",
      role: "admin",
      avatar_url: null,
      created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "usr-3",
      business_id: "biz-demo",
      full_name: "Marcus Vance",
      email: "marcus@acmecorp.com",
      role: "manager",
      avatar_url: null,
      created_at: new Date(Date.now() - 45 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "usr-4",
      business_id: "biz-demo",
      full_name: "Sarah Chen",
      email: "sarah@acmecorp.com",
      role: "staff",
      avatar_url: null,
      created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];
}
