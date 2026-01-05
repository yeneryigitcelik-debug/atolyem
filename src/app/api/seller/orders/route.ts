/**
 * GET /api/seller/orders - List order items for the seller's products
 */

import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/requireUser";
import { requireSellerProfile } from "@/lib/auth/requireCapability";
import { handleApiError } from "@/lib/api/errors";
import { paginationSchema } from "@/lib/api/validation";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: NextRequest) {
  try {
    const userContext = await requireUser();
    requireSellerProfile(userContext);

    const searchParams = request.nextUrl.searchParams;
    const { page, limit } = paginationSchema.parse({
      page: searchParams.get("page") ?? 1,
      limit: searchParams.get("limit") ?? 20,
    });

    const skip = (page - 1) * limit;

    const [orderItems, total] = await Promise.all([
      prisma.orderItem.findMany({
        where: { sellerId: userContext.sellerProfile!.id },
        include: {
          product: {
            select: {
              id: true,
              title: true,
              images: {
                select: { url: true },
                orderBy: { sortOrder: "asc" },
                take: 1,
              },
            },
          },
          order: {
            select: {
              id: true,
              status: true,
              buyer: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                },
              },
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.orderItem.count({
        where: { sellerId: userContext.sellerProfile!.id },
      }),
    ]);

    return NextResponse.json({
      orderItems: orderItems.map((item) => ({
        id: item.id,
        product: {
          id: item.product.id,
          title: item.product.title,
          thumbnail: item.product.images[0]?.url ?? null,
        },
        order: {
          id: item.order.id,
          status: item.order.status,
          buyerName: item.order.buyer.fullName ?? item.order.buyer.email,
          createdAt: item.order.createdAt,
        },
        quantity: item.quantity,
        unitPriceAmount: item.unitPriceAmount,
        currency: item.currency,
        totalAmount: item.unitPriceAmount * item.quantity,
        createdAt: item.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

