import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase admin client.
 * Protected with `import "server-only"` to guarantee that this module and the
 * service role key NEVER leak into client-side bundles.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export function getAdminClient() {
  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
