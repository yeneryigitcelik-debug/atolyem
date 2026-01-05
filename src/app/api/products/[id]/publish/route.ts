/**
 * POST /api/products/:id/publish - Publish a product (seller only, own products)
 */

import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/requireUser";
import { requireSellerProfile } from "@/lib/auth/requireCapability";
import { handleApiError, createErrorResponse } from "@/lib/api/errors";
import { uuidSchema } from "@/lib/api/validation";
import { prisma } from "@/lib/db/prisma";
import { ProductStatus } from "@prisma/client";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
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
      select: { sellerId: true, status: true, stockQuantity: true },
    });

    if (!product) {
      return createErrorResponse("NOT_FOUND", "Product not found", 404);
    }

    if (product.sellerId !== userContext.sellerProfile!.id) {
      return createErrorResponse(
        "FORBIDDEN",
        "You can only publish your own products",
        403
      );
    }

    if (product.status === ProductStatus.PUBLISHED) {
      return createErrorResponse(
        "ALREADY_PUBLISHED",
        "This product is already published",
        400
      );
    }

    if (product.status === ProductStatus.ARCHIVED) {
      return createErrorResponse(
        "ARCHIVED_PRODUCT",
        "Cannot publish an archived product. Update the status to DRAFT first.",
        400
      );
    }

    // Optional: Require stock > 0 to publish
    if (product.stockQuantity <= 0) {
      return createErrorResponse(
        "NO_STOCK",
        "Cannot publish a product with no stock. Add stock first.",
        400
      );
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { status: ProductStatus.PUBLISHED },
      include: {
        category: {
          select: { id: true, slug: true, name: true },
        },
      },
    });

    return NextResponse.json({
      message: "Product published successfully",
      product: {
        id: updatedProduct.id,
        title: updatedProduct.title,
        status: updatedProduct.status,
        updatedAt: updatedProduct.updatedAt,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

