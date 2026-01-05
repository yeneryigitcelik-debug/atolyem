/**
 * GET /api/orders - Get buyer's orders
 */

import { NextRequest, NextResponse } from "next/server";
import { withRequestContext } from "@/interface/middleware/with-request-context";
import { requireBuyer } from "@/lib/auth/require-auth";
import { paginationSchema } from "@/lib/api/validation";
import { prisma } from "@/lib/db/prisma";

export const GET = withRequestContext(async (request: NextRequest, { requestId }) => {
  const { user } = await requireBuyer();

  const searchParams = Object.fromEntries(request.nextUrl.searchParams);
  const { page, limit } = paginationSchema.parse(searchParams);

  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: { buyerUserId: user.id },
      include: {
        items: {
          include: {
            listing: {
              select: {
                id: true,
                slug: true,
                media: {
                  where: { isPrimary: true },
                  take: 1,
                },
              },
            },
            digitalDelivery: {
              select: {
                status: true,
                downloadCount: true,
                firstDownloadedAt: true,
              },
            },
            review: {
              select: { id: true, rating: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.order.count({ where: { buyerUserId: user.id } }),
  ]);

  return NextResponse.json(
    {
      orders: orders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        subtotalMinor: order.subtotalMinor,
        shippingTotalMinor: order.shippingTotalMinor,
        grandTotalMinor: order.grandTotalMinor,
        currency: order.currency,
        items: order.items.map((item) => ({
          id: item.id,
          title: item.titleSnapshot,
          listingSlug: item.listing.slug,
          thumbnail: item.listing.media[0]?.url ?? null,
          quantity: item.quantity,
          unitPriceMinor: item.unitPriceMinor,
          totalPriceMinor: item.totalPriceMinor,
          variant: item.variantSnapshot,
          personalization: item.personalizationSnapshot,
          isDigital: !!item.digitalDelivery,
          digitalStatus: item.digitalDelivery?.status,
          hasReview: !!item.review,
          estimatedShipByDate: item.estimatedShipByDate,
          shippedAt: item.shippedAt,
          deliveredAt: item.deliveredAt,
        })),
        shippingAddress: order.shippingAddressSnapshot,
        createdAt: order.createdAt,
        paidAt: order.paidAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
    { headers: { "x-request-id": requestId } }
  );
});
