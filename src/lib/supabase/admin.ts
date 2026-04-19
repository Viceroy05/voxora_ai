import { createClient } from "@supabase/supabase-js";

import { getSupabaseAdminConfig } from "@/lib/env";

export function createSupabaseAdminClient() {
  const { url, secretKey } = getSupabaseAdminConfig();

  return createClient(url, secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
