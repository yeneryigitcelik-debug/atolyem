/**
 * GET /api/products/:id - Get product details (public if published, or seller's own)
 * PATCH /api/products/:id - Update product (seller only, own products)
 */

import { NextRequest, NextResponse } from "next/server";
import { requireUser, getOptionalUser } from "@/lib/auth/requireUser";
import { requireSellerProfile } from "@/lib/auth/requireCapability";
import { handleApiError, createErrorResponse } from "@/lib/api/errors";
import { updateProductSchema, uuidSchema } from "@/lib/api/validation";
import { prisma } from "@/lib/db/prisma";
import { ProductStatus } from "@prisma/client";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    // Validate UUID format
    const parseResult = uuidSchema.safeParse(id);
    if (!parseResult.success) {
      return createErrorResponse("INVALID_ID", "Invalid product ID format", 400);
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: { id: true, slug: true, name: true },
        },
        images: {
          select: { id: true, url: true, sortOrder: true },
          orderBy: { sortOrder: "asc" },
        },
        seller: {
          select: {
            id: true,
            displayName: true,
            verificationStatus: true,
          },
        },
      },
    });

    if (!product) {
      return createErrorResponse("NOT_FOUND", "Product not found", 404);
    }

    // Check access: public only sees PUBLISHED products
    const userContext = await getOptionalUser();
    const isOwner =
      userContext?.sellerProfile?.id === product.sellerId;

    if (!isOwner && product.status !== ProductStatus.PUBLISHED) {
      return createErrorResponse("NOT_FOUND", "Product not found", 404);
    }

    return NextResponse.json({
      product: {
        id: product.id,
        title: product.title,
        description: product.description,
        priceAmount: product.priceAmount,
        currency: product.currency,
        status: product.status,
        stockQuantity: product.stockQuantity,
        category: product.category,
        images: product.images,
        seller: {
          id: product.seller.id,
          displayName: product.seller.displayName,
          verified: product.seller.verificationStatus === "VERIFIED",
        },
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    // Validate UUID format
    const parseResult = uuidSchema.safeParse(id);
    if (!parseResult.success) {
      return createErrorResponse("INVALID_ID", "Invalid product ID format", 400);
    }

    const userContext = await requireUser();
    requireSellerProfile(userContext);

    // Verify ownership
    const product = await prisma.product.findUnique({
      where: { id },
      select: { sellerId: true },
    });

    if (!product) {
      return createErrorResponse("NOT_FOUND", "Product not found", 404);
    }

    if (product.sellerId !== userContext.sellerProfile!.id) {
      return createErrorResponse(
        "FORBIDDEN",
        "You can only update your own products",
        403
      );
    }

    const body = await request.json();
    const data = updateProductSchema.parse(body);

    // If changing category, verify it exists
    if (data.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: data.categoryId },
      });

      if (!category) {
        return createErrorResponse(
          "INVALID_CATEGORY",
          "The specified category does not exist",
          400
        );
      }
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.priceAmount && { priceAmount: data.priceAmount }),
        ...(data.currency && { currency: data.currency }),
        ...(data.stockQuantity !== undefined && {
          stockQuantity: data.stockQuantity,
        }),
        ...(data.categoryId && { categoryId: data.categoryId }),
        ...(data.status && { status: data.status as ProductStatus }),
      },
      include: {
        category: {
          select: { id: true, slug: true, name: true },
        },
      },
    });

    return NextResponse.json({
      message: "Product updated successfully",
      product: {
        id: updatedProduct.id,
        title: updatedProduct.title,
        description: updatedProduct.description,
        priceAmount: updatedProduct.priceAmount,
        currency: updatedProduct.currency,
        status: updatedProduct.status,
        stockQuantity: updatedProduct.stockQuantity,
        category: updatedProduct.category,
        updatedAt: updatedProduct.updatedAt,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

