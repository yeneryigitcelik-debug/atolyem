/**
 * POST /api/orders - Create an order (buyer only)
 * GET /api/orders - List buyer's orders
 */

import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/requireUser";
import { requireCapability } from "@/lib/auth/requireCapability";
import { handleApiError, createErrorResponse } from "@/lib/api/errors";
import { createOrderSchema, paginationSchema } from "@/lib/api/validation";
import { prisma } from "@/lib/db/prisma";
import { ProductStatus } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const userContext = await requireUser();
    requireCapability(userContext, "BUYER");

    const body = await request.json();
    const data = createOrderSchema.parse(body);

    // Fetch all products and validate
    const productIds = data.items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        status: ProductStatus.PUBLISHED,
      },
      include: {
        seller: {
          select: { id: true },
        },
      },
    });

    // Validate all products exist and are published
    const productMap = new Map(products.map((p) => [p.id, p]));
    const errors: { productId: string; message: string }[] = [];

    for (const item of data.items) {
      const product = productMap.get(item.productId);
      if (!product) {
        errors.push({
          productId: item.productId,
          message: "Product not found or not available for purchase",
        });
        continue;
      }

      if (product.stockQuantity < item.quantity) {
        errors.push({
          productId: item.productId,
          message: `Insufficient stock. Only ${product.stockQuantity} available.`,
        });
      }
    }

    if (errors.length > 0) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_ORDER_ITEMS",
            message: "Some items in the order are not valid",
            details: errors,
          },
        },
        { status: 400 }
      );
    }

    // Calculate total and prepare order items
    let totalAmount = 0;
    const currency = products[0].currency; // Assuming same currency

    const orderItems = data.items.map((item) => {
      const product = productMap.get(item.productId)!;
      const itemTotal = product.priceAmount * item.quantity;
      totalAmount += itemTotal;

      return {
        productId: item.productId,
        sellerId: product.seller.id,
        quantity: item.quantity,
        unitPriceAmount: product.priceAmount,
        currency: product.currency,
      };
    });

    // Create order with items in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          buyerUserId: userContext.appUser.id,
          totalAmount,
          currency,
          items: {
            create: orderItems,
          },
        },
        include: {
          items: {
            include: {
              product: {
                select: { id: true, title: true },
              },
            },
          },
        },
      });

      // Decrease stock for each product
      for (const item of data.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: {
              decrement: item.quantity,
            },
          },
        });
      }

      return newOrder;
    });

    return NextResponse.json(
      {
        message: "Order created successfully",
        order: {
          id: order.id,
          status: order.status,
          totalAmount: order.totalAmount,
          currency: order.currency,
          items: order.items.map((item) => ({
            id: item.id,
            product: item.product,
            quantity: item.quantity,
            unitPriceAmount: item.unitPriceAmount,
            currency: item.currency,
          })),
          createdAt: order.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const userContext = await requireUser();
    requireCapability(userContext, "BUYER");

    const searchParams = request.nextUrl.searchParams;
    const { page, limit } = paginationSchema.parse({
      page: searchParams.get("page") ?? 1,
      limit: searchParams.get("limit") ?? 20,
    });

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { buyerUserId: userContext.appUser.id },
        include: {
          items: {
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
              seller: {
                select: { displayName: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.order.count({
        where: { buyerUserId: userContext.appUser.id },
      }),
    ]);

    return NextResponse.json({
      orders: orders.map((order) => ({
        id: order.id,
        status: order.status,
        totalAmount: order.totalAmount,
        currency: order.currency,
        items: order.items.map((item) => ({
          id: item.id,
          product: {
            id: item.product.id,
            title: item.product.title,
            thumbnail: item.product.images[0]?.url ?? null,
          },
          seller: item.seller.displayName,
          quantity: item.quantity,
          unitPriceAmount: item.unitPriceAmount,
          currency: item.currency,
        })),
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
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

