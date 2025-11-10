"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createFeedback(data: {
  sellerId: string;
  orderId?: string;
  rating: number;
  category: string;
  comment: string;
}) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  if (!userId) {
    return { error: "Giriş yapmanız gerekiyor" };
  }

  // Validate rating
  if (data.rating < 1 || data.rating > 5) {
    return { error: "Puan 1-5 arasında olmalıdır" };
  }

  // Validate category
  const validCategories = [
    "GENERAL",
    "PRODUCT_QUALITY",
    "SHIPPING",
    "COMMUNICATION",
    "PRICING",
  ];
  if (!validCategories.includes(data.category)) {
    return { error: "Geçersiz kategori" };
  }

  try {
    // If orderId provided, verify it belongs to the seller
    if (data.orderId) {
      const order = await db.order.findUnique({
        where: { id: data.orderId },
        include: {
          items: {
            include: {
              variant: {
                include: {
                  product: {
                    select: { sellerId: true },
                  },
                },
              },
            },
          },
        },
      });

      if (!order) {
        return { error: "Sipariş bulunamadı" };
      }

      const orderSellerId = order.items[0]?.variant.product.sellerId;
      if (orderSellerId !== data.sellerId) {
        return { error: "Bu sipariş size ait değil" };
      }
    }

    const feedback = await (db as any).feedback.create({
      data: {
        sellerId: data.sellerId,
        userId,
        orderId: data.orderId || null,
        rating: data.rating,
        category: data.category as any,
        comment: data.comment,
        status: "PENDING",
      },
    });

    revalidatePath("/feedback");
    return { success: true, feedbackId: feedback.id };
  } catch (error: any) {
    console.error("Create feedback error:", error);
    return { error: "Geri bildirim oluşturulamadı" };
  }
}

