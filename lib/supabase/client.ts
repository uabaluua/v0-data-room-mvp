import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  // For client-side, we MUST use NEXT_PUBLIC_ prefixed variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables. Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.",
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
