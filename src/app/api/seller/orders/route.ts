/**
 * GET /api/seller/orders - Get seller's order items
 * Only shows items belonging to the seller's shop
 */

import { NextRequest, NextResponse } from "next/server";
import { withRequestContext } from "@/interface/middleware/with-request-context";
import { requireSeller } from "@/lib/auth/require-auth";
import { paginationSchema } from "@/lib/api/validation";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

const sellerOrdersQuerySchema = paginationSchema.extend({
  status: z.enum(["pending", "processing", "shipped", "delivered", "all"]).default("all"),
});

export const GET = withRequestContext(async (request: NextRequest, { requestId }) => {
  const { user } = await requireSeller();

  const searchParams = Object.fromEntries(request.nextUrl.searchParams);
  const query = sellerOrdersQuerySchema.parse(searchParams);

  const skip = (query.page - 1) * query.limit;

  // Build where clause
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    sellerUserId: user.id,
  };

  // Filter by order status
  if (query.status !== "all") {
    const statusMap: Record<string, string[]> = {
      pending: ["PENDING_PAYMENT"],
      processing: ["PAID", "PROCESSING"],
      shipped: ["SHIPPED"],
      delivered: ["DELIVERED"],
    };
    where.order = {
      status: { in: statusMap[query.status] },
    };
  }

  const [orderItems, total] = await Promise.all([
    prisma.orderItem.findMany({
      where,
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            paymentStatus: true,
            shippingAddressSnapshot: true,
            createdAt: true,
            buyer: {
              select: {
                id: true,
                displayName: true,
                email: true,
              },
            },
          },
        },
        listing: {
          select: {
            id: true,
            slug: true,
            title: true,
            media: {
              where: { isPrimary: true },
              take: 1,
            },
          },
        },
        digitalDelivery: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: query.limit,
    }),
    prisma.orderItem.count({ where }),
  ]);

  return NextResponse.json(
    {
      orderItems: orderItems.map((item) => ({
        id: item.id,
        order: {
          id: item.order.id,
          orderNumber: item.order.orderNumber,
          status: item.order.status,
          paymentStatus: item.order.paymentStatus,
          buyer: {
            displayName: item.order.buyer.displayName || item.order.buyer.email,
          },
          shippingAddress: item.order.shippingAddressSnapshot,
          createdAt: item.order.createdAt,
        },
        listing: {
          id: item.listing.id,
          slug: item.listing.slug,
          title: item.listing.title,
          thumbnail: item.listing.media[0]?.url ?? null,
        },
        title: item.titleSnapshot,
        quantity: item.quantity,
        unitPriceMinor: item.unitPriceMinor,
        totalPriceMinor: item.totalPriceMinor,
        currency: item.currency,
        variant: item.variantSnapshot,
        personalization: item.personalizationSnapshot,
        processingTime: item.processingTimeSnapshot,
        estimatedShipByDate: item.estimatedShipByDate,
        shippedAt: item.shippedAt,
        trackingNumber: item.trackingNumber,
        deliveredAt: item.deliveredAt,
        isDigital: !!item.digitalDelivery,
        digitalDelivery: item.digitalDelivery
          ? {
              status: item.digitalDelivery.status,
              deliveredAt: item.digitalDelivery.deliveredAt,
            }
          : null,
        createdAt: item.createdAt,
      })),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    },
    { headers: { "x-request-id": requestId } }
  );
});
