/**
 * Subscription utility functions
 */

import { prisma } from "@/lib/db/prisma";
import { SubscriptionPlan, SubscriptionStatus, SUBSCRIPTION_LIMITS } from "./constants";
import { isWithinInterval } from "date-fns";

/**
 * Get user's active subscription
 */
export async function getUserSubscription(userId: string) {
  return await prisma.subscription.findUnique({
    where: {
      userId,
      status: SubscriptionStatus.ACTIVE,
    },
  });
}

/**
 * Check if user can create a listing based on subscription
 * Returns { canCreate: boolean, reason?: string, remaining?: number }
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

  if (!subscription) {
    return {
      canCreate: false,
      reason: "Aktif bir aboneliğiniz bulunmamaktadır. Ürün eklemek için abonelik gereklidir.",
    };
  }

  // Check if subscription is within current period
  const now = new Date();
  if (
    !isWithinInterval(now, {
      start: subscription.currentPeriodStart,
      end: subscription.currentPeriodEnd,
    })
  ) {
    return {
      canCreate: false,
      reason: "Aboneliğinizin süresi dolmuş. Lütfen aboneliğinizi yenileyin.",
    };
  }

  const plan = subscription.plan as SubscriptionPlan;
  const limit = SUBSCRIPTION_LIMITS[plan];

  // Premium has unlimited listings
  if (limit === Infinity) {
    return {
      canCreate: true,
      remaining: Infinity,
      currentCount: 0,
      limit: Infinity,
    };
  }

  // For Basic plan, count listings created in current period
  const periodStart = subscription.currentPeriodStart;
  const periodEnd = subscription.currentPeriodEnd;

  const listingCount = await prisma.listing.count({
    where: {
      sellerUserId: userId,
      createdAt: {
        gte: periodStart,
        lte: periodEnd,
      },
    },
  });

  const remaining = limit - listingCount;

  if (listingCount >= limit) {
    return {
      canCreate: false,
      reason: `Bu ay ${limit} ürün yükleme limitinize ulaştınız. Premium plana geçerek sınırsız ürün yükleyebilirsiniz.`,
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

  if (!subscription) {
    return null;
  }

  const limitCheck = await checkListingLimit(userId);

  return {
    subscription: {
      id: subscription.id,
      plan: subscription.plan,
      status: subscription.status,
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
      canceledAt: subscription.canceledAt,
    },
    limitInfo: {
      canCreate: limitCheck.canCreate,
      remaining: limitCheck.remaining,
      currentCount: limitCheck.currentCount,
      limit: limitCheck.limit,
    },
  };
}

