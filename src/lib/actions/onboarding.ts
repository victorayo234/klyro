"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface OnboardingData {
  industry: string;
  team_size_bracket: string;
  primary_goal: string;
  currency: string;
  monthly_revenue_target?: number;
  monthly_profit_target?: number;
}

export async function completeOnboarding(data: OnboardingData) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    // Get user's business_id
    const { data: profile } = await supabase
      .from("profiles")
      .select("business_id")
      .eq("id", user.id)
      .maybeSingle();

    let businessId = profile?.business_id;

    if (!businessId) {
      // Auto-provision business and profile if not created during signup
      const { data: newBiz, error: newBizErr } = await supabase
        .from("businesses")
        .insert({
          name: (user.user_metadata?.business_name as string) || "My Workspace",
          industry: data.industry,
          team_size_bracket: data.team_size_bracket,
          primary_goal: data.primary_goal,
          currency: data.currency,
          monthly_revenue_target: typeof data.monthly_revenue_target === "number" ? data.monthly_revenue_target : 10000,
          monthly_profit_target: typeof data.monthly_profit_target === "number" ? data.monthly_profit_target : 4000,
          onboarding_completed: true,
        })
        .select("id")
        .single();

      if (newBizErr || !newBiz) {
        return { success: false, error: newBizErr?.message || "Could not create business profile" };
      }

      businessId = newBiz.id;

      await supabase.from("profiles").upsert({
        id: user.id,
        business_id: businessId,
        full_name: (user.user_metadata?.full_name as string) || user.email?.split("@")[0] || "Owner",
        email: user.email || "",
        role: "owner",
      });
    }

    // Update business with answers and financial targets
    const { error: updateError } = await supabase
      .from("businesses")
      .update({
        industry: data.industry,
        team_size_bracket: data.team_size_bracket,
        primary_goal: data.primary_goal,
        currency: data.currency,
        monthly_revenue_target: typeof data.monthly_revenue_target === "number" ? data.monthly_revenue_target : 10000,
        monthly_profit_target: typeof data.monthly_profit_target === "number" ? data.monthly_profit_target : 4000,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", businessId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    // Also record an activity log
    await supabase.from("activity_logs").insert({
      business_id: businessId,
      user_id: user.id,
      entity_type: "business",
      entity_id: businessId,
      action: "Completed personalized onboarding workspace setup",
      details: {
        industry: data.industry,
        primary_goal: data.primary_goal,
        team_size: data.team_size_bracket,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/onboarding");
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to save onboarding settings";
    return { success: false, error: msg };
  }
}

export async function getBusinessOnboardingStatus() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, business_id, businesses(*)")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile) return null;
    return {
      role: profile.role,
      businessId: profile.business_id,
      business: profile.businesses,
    };
  } catch {
    return null;
  }
}
