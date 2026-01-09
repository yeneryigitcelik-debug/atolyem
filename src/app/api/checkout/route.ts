/**
 * POST /api/checkout - Create order from cart (idempotent)
 *
 * This is a critical endpoint with multiple integrity checks:
 * - Idempotency via idempotencyKey
 * - Stock validation with DB transaction
 * - Price calculation server-side
 * - Self-purchase prevention
 * - Snapshot creation for all order data
 */

import { NextRequest, NextResponse } from "next/server";
import { withRequestContext } from "@/interface/middleware/with-request-context";
import { requireBuyer } from "@/lib/auth/require-auth";
import { checkoutSchema } from "@/lib/api/validation";
import { prisma } from "@/lib/db/prisma";
import { validateCartItemsForCheckout } from "@/application/integrity-rules/stock-rules";
import {
  calculateOrderTotals,
  getEffectivePrice,
  getEffectiveStock,
  createOrderItemSnapshot,
  calculateShippingTotal,
  type ShippingRules,
} from "@/application/integrity-rules/pricing-rules";
import { AppError, ErrorCodes } from "@/lib/api/errors";
import { nanoid } from "nanoid";
import { Prisma } from "@prisma/client";
import { getPaymentProvider } from "@/lib/payment/payment-provider";
import { getTaxRate } from "@/lib/tax/tax-rates";

export const POST = withRequestContext(
  async (request: NextRequest, { requestId, logger }) => {
    const { user } = await requireBuyer();

    const body = await request.json();
    const data = checkoutSchema.parse(body);

    // Check for existing order with same idempotency key
    const existingOrder = await prisma.order.findUnique({
      where: { idempotencyKey: data.idempotencyKey },
      include: {
        items: {
          include: { listing: { select: { title: true, slug: true } } },
        },
      },
    });

    if (existingOrder) {
      logger.info("Returning existing order (idempotent)", {
        orderId: existingOrder.id,
        idempotencyKey: data.idempotencyKey,
      });

      return NextResponse.json(
        {
          message: "Order already exists",
          order: {
            id: existingOrder.id,
            orderNumber: existingOrder.orderNumber,
            status: existingOrder.status,
            grandTotalMinor: existingOrder.grandTotalMinor,
            currency: existingOrder.currency,
            items: existingOrder.items.map((item) => ({
              id: item.id,
              title: item.titleSnapshot,
              quantity: item.quantity,
              unitPriceMinor: item.unitPriceMinor,
            })),
            createdAt: existingOrder.createdAt,
          },
        },
        { headers: { "x-request-id": requestId } }
      );
    }

    // Get cart with all items including shipping profiles
    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            listing: {
              include: {
                shop: { include: { policies: true } },
                processingProfile: true,
                personalizationFields: true,
                shippingProfile: true,
              },
            },
            variant: {
              include: {
                selections: {
                  include: { option: { include: { group: true } } },
                },
              },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new AppError(ErrorCodes.CART_EMPTY, "Your cart is empty", 400);
    }

    // Validate all items
    const itemsWithStock = cart.items.map((item) => ({
      cartItemId: item.id,
      listingId: item.listingId,
      variantId: item.variantId ?? undefined,
      quantity: item.quantity,
      listing: {
        status: item.listing.status,
        complianceStatus: item.listing.complianceStatus,
        sellerUserId: item.listing.sellerUserId,
      },
      currentStock: getEffectiveStock(
        item.listing.baseQuantity,
        item.variant?.quantityOverride
      ),
    }));

    const validations = validateCartItemsForCheckout(itemsWithStock, user.id);
    const invalidItems = validations.filter((v) => !v.isValid);

    if (invalidItems.length > 0) {
      throw new AppError(
        ErrorCodes.CHECKOUT_FAILED,
        "Some items in your cart cannot be purchased",
        400,
        invalidItems
      );
    }

    // Calculate pricing server-side
    const lineItems = cart.items.map((item) => ({
      listingId: item.listingId,
      variantId: item.variantId ?? undefined,
      quantity: item.quantity,
      unitPriceMinor: getEffectivePrice(
        item.listing.basePriceMinor,
        item.variant?.priceMinorOverride
      ),
      currency: item.listing.currency,
    }));

    // Calculate shipping using ShippingProfile rules
    // Group items by shop and calculate shipping per seller
    const shippingItems = cart.items.map((item) => {
      const unitPrice = getEffectivePrice(
        item.listing.basePriceMinor,
        item.variant?.priceMinorOverride
      );

      // Get shipping profile rules (default if not set on listing)
      const shippingRules = item.listing.shippingProfile?.rulesJson as ShippingRules | undefined;
      
      if (!shippingRules) {
        // Fallback: if no shipping profile, use 0 shipping
        // In production, you might want to throw an error or use shop default
        return {
          shopId: item.listing.shopId,
          quantity: item.quantity,
          unitPriceMinor: unitPrice,
          shippingRules: {
            domestic: { basePriceMinor: 0 },
          } as ShippingRules,
          isInternational: false, // TODO: Determine from shipping address
        };
      }

      // Determine if international shipping (simplified - check if address country != TR)
      const isInternational = (data.shippingAddress as { country?: string })?.country !== "TR";

      return {
        shopId: item.listing.shopId,
        quantity: item.quantity,
        unitPriceMinor: unitPrice,
        shippingRules,
        isInternational,
      };
    });

    const shippingTotal = calculateShippingTotal(shippingItems, "TRY");
    const totals = calculateOrderTotals(
      lineItems,
      shippingTotal.amountMinor,
      0,
      "TRY"
    );

    // CRITICAL: Create order WITHOUT decrementing stock
    // Stock will be decremented only after payment confirmation via webhook
    const order = await prisma.$transaction(async (tx) => {
      // Generate order number
      const orderNumber = `ATL-${Date.now()
        .toString(36)
        .toUpperCase()}-${nanoid(4).toUpperCase()}`;

      // Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          buyerUserId: user.id,
          status: "PENDING_PAYMENT",
          paymentStatus: "PENDING",
          subtotalMinor: totals.subtotalMinor,
          shippingTotalMinor: totals.shippingTotalMinor,
          discountTotalMinor: totals.discountTotalMinor,
          grandTotalMinor: totals.grandTotalMinor,
          currency: totals.currency,
          shippingAddressSnapshot: data.shippingAddress as Prisma.InputJsonValue,
          idempotencyKey: data.idempotencyKey,
        },
      });

      // Get tax rate for invoice (based on shipping address country)
      const shippingCountry = (data.shippingAddress as { country?: string })?.country || "TR";
      const taxRate = getTaxRate(shippingCountry);

      // Create order items with snapshots
      for (const cartItem of cart.items) {
        const unitPrice = getEffectivePrice(
          cartItem.listing.basePriceMinor,
          cartItem.variant?.priceMinorOverride
        );

        // Create snapshot
        const snapshot = createOrderItemSnapshot({
          title: cartItem.listing.title,
          listingType: cartItem.listing.listingType,
          unitPriceMinor: unitPrice,
          currency: cartItem.listing.currency,
          variantSelections: cartItem.variant?.selections.map((s) => ({
            groupName: s.option.group.name,
            optionValue: s.option.value,
          })),
          personalization: cartItem.personalizationJson as
            | Record<string, string>
            | undefined,
          processingProfile: cartItem.listing.processingProfile
            ? {
                mode: cartItem.listing.processingProfile.mode,
                minDays: cartItem.listing.processingProfile.minDays,
                maxDays: cartItem.listing.processingProfile.maxDays,
              }
            : undefined,
          returnPolicy: {
            type:
              cartItem.listing.returnPolicyType ??
              cartItem.listing.shop.policies?.returnPolicyType ??
              "RETURNS_ACCEPTED",
            windowDays:
              cartItem.listing.returnWindowDays ??
              cartItem.listing.shop.policies?.returnWindowDays ??
              14,
          },
        });

        // Calculate estimated ship-by date
        let estimatedShipByDate: Date | null = null;
        if (cartItem.listing.processingProfile) {
          estimatedShipByDate = new Date();
          estimatedShipByDate.setDate(
            estimatedShipByDate.getDate() +
              cartItem.listing.processingProfile.maxDays
          );
        }

        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            listingId: cartItem.listingId,
            variantId: cartItem.variantId,
            sellerUserId: cartItem.listing.sellerUserId,
            shopId: cartItem.listing.shopId,
            quantity: cartItem.quantity,
            unitPriceMinor: unitPrice,
            totalPriceMinor: unitPrice * cartItem.quantity,
            currency: cartItem.listing.currency,
            titleSnapshot: snapshot.title,
            listingTypeSnapshot: snapshot.listingType,
            variantSnapshot: snapshot.variantSnapshot as Prisma.InputJsonValue | undefined,
            personalizationSnapshot: snapshot.personalizationSnapshot as Prisma.InputJsonValue | undefined,
            processingTimeSnapshot: snapshot.processingTimeSnapshot as Prisma.InputJsonValue | undefined,
            policySnapshot: snapshot.policySnapshot as Prisma.InputJsonValue | undefined,
            taxRateSnapshot: taxRate.rate, // Store tax rate at purchase time for invoice
            estimatedShipByDate,
          },
        });

        // CRITICAL: Do NOT decrement stock here
        // Stock will be decremented only after payment confirmation via webhook
        // This prevents stock from being reserved without payment
        // Stock validation was already done above, so we know stock is available
      }

      // Clear cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return newOrder;
    });

    // Create payment intent with payment provider
    const paymentProvider = getPaymentProvider();
    
    // Get user email for payment
    const userEmail = user.email;
    const buyerName = data.shippingAddress.name || user.displayName || undefined;
    const buyerPhone = data.shippingAddress.phone || user.phone || undefined;

    const paymentIntent = await paymentProvider.createPaymentIntent({
      orderId: order.id,
      orderNumber: order.orderNumber,
      amountMinor: totals.grandTotalMinor,
      currency: totals.currency,
      buyerEmail: userEmail,
      buyerName,
      buyerPhone,
      shippingAddress: data.shippingAddress,
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        userId: user.id,
      },
      returnUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/siparislerim/${order.id}`,
      webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/payment/webhook`,
    });

    // Store payment intent ID in order
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentProviderRef: paymentIntent.id,
      },
    });

    logger.info("Order and payment intent created", {
      orderId: order.id,
      orderNumber: order.orderNumber,
      paymentIntentId: paymentIntent.id,
      grandTotal: order.grandTotalMinor,
      itemCount: cart.items.length,
    });

    return NextResponse.json(
      {
        message: "Order created successfully. Please complete payment.",
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          paymentStatus: order.paymentStatus,
          subtotalMinor: order.subtotalMinor,
          shippingTotalMinor: order.shippingTotalMinor,
          discountTotalMinor: order.discountTotalMinor,
          grandTotalMinor: order.grandTotalMinor,
          currency: order.currency,
          createdAt: order.createdAt,
        },
        payment: {
          paymentIntentId: paymentIntent.id,
          clientSecret: paymentIntent.clientSecret,
          checkoutFormContent: paymentIntent.checkoutFormContent,
          redirectUrl: paymentIntent.redirectUrl,
          status: paymentIntent.status,
        },
      },
      { status: 201, headers: { "x-request-id": requestId } }
    );
  }
);
