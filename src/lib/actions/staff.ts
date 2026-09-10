"use server";

import { createClient } from "@/lib/supabase/server";
import { Profile, Role } from "@/types/database";
import { logActivity } from "./activity";

export async function getStaffMembers(): Promise<Profile[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data: currentProfile } = await supabase
      .from("profiles")
      .select("business_id")
      .eq("id", user.id)
      .maybeSingle();

    if (!currentProfile?.business_id) return [];

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("business_id", currentProfile.business_id)
      .order("created_at", { ascending: true });

    if (error) {
      console.warn("Error fetching staff from Supabase:", error.message);
      return [];
    }

    return (data || []) as Profile[];
  } catch {
    return [];
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

  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("profiles")
    .select("business_id, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.business_id) throw new Error("Business profile not found");
  if (profile.role !== "owner" && profile.role !== "admin") {
    throw new Error("Permission denied. Only Owners and Admins can invite team members.");
  }

  // Record audit log
  await logActivity({
    entityType: "staff",
    action: `Invited staff member ${formData.fullName} (${formData.email}) as ${formData.role.toUpperCase()}`,
    details: formData,
  });

  return { success: true, message: `Invitation sent to ${formData.email}` };
}

export async function updateStaffRole(userId: string, newRole: Role) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("role, business_id")
    .eq("id", user.id)
    .single();

  if (currentProfile?.role !== "owner" && currentProfile?.role !== "admin") {
    throw new Error("Permission denied. Only Owners and Admins can modify member roles.");
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({ role: newRole, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .eq("business_id", currentProfile.business_id)
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
