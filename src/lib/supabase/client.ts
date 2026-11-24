import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Session, User } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder-anon-key";

/** Browser Supabase client (anon key only — never expose service role). */
export const supabase = createSupabaseClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export type { Session, User };
