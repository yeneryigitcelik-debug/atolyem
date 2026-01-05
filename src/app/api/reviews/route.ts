/**
 * POST /api/reviews - Create a review for an order item
 */

import { NextRequest, NextResponse } from "next/server";
import { withRequestContext } from "@/interface/middleware/with-request-context";
import { requireBuyer } from "@/lib/auth/require-auth";
import { createReviewSchema } from "@/lib/api/validation";
import { prisma } from "@/lib/db/prisma";
import {
  assertCanReview,
  validateReviewContent,
} from "@/application/integrity-rules/review-rules";
import { NotFoundError, AppError, ErrorCodes } from "@/lib/api/errors";
import { Prisma } from "@prisma/client";

export const POST = withRequestContext(
  async (request: NextRequest, { requestId, logger }) => {
    const { user } = await requireBuyer();

    const body = await request.json();
    const data = createReviewSchema.parse(body);

    // Get order item with related data
    const orderItem = await prisma.orderItem.findUnique({
      where: { id: data.orderItemId },
      include: {
        order: true,
        listing: true,
        digitalDelivery: true,
        review: true,
      },
    });

    if (!orderItem) {
      throw new NotFoundError("Order item");
    }

    // Check review eligibility
    assertCanReview(
      {
        orderItemId: orderItem.id,
        orderStatus: orderItem.order.status,
        buyerUserId: orderItem.order.buyerUserId,
        isDigital: !!orderItem.digitalDelivery,
        estimatedDeliveryDate: orderItem.estimatedShipByDate,
        actualDeliveredAt: orderItem.deliveredAt,
        firstDownloadedAt: orderItem.digitalDelivery?.firstDownloadedAt,
        existingReviewId: orderItem.review?.id,
        orderCreatedAt: orderItem.order.createdAt,
        orderPaidAt: orderItem.order.paidAt,
      },
      user.id
    );

    // Validate review content
    const validation = validateReviewContent(data.rating, data.reviewText);
    if (!validation.valid) {
      throw new AppError(
        ErrorCodes.VALIDATION_ERROR,
        "Invalid review content",
        400,
        validation.errors
      );
    }

    // Create review
    const photosJson = data.photos
      ? (data.photos as Prisma.InputJsonValue)
      : undefined;

    const review = await prisma.review.create({
      data: {
        orderItemId: orderItem.id,
        listingId: orderItem.listingId,
        shopId: orderItem.shopId,
        buyerUserId: user.id,
        rating: data.rating,
        reviewText: data.reviewText,
        photosJson,
      },
    });

    logger.info("Review created", {
      reviewId: review.id,
      orderItemId: orderItem.id,
      listingId: orderItem.listingId,
      rating: review.rating,
    });

    return NextResponse.json(
      {
        message: "Review submitted successfully",
        review: {
          id: review.id,
          rating: review.rating,
          reviewText: review.reviewText,
          createdAt: review.createdAt,
        },
      },
      { status: 201, headers: { "x-request-id": requestId } }
    );
  }
);
