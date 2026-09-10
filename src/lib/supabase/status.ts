import { createClient } from "./client";

export interface SupabaseStatus {
  isConfigured: boolean;
  isReachable: boolean;
  url: string | null;
  message: string;
}

export async function checkSupabaseConnection(): Promise<SupabaseStatus> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key || url.includes("placeholder-project") || key.includes("placeholder")) {
    return {
      isConfigured: false,
      isReachable: false,
      url: url || null,
      message: "Supabase credentials are using placeholder values in .env.local. Add your real Supabase project URL and anon key to connect.",
    };
  }

  try {
    const supabase = createClient();
    const { error } = await supabase.from("businesses").select("count", { count: "exact", head: true });
    
    if (error && error.code !== "PGRST116" && error.code !== "42P01") {
      // 42P01 is relation does not exist yet (schema not applied), which means reachable!
      return {
        isConfigured: true,
        isReachable: false,
        url,
        message: `Supabase reached but returned error: ${error.message} (Code: ${error.code})`,
      };
    }

    return {
      isConfigured: true,
      isReachable: true,
      url,
      message: "Successfully connected to Supabase!",
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      isConfigured: true,
      isReachable: false,
      url,
      message: `Failed to reach Supabase: ${errorMsg}`,
    };
  }
}
