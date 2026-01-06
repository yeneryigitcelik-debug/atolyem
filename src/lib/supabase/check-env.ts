/**
 * Check if Supabase environment variables are properly configured.
 * This is a development helper to debug configuration issues.
 */

export function checkSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const issues: string[] = [];

  if (!url) {
    issues.push("NEXT_PUBLIC_SUPABASE_URL is missing");
  } else if (!url.startsWith("https://") || !url.includes(".supabase.co")) {
    issues.push("NEXT_PUBLIC_SUPABASE_URL format is invalid (should be https://xxx.supabase.co)");
  }

  if (!anonKey) {
    issues.push("NEXT_PUBLIC_SUPABASE_ANON_KEY is missing");
  } else if (anonKey.length < 100) {
    issues.push("NEXT_PUBLIC_SUPABASE_ANON_KEY seems too short (should be ~200+ characters)");
  }

  return {
    isValid: issues.length === 0,
    issues,
    url: url ? `${url.substring(0, 20)}...` : "NOT SET",
    hasAnonKey: !!anonKey,
  };
}

