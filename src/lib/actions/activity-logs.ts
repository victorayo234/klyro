"use server";

import { createClient } from "@/lib/supabase/server";
import { ActivityLog } from "@/types/database";

export async function getActivityLogs(): Promise<ActivityLog[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("activity_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.warn("Error fetching activity logs:", error.message);
      return [];
    }

    return (data || []) as ActivityLog[];
  } catch {
    return [];
  }
}
