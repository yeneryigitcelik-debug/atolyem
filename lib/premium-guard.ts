import { db } from "@/lib/db";

/**
 * Checks if a user has active premium subscription
 */
export async function isPremiumUser(userId: string): Promise<boolean> {
  const user = await db.user.findUnique({
    where: { id: userId },
  });

  return (user as any)?.isPremium || false;
}

/**
 * Checks if a user has active subscription (more detailed check)
 */
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const subscription = await (db as any).subscription?.findFirst({
    where: {
      userId,
      status: "ACTIVE",
      OR: [
        { expiresAt: null },
        { expiresAt: { gte: new Date() } },
      ],
    },
  });

  return !!subscription;
}

/**
 * Server-side guard for premium features
 */
export async function requirePremium(userId: string): Promise<{ allowed: boolean; error?: string }> {
  const isPremium = await isPremiumUser(userId);
  
  if (!isPremium) {
    return {
      allowed: false,
      error: "Bu özellik için premium abonelik gereklidir",
    };
  }

  return { allowed: true };
}

