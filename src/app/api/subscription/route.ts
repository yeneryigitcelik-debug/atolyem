/**
 * GET /api/subscription - Get current subscription status
 * POST /api/subscription - Activate subscription (for testing/dev)
 */

import { NextRequest, NextResponse } from "next/server";
import { withRequestContext } from "@/interface/middleware/with-request-context";
import { requireSeller } from "@/lib/auth/require-auth";
import { getSubscriptionInfo } from "@/lib/subscription/utils";
import { prisma } from "@/lib/db/prisma";
import { SubscriptionPlan, SubscriptionStatus } from "@/lib/subscription/constants";
import { AppError, ErrorCodes } from "@/lib/api/errors";
import { addMonths, startOfMonth, endOfMonth } from "date-fns";

export const GET = withRequestContext(async (request: NextRequest, { requestId }) => {
  const { user } = await requireSeller();

  const subscriptionInfo = await getSubscriptionInfo(user.id);

  // getSubscriptionInfo always returns a valid object with limitInfo
  // For users without subscription, it defaults to BASIC plan limits
  return NextResponse.json(subscriptionInfo, {
    headers: { "x-request-id": requestId },
  });
});

/**
 * POST /api/subscription - Activate subscription
 * For testing/dev: allows manual subscription activation
 * In production, this would be called by payment webhook
 */
export const POST = withRequestContext(async (request: NextRequest, { requestId, logger }) => {
  const { user } = await requireSeller();

  const body = await request.json();
  const { plan } = body;

  if (!plan || (plan !== SubscriptionPlan.BASIC && plan !== SubscriptionPlan.PREMIUM)) {
    throw new AppError(
      ErrorCodes.VALIDATION_ERROR,
      "Invalid plan. Must be BASIC or PREMIUM",
      400
    );
  }

  // Check if user already has an active subscription
  const existing = await prisma.subscription.findUnique({
    where: { userId: user.id },
  });

  const now = new Date();
  const periodStart = startOfMonth(now);
  const periodEnd = endOfMonth(now);

  if (existing) {
    // Update existing subscription
    const updated = await prisma.subscription.update({
      where: { id: existing.id },
      data: {
        plan: plan as SubscriptionPlan,
        status: SubscriptionStatus.ACTIVE,
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        canceledAt: null,
      },
    });

    logger.info("Subscription updated", {
      userId: user.id,
      subscriptionId: updated.id,
      plan: updated.plan,
    });

    return NextResponse.json(
      {
        message: "Subscription activated successfully",
        subscription: {
          id: updated.id,
          plan: updated.plan,
          status: updated.status,
          currentPeriodStart: updated.currentPeriodStart,
          currentPeriodEnd: updated.currentPeriodEnd,
        },
      },
      { status: 200, headers: { "x-request-id": requestId } }
    );
  }

  // Create new subscription
  const subscription = await prisma.subscription.create({
    data: {
      userId: user.id,
      plan: plan as SubscriptionPlan,
      status: SubscriptionStatus.ACTIVE,
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
    },
  });

  logger.info("Subscription created", {
    userId: user.id,
    subscriptionId: subscription.id,
    plan: subscription.plan,
  });

  return NextResponse.json(
    {
      message: "Subscription activated successfully",
      subscription: {
        id: subscription.id,
        plan: subscription.plan,
        status: subscription.status,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
      },
    },
    { status: 201, headers: { "x-request-id": requestId } }
  );
});


