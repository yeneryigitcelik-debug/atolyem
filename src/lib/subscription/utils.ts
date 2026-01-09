/**
 * Subscription utility functions
 */

import { prisma } from "@/lib/db/prisma";
import { SubscriptionPlan, SubscriptionStatus, SUBSCRIPTION_LIMITS } from "./constants";

/**
 * Get current month start/end in Europe/Istanbul timezone
 */
function getCurrentMonthRange(): { start: Date; end: Date } {
  // Get current date in Istanbul timezone
  const now = new Date();
  const istanbulFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = istanbulFormatter.formatToParts(now);
  const year = parseInt(parts.find(p => p.type === "year")?.value || "2024");
  const month = parseInt(parts.find(p => p.type === "month")?.value || "1") - 1;

  // Start of current month in Istanbul (00:00:00)
  const monthStart = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
  // Adjust for Istanbul timezone (UTC+3)
  monthStart.setHours(monthStart.getHours() - 3);

  // Start of next month in Istanbul (00:00:00)
  const monthEnd = new Date(Date.UTC(year, month + 1, 1, 0, 0, 0, 0));
  monthEnd.setHours(monthEnd.getHours() - 3);

  return { start: monthStart, end: monthEnd };
}

/**
 * Get user's active subscription
 */
export async function getUserSubscription(userId: string) {
  return await prisma.subscription.findFirst({
    where: {
      userId,
      status: SubscriptionStatus.ACTIVE,
    },
  });
}

/**
 * Check if user can create a listing based on subscription
 * Returns { canCreate: boolean, reason?: string, remaining?: number }
 * 
 * Rules:
 * - No subscription = BASIC plan (3 listings/month default)
 * - BASIC plan = 3 listings per calendar month (Europe/Istanbul timezone)
 * - PREMIUM plan = Unlimited listings
 */
export async function checkListingLimit(userId: string): Promise<{
  canCreate: boolean;
  reason?: string;
  remaining?: number;
  currentCount?: number;
  limit?: number;
}> {
  // Get active subscription
  const subscription = await getUserSubscription(userId);

  // Determine plan - default to BASIC if no subscription
  const plan = subscription?.plan as SubscriptionPlan | undefined;
  const effectivePlan = plan || SubscriptionPlan.BASIC;
  const limit = SUBSCRIPTION_LIMITS[effectivePlan];

  // Premium has unlimited listings
  if (limit === Infinity) {
    return {
      canCreate: true,
      remaining: Infinity,
      currentCount: 0,
      limit: Infinity,
    };
  }

  // For Basic plan (or no subscription), count listings created in current month
  const { start: monthStart, end: monthEnd } = getCurrentMonthRange();

  const listingCount = await prisma.listing.count({
    where: {
      sellerUserId: userId,
      createdAt: {
        gte: monthStart,
        lt: monthEnd,
      },
    },
  });

  const remaining = limit - listingCount;

  if (listingCount >= limit) {
    return {
      canCreate: false,
      reason: `Basic pakette aylık ${limit} ürün yükleyebilirsiniz. Premium ile sınırsız ürün yükleyin.`,
      remaining: 0,
      currentCount: listingCount,
      limit,
    };
  }

  return {
    canCreate: true,
    remaining,
    currentCount: listingCount,
    limit,
  };
}

/**
 * Get subscription info for display
 */
export async function getSubscriptionInfo(userId: string) {
  const subscription = await getUserSubscription(userId);
  const limitCheck = await checkListingLimit(userId);

  return {
    subscription: subscription
      ? {
          id: subscription.id,
          plan: subscription.plan,
          status: subscription.status,
          currentPeriodStart: subscription.currentPeriodStart,
          currentPeriodEnd: subscription.currentPeriodEnd,
          canceledAt: subscription.canceledAt,
        }
      : null,
    limitInfo: {
      canCreate: limitCheck.canCreate,
      remaining: limitCheck.remaining,
      currentCount: limitCheck.currentCount,
      limit: limitCheck.limit,
    },
  };
}
