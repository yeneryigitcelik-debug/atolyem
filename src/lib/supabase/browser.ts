/**
 * Browser-side Supabase client.
 * Uses the anon key which is safe to expose in the browser.
 */

import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check your .env.local file:\n" +
    "- NEXT_PUBLIC_SUPABASE_URL\n" +
    "- NEXT_PUBLIC_SUPABASE_ANON_KEY"
  );
}

export function createSupabaseBrowserClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

