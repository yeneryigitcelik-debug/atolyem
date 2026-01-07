"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { User, Session } from "@supabase/supabase-js";

interface UserProfile {
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bannerUrl: string | null;
  bio: string | null;
  location: string | null;
  websiteUrl: string | null;
  instagramHandle: string | null;
  isPublic: boolean;
  isArtist: boolean;
  shopSlug: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signUp: (email: string, password: string, metadata?: { full_name?: string }) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check environment variables on mount
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!url || url.includes("YOUR_PROJECT_ID")) {
      console.error("❌ NEXT_PUBLIC_SUPABASE_URL eksik veya placeholder değer içeriyor!");
      console.error("Lütfen .env.local dosyanızı kontrol edin ve gerçek Supabase URL'inizi girin.");
    }
    
    if (!key || key.includes("your-anon-key")) {
      console.error("❌ NEXT_PUBLIC_SUPABASE_ANON_KEY eksik veya placeholder değer içeriyor!");
      console.error("Lütfen .env.local dosyanızı kontrol edin ve gerçek Supabase anon key'inizi girin.");
    }
  }, []);
  
  const supabase = createSupabaseBrowserClient();

  // Fetch user profile from API
  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch("/api/me/profile");
      if (response.ok) {
        const data = await response.json();
        setProfile({
          username: data.profile.username,
          displayName: data.profile.displayName,
          avatarUrl: data.profile.avatarUrl,
          bannerUrl: data.profile.bannerUrl,
          bio: data.profile.bio,
          location: data.profile.location,
          websiteUrl: data.profile.websiteUrl,
          instagramHandle: data.profile.instagramHandle,
          isPublic: data.profile.isPublic,
          isArtist: data.profile.isArtist,
          shopSlug: data.profile.shopSlug,
        });
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setProfile(null);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    await fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
      
      // Fetch profile if user is logged in
      if (session?.user) {
        fetchProfile();
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
        
        // Fetch or clear profile based on auth state
        if (session?.user) {
          fetchProfile();
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth, fetchProfile]);

  const signUp = useCallback(async (
    email: string, 
    password: string, 
    metadata?: { full_name?: string }
  ) => {
    try {
      // Check if Supabase is configured
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!url || url.includes("YOUR_PROJECT_ID") || !key || key.includes("your-anon-key")) {
        return { 
          error: new Error(
            "Supabase yapılandırması eksik! Lütfen .env.local dosyanızı kontrol edin.\n\n" +
            "SUPABASE_SETUP.md dosyasındaki adımları takip edin."
          )
        };
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) {
        console.error("Sign up error:", error);
        return { error: error as Error };
      }
      
      return { error: null };
    } catch (error) {
      console.error("Sign up exception:", error);
      
      // Check if it's a network error
      if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
        return { 
          error: new Error(
            "Supabase'e bağlanılamıyor. Lütfen:\n" +
            "1. .env.local dosyasındaki NEXT_PUBLIC_SUPABASE_URL değerini kontrol edin\n" +
            "2. Supabase projenizin aktif olduğundan emin olun\n" +
            "3. İnternet bağlantınızı kontrol edin"
          )
        };
      }
      
      return { 
        error: error instanceof Error 
          ? error 
          : new Error("Kayıt işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.")
      };
    }
  }, [supabase.auth]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error("Sign in error:", error);
        return { error: error as Error };
      }
      
      return { error: null };
    } catch (error) {
      console.error("Sign in exception:", error);
      return { 
        error: error instanceof Error 
          ? error 
          : new Error("Giriş işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.")
      };
    }
  }, [supabase.auth]);

  const signInWithGoogle = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      return { error: error as Error | null };
    } catch (error) {
      return { error: error as Error };
    }
  }, [supabase.auth]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, [supabase.auth]);

  const resetPassword = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
      });
      return { error: error as Error | null };
    } catch (error) {
      return { error: error as Error };
    }
  }, [supabase.auth]);

  const value = {
    user,
    session,
    profile,
    isLoading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

