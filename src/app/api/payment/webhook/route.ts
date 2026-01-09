/**
 * POST /api/payment/webhook - Payment webhook handler
 * 
 * This endpoint receives payment confirmation from payment providers
 * and updates order status + decrements stock
 * 
 * CRITICAL: This is the only place where stock is decremented after payment
 */

import { NextRequest, NextResponse } from "next/server";
import { withRequestContext } from "@/interface/middleware/with-request-context";
import { prisma } from "@/lib/db/prisma";
import { getPaymentProvider } from "@/lib/payment/payment-provider";
import { AppError, ErrorCodes } from "@/lib/api/errors";

export const POST = withRequestContext(
  async (request: NextRequest, { requestId, logger }) => {
    // Get webhook signature from headers
    const signature = request.headers.get("x-payment-signature") || "";
    const webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET || "dev-secret";

    // Read raw body for signature verification
    const rawBody = await request.text();
    const body = JSON.parse(rawBody);

    // Verify webhook signature
    const paymentProvider = getPaymentProvider();
    let webhookEvent;

    try {
      webhookEvent = await paymentProvider.verifyWebhook(
        rawBody,
        signature,
        webhookSecret
      );
    } catch (error) {
      logger.error("Webhook signature verification failed", {
        error: error instanceof Error ? error.message : String(error),
        requestId,
      });
      throw new AppError(
        ErrorCodes.UNAUTHORIZED,
        "Invalid webhook signature",
        401
      );
    }

    // Handle payment events
    if (webhookEvent.type === "payment.succeeded") {
      // Find order by orderId or orderNumber
      const order = await prisma.order.findFirst({
        where: {
          OR: [
            { id: webhookEvent.orderId },
            { orderNumber: webhookEvent.orderNumber },
          ],
        },
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
        logger.error("Order not found for webhook", {
          orderId: webhookEvent.orderId,
          orderNumber: webhookEvent.orderNumber,
          requestId,
        });
        throw new AppError(ErrorCodes.NOT_FOUND, "Order not found", 404);
      }

      // Check if order is already paid (idempotency)
      if (order.paymentStatus === "COMPLETED") {
        logger.info("Order already paid, ignoring webhook", {
          orderId: order.id,
          orderNumber: order.orderNumber,
          requestId,
        });
        return NextResponse.json(
          { message: "Order already paid" },
          { status: 200, headers: { "x-request-id": requestId } }
        );
      }

      // Update order status and decrement stock in a transaction
      await prisma.$transaction(async (tx) => {
        // Update order payment status
        await tx.order.update({
          where: { id: order.id },
          data: {
            status: "PAID",
            paymentStatus: "COMPLETED",
            paidAt: webhookEvent.paidAt || new Date(),
            paymentProviderRef: webhookEvent.paymentIntentId,
          },
        });

        // Decrement stock for each order item
        // CRITICAL: This is where stock is actually decremented
        for (const orderItem of order.items) {
          if (orderItem.variant) {
            // For variants: check quantityOverride >= requested quantity
            const updateResult = await tx.listingVariant.updateMany({
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

            if (updateResult.count === 0) {
              logger.error("Insufficient stock when processing payment", {
                orderId: order.id,
                orderItemId: orderItem.id,
                variantId: orderItem.variantId,
                quantity: orderItem.quantity,
                requestId,
              });
              // Note: In production, you might want to handle this differently
              // (e.g., refund payment, notify seller, etc.)
              throw new AppError(
                ErrorCodes.INSUFFICIENT_STOCK,
                `Insufficient stock for variant ${orderItem.variantId}. Payment processed but stock unavailable.`,
                409
              );
            }
          } else {
            // For base listing: check baseQuantity >= requested quantity
            const updateResult = await tx.listing.updateMany({
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

            if (updateResult.count === 0) {
              logger.error("Insufficient stock when processing payment", {
                orderId: order.id,
                orderItemId: orderItem.id,
                listingId: orderItem.listingId,
                quantity: orderItem.quantity,
                requestId,
              });
              throw new AppError(
                ErrorCodes.INSUFFICIENT_STOCK,
                `Insufficient stock for listing ${orderItem.listingId}. Payment processed but stock unavailable.`,
                409
              );
            }
          }
        }
      });

      logger.info("Payment processed successfully, stock decremented", {
        orderId: order.id,
        orderNumber: order.orderNumber,
        paymentIntentId: webhookEvent.paymentIntentId,
        itemCount: order.items.length,
        requestId,
      });

      return NextResponse.json(
        {
          message: "Payment processed successfully",
          orderId: order.id,
          orderNumber: order.orderNumber,
        },
        { status: 200, headers: { "x-request-id": requestId } }
      );
    } else if (webhookEvent.type === "payment.failed") {
      // Handle failed payment
      const order = await prisma.order.findFirst({
        where: {
          OR: [
            { id: webhookEvent.orderId },
            { orderNumber: webhookEvent.orderNumber },
          ],
        },
      });

      if (order && order.paymentStatus === "PENDING") {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: "FAILED",
          },
        });

        logger.info("Payment failed, order updated", {
          orderId: order.id,
          orderNumber: order.orderNumber,
          failureReason: webhookEvent.failureReason,
          requestId,
        });
      }

      return NextResponse.json(
        { message: "Payment failure processed" },
        { status: 200, headers: { "x-request-id": requestId } }
      );
    } else if (webhookEvent.type === "payment.canceled") {
      // Handle canceled payment
      const order = await prisma.order.findFirst({
        where: {
          OR: [
            { id: webhookEvent.orderId },
            { orderNumber: webhookEvent.orderNumber },
          ],
        },
      });

      if (order && order.paymentStatus === "PENDING") {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: "CANCELLED",
            paymentStatus: "FAILED",
            cancelledAt: new Date(),
          },
        });

        logger.info("Payment canceled, order cancelled", {
          orderId: order.id,
          orderNumber: order.orderNumber,
          requestId,
        });
      }

      return NextResponse.json(
        { message: "Payment cancellation processed" },
        { status: 200, headers: { "x-request-id": requestId } }
      );
    }

    // Unknown event type
    logger.warn("Unknown webhook event type", {
      eventType: webhookEvent.type,
      requestId,
    });

    return NextResponse.json(
      { message: "Event received but not processed" },
      { status: 200, headers: { "x-request-id": requestId } }
    );
  }
);

