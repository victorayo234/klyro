"use server";

import { createClient } from "@/lib/supabase/server";
import { Notification } from "@/types/database";

export async function getNotifications(): Promise<Notification[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Error fetching notifications:", error.message);
      return [];
    }

    return (data || []) as Notification[];
  } catch {
    return [];
  }
}

export async function markNotificationRead(id: string) {
  try {
    const supabase = await createClient();
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
  } catch {
    // ignore
  }
}

export async function markAllNotificationsRead() {
  try {
    const supabase = await createClient();
    await supabase.from("notifications").update({ is_read: true }).filter("is_read", "eq", false);
  } catch {
    // ignore
  }
}
