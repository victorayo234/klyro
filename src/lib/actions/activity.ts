"use server";

import { createClient } from "@/lib/supabase/server";

export async function logActivity({
  entityType,
  entityId,
  action,
  details = {},
}: {
  entityType: string;
  entityId?: string;
  action: string;
  details?: Record<string, unknown>;
}) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let businessId: string | null = null;
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("business_id")
        .eq("id", user.id)
        .single();
      if (profile) businessId = profile.business_id;
    }

    if (businessId) {
      await supabase.from("activity_logs").insert({
        business_id: businessId,
        user_id: user?.id || null,
        entity_type: entityType,
        entity_id: entityId || null,
        action,
        details,
      });
    }
  } catch (err) {
    console.error("Failed to log activity:", err);
  }
}
