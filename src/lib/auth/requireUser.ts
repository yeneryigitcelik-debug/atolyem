/**
 * Gets the authenticated Supabase user and upserts the app_user record.
 * Returns the full UserContext with user data, preferences, and seller profile.
 */

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/prisma";
import type { UserContext } from "./types";
import { AUTH_ERRORS } from "./types";
import { AccountType } from "@prisma/client";

export class AuthenticationError extends Error {
  constructor(
    public code: string,
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "AuthenticationError";
  }
}

/**
 * Requires an authenticated user and returns their full context.
 * Automatically creates app_user on first login.
 *
 * @throws AuthenticationError if user is not authenticated
 */
export async function requireUser(): Promise<UserContext> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new AuthenticationError(
      AUTH_ERRORS.UNAUTHORIZED.code,
      AUTH_ERRORS.UNAUTHORIZED.status,
      AUTH_ERRORS.UNAUTHORIZED.message
    );
  }

  // Upsert app_user - creates on first login, updates on subsequent logins
  const appUser = await prisma.appUser.upsert({
    where: { id: user.id },
    create: {
      id: user.id,
      email: user.email!,
      phone: user.phone ?? null,
      fullName: user.user_metadata?.full_name ?? null,
      accountType: AccountType.BUYER,
    },
    update: {
      email: user.email!,
      // Don't overwrite phone/fullName if already set
    },
  });

  // Fetch preferences and seller profile
  const [preferences, sellerProfile] = await Promise.all([
    prisma.userPreferences.findUnique({
      where: { userId: user.id },
    }),
    prisma.sellerProfile.findUnique({
      where: { userId: user.id },
    }),
  ]);

  return {
    supabaseUserId: user.id,
    appUser,
    preferences,
    sellerProfile,
  };
}

/**
 * Optional authentication - returns null if not authenticated.
 */
export async function getOptionalUser(): Promise<UserContext | null> {
  try {
    return await requireUser();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return null;
    }
    throw error;
  }
}

