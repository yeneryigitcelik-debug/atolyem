/**
 * PATCH /api/cart/items/:id - Update cart item quantity
 * DELETE /api/cart/items/:id - Remove cart item
 */

import { NextRequest, NextResponse } from "next/server";
import { withRequestContext } from "@/interface/middleware/with-request-context";
import { requireBuyer } from "@/lib/auth/require-auth";
import { updateCartItemSchema } from "@/lib/api/validation";
import { prisma } from "@/lib/db/prisma";
import { assertSufficientStock } from "@/application/integrity-rules/stock-rules";
import { getEffectiveStock } from "@/application/integrity-rules/pricing-rules";
import { NotFoundError, ForbiddenError } from "@/lib/api/errors";
import { Prisma } from "@prisma/client";

type RouteParams = { id: string };

export const PATCH = withRequestContext<RouteParams>(
  async (request: NextRequest, { requestId, logger, params }) => {
    const { user } = await requireBuyer();
    const { id } = params!;

    const cartItem = await prisma.cartItem.findUnique({
      where: { id },
      include: {
        cart: true,
        listing: true,
        variant: true,
      },
    });

    if (!cartItem) {
      throw new NotFoundError("Cart item");
    }

    if (cartItem.cart.userId !== user.id) {
      throw new ForbiddenError("You can only modify your own cart");
    }

    const body = await request.json();
    const data = updateCartItemSchema.parse(body);

    // Check stock for new quantity
    const currentStock = getEffectiveStock(
      cartItem.listing.baseQuantity,
      cartItem.variant?.quantityOverride
    );

    assertSufficientStock({
      listingId: cartItem.listingId,
      variantId: cartItem.variantId ?? undefined,
      currentStock,
      requestedQuantity: data.quantity,
      listingStatus: cartItem.listing.status,
    });

    const personalizationData = data.personalization
      ? (data.personalization as Prisma.InputJsonValue)
      : undefined;

    const updatedItem = await prisma.cartItem.update({
      where: { id },
      data: {
        quantity: data.quantity,
        personalizationJson: personalizationData,
      },
    });

    logger.info("Cart item updated", { cartItemId: id, newQuantity: data.quantity });

    return NextResponse.json(
      {
        message: "Cart item updated",
        cartItem: {
          id: updatedItem.id,
          quantity: updatedItem.quantity,
        },
      },
      { headers: { "x-request-id": requestId } }
    );
  }
);

export const DELETE = withRequestContext<RouteParams>(
  async (request, { requestId, logger, params }) => {
    const { user } = await requireBuyer();
    const { id } = params!;

    const cartItem = await prisma.cartItem.findUnique({
      where: { id },
      include: { cart: true },
    });

    if (!cartItem) {
      throw new NotFoundError("Cart item");
    }

    if (cartItem.cart.userId !== user.id) {
      throw new ForbiddenError("You can only modify your own cart");
    }

    await prisma.cartItem.delete({
      where: { id },
    });

    logger.info("Cart item removed", { cartItemId: id });

    return NextResponse.json(
      { message: "Item removed from cart" },
      { headers: { "x-request-id": requestId } }
    );
  }
);
