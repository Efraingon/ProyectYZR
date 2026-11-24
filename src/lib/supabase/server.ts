import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Project } from "@/lib/types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder-anon-key";

/** Server-only Supabase client (anon key only). */
export function createClient() {
  return createSupabaseClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Fetch projects for a user on the server. */
export async function fetchDemoProjects(userId: string): Promise<{
  projects: Project[];
  error: string | null;
}> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { projects: (data as Project[]) ?? [], error: null };
  } catch (err) {
    return {
      projects: [],
      error: err instanceof Error ? err.message : "Error al cargar proyectos",
    };
  }
}
