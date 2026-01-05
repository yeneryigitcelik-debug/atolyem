/**
 * GET /api/cart - Get current user's cart
 * POST /api/cart - Add item to cart
 */

import { NextRequest, NextResponse } from "next/server";
import { withRequestContext } from "@/interface/middleware/with-request-context";
import { requireBuyer } from "@/lib/auth/require-auth";
import { addToCartSchema } from "@/lib/api/validation";
import { prisma } from "@/lib/db/prisma";
import { assertNotSelfPurchase } from "@/application/integrity-rules/ownership-rules";
import { assertListingPurchasable } from "@/application/integrity-rules/visibility-rules";
import { assertSufficientStock } from "@/application/integrity-rules/stock-rules";
import {
  assertValidPersonalization,
  requiresPersonalization,
  type PersonalizationFieldDef,
  type PersonalizationInput,
} from "@/application/integrity-rules/personalization-rules";
import {
  getEffectivePrice,
  getEffectiveStock,
} from "@/application/integrity-rules/pricing-rules";
import { NotFoundError, AppError, ErrorCodes } from "@/lib/api/errors";
import { Prisma } from "@prisma/client";

export const GET = withRequestContext(async (request, { requestId }) => {
  const { user } = await requireBuyer();

  // Get or create cart
  let cart = await prisma.cart.findUnique({
    where: { userId: user.id },
    include: {
      items: {
        include: {
          listing: {
            include: {
              shop: { select: { id: true, shopName: true, shopSlug: true } },
              media: { where: { isPrimary: true }, take: 1 },
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

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId: user.id },
      include: {
        items: {
          include: {
            listing: {
              include: {
                shop: { select: { id: true, shopName: true, shopSlug: true } },
                media: { where: { isPrimary: true }, take: 1 },
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
  }

  // Calculate totals
  let subtotalMinor = 0;
  const items = cart.items.map((item) => {
    const effectivePrice = getEffectivePrice(
      item.listing.basePriceMinor,
      item.variant?.priceMinorOverride
    );
    const itemTotal = effectivePrice * item.quantity;
    subtotalMinor += itemTotal;

    return {
      id: item.id,
      listing: {
        id: item.listing.id,
        title: item.listing.title,
        slug: item.listing.slug,
        status: item.listing.status,
        basePriceMinor: item.listing.basePriceMinor,
        currency: item.listing.currency,
        shop: item.listing.shop,
        thumbnail: item.listing.media[0]?.url ?? null,
      },
      variant: item.variant
        ? {
            id: item.variant.id,
            priceMinorOverride: item.variant.priceMinorOverride,
            selections: Object.fromEntries(
              item.variant.selections.map((s) => [
                s.option.group.name,
                s.option.value,
              ])
            ),
          }
        : null,
      quantity: item.quantity,
      personalization: item.personalizationJson,
      unitPriceMinor: effectivePrice,
      totalPriceMinor: itemTotal,
      currency: item.listing.currency,
    };
  });

  return NextResponse.json(
    {
      cart: {
        id: cart.id,
        items,
        subtotalMinor,
        currency: items[0]?.currency || "TRY",
        itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
      },
    },
    { headers: { "x-request-id": requestId } }
  );
});

export const POST = withRequestContext(
  async (request: NextRequest, { requestId, logger }) => {
    const { user } = await requireBuyer();

    const body = await request.json();
    const data = addToCartSchema.parse(body);

    // Get listing with related data
    const listing = await prisma.listing.findUnique({
      where: { id: data.listingId },
      include: {
        personalizationFields: true,
        variants: data.variantId
          ? { where: { id: data.variantId } }
          : undefined,
      },
    });

    if (!listing) {
      throw new NotFoundError("Listing");
    }

    // Integrity checks
    assertNotSelfPurchase(listing.sellerUserId, user.id);
    assertListingPurchasable({
      listingId: listing.id,
      status: listing.status,
      sellerUserId: listing.sellerUserId,
      isPrivate: listing.isPrivate,
      complianceStatus: listing.complianceStatus,
    });

    // Check variant if specified
    let variant = null;
    if (data.variantId) {
      variant = listing.variants?.find((v) => v.id === data.variantId);
      if (!variant) {
        throw new NotFoundError("Variant");
      }
      if (!variant.isActive) {
        throw new AppError(
          ErrorCodes.LISTING_NOT_AVAILABLE,
          "This variant is no longer available",
          400
        );
      }
    }

    // Check stock
    const currentStock = getEffectiveStock(
      listing.baseQuantity,
      variant?.quantityOverride
    );
    assertSufficientStock({
      listingId: listing.id,
      variantId: data.variantId ?? undefined,
      currentStock,
      requestedQuantity: data.quantity,
      listingStatus: listing.status,
    });

    // Validate personalization
    if (listing.personalizationFields.length > 0) {
      const fields: PersonalizationFieldDef[] =
        listing.personalizationFields.map((f) => ({
          id: f.id,
          label: f.label,
          isRequired: f.isRequired,
          minLength: f.minLength,
          maxLength: f.maxLength,
        }));

      if (
        requiresPersonalization(fields) &&
        !data.personalization
      ) {
        throw new AppError(
          ErrorCodes.PERSONALIZATION_REQUIRED,
          "This listing requires personalization",
          400
        );
      }

      if (data.personalization) {
        assertValidPersonalization(fields, data.personalization as PersonalizationInput);
      }
    }

    // Get or create cart
    let cart = await prisma.cart.findUnique({
      where: { userId: user.id },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: user.id },
      });
    }

    // Check if item already in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        listingId: data.listingId,
        variantId: data.variantId ?? null,
      },
    });

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + data.quantity;

      // Check stock for combined quantity
      assertSufficientStock({
        listingId: listing.id,
        variantId: data.variantId ?? undefined,
        currentStock,
        requestedQuantity: newQuantity,
        listingStatus: listing.status,
      });

      const personalizationData = data.personalization
        ? (data.personalization as Prisma.InputJsonValue)
        : undefined;

      const updatedItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: newQuantity,
          personalizationJson: personalizationData,
        },
      });

      logger.info("Cart item quantity updated", {
        cartItemId: updatedItem.id,
        listingId: data.listingId,
        newQuantity,
      });

      return NextResponse.json(
        {
          message: "Cart item quantity updated",
          cartItem: {
            id: updatedItem.id,
            quantity: updatedItem.quantity,
          },
        },
        { headers: { "x-request-id": requestId } }
      );
    }

    // Create new cart item
    const personalizationData = data.personalization
      ? (data.personalization as Prisma.InputJsonValue)
      : undefined;

    const cartItem = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        listingId: data.listingId,
        variantId: data.variantId ?? null,
        quantity: data.quantity,
        personalizationJson: personalizationData,
      },
    });

    logger.info("Item added to cart", {
      cartItemId: cartItem.id,
      listingId: data.listingId,
      quantity: data.quantity,
    });

    return NextResponse.json(
      {
        message: "Item added to cart",
        cartItem: {
          id: cartItem.id,
          listingId: cartItem.listingId,
          variantId: cartItem.variantId,
          quantity: cartItem.quantity,
        },
      },
      { status: 201, headers: { "x-request-id": requestId } }
    );
  }
);
