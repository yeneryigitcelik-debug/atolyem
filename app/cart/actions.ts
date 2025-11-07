"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function addToCart(variantId: string, qty: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Giriş yapmanız gerekiyor");
  }

  const variant = await db.variant.findUnique({
    where: { id: variantId },
  });

  if (!variant || variant.stock < qty) {
    throw new Error("Yeterli stok yok");
  }

  let cart = await db.order.findFirst({
    where: {
      userId: session.user.id,
      status: "CART",
    },
  });

  if (!cart) {
    cart = await db.order.create({
      data: {
        userId: session.user.id,
        status: "CART",
        totalCents: 0,
      },
    });
  }

  const existingItem = await db.orderItem.findFirst({
    where: {
      orderId: cart.id,
      variantId,
    },
  });

  if (existingItem) {
    await db.orderItem.update({
      where: { id: existingItem.id },
      data: { qty: existingItem.qty + qty },
    });
  } else {
    await db.orderItem.create({
      data: {
        orderId: cart.id,
        variantId,
        qty,
        priceCents: variant.priceCents,
      },
    });
  }

  const items = await db.orderItem.findMany({
    where: { orderId: cart.id },
  });
  const totalCents = items.reduce((sum, item) => sum + item.priceCents * item.qty, 0);
  await db.order.update({
    where: { id: cart.id },
    data: { totalCents },
  });

  revalidatePath("/cart");
}

