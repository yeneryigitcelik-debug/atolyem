/**
 * GET /api/payment/mock-success - Mock payment success endpoint
 * 
 * For development/testing only
 * Simulates a successful payment and triggers webhook logic
 */

import { NextRequest, NextResponse } from "next/server";
import { withRequestContext } from "@/interface/middleware/with-request-context";
import { prisma } from "@/lib/db/prisma";
import { AppError, ErrorCodes } from "@/lib/api/errors";

export const GET = withRequestContext(
  async (request: NextRequest, { requestId, logger }) => {
    // Only allow in development
    if (process.env.NODE_ENV === "production") {
      throw new AppError(
        ErrorCodes.FORBIDDEN,
        "Mock payment endpoint not available in production",
        403
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      throw new AppError(
        ErrorCodes.VALIDATION_ERROR,
        "orderId parameter required",
        400
      );
    }

    // Find order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            listing: true,
            variant: true,
          },
        },
      },
    });

    if (!order) {
      throw new AppError(ErrorCodes.NOT_FOUND, "Order not found", 404);
    }

    // Check if already paid
    if (order.paymentStatus === "COMPLETED") {
      return NextResponse.redirect(
        new URL(`/siparislerim/${order.id}`, request.url)
      );
    }

    // Simulate webhook call
    const webhookPayload = {
      type: "payment.succeeded",
      paymentIntentId: order.paymentProviderRef || `mock_pi_${Date.now()}`,
      orderId: order.id,
      orderNumber: order.orderNumber,
      amountMinor: order.grandTotalMinor,
      currency: order.currency,
      paidAt: new Date().toISOString(),
    };

    // Call webhook handler logic (simplified)
    await prisma.$transaction(async (tx) => {
      // Update order
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: "PAID",
          paymentStatus: "COMPLETED",
          paidAt: new Date(),
        },
      });

      // Decrement stock
      for (const orderItem of order.items) {
        if (orderItem.variant) {
          await tx.listingVariant.updateMany({
            where: {
              id: orderItem.variantId!,
              quantityOverride: {
                gte: orderItem.quantity,
              },
            },
            data: {
              quantityOverride: {
                decrement: orderItem.quantity,
              },
            },
          });
        } else {
          await tx.listing.updateMany({
            where: {
              id: orderItem.listingId,
              baseQuantity: {
                gte: orderItem.quantity,
              },
            },
            data: {
              baseQuantity: {
                decrement: orderItem.quantity,
              },
            },
          });
        }
      }
    });

    logger.info("Mock payment processed successfully", {
      orderId: order.id,
      orderNumber: order.orderNumber,
      requestId,
    });

    // Redirect to order page
    return NextResponse.redirect(
      new URL(`/siparislerim/${order.id}`, request.url)
    );
  }
);

