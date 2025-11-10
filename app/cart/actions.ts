"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  addToCart as addToCartService,
  updateCartItem as updateCartItemService,
  removeFromCart as removeFromCartService,
  OrderError,
} from "@/lib/orderService";
import { revalidatePath } from "next/cache";

export interface AddToCartResult {
  success: boolean;
  error?: string;
}

/**
 * Add item to cart
 */
export async function addToCart(
  prevState: AddToCartResult | null,
  formData: FormData
): Promise<AddToCartResult> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Giriş yapmanız gerekiyor" };
    }

    const variantId = formData.get("variantId") as string;
    const qty = parseInt(formData.get("qty") as string, 10);

    if (!variantId) {
      return { success: false, error: "Varyant seçilmedi" };
    }

    if (isNaN(qty) || qty < 1) {
      return { success: false, error: "Geçerli bir miktar giriniz" };
    }

    await addToCartService(session.user.id, variantId, qty);
    revalidatePath("/cart");
    return { success: true };
  } catch (error: any) {
    if (error instanceof OrderError) {
      return { success: false, error: error.message };
    }
    console.error("Add to cart error:", error);
    return { success: false, error: error.message || "Ürün sepete eklenirken bir hata oluştu" };
  }
}

/**
 * Update cart item quantity
 */
export async function updateCartItem(itemId: string, qty: number) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error("Giriş yapmanız gerekiyor");
    }

    if (qty < 1) {
      throw new Error("Miktar 1'den küçük olamaz");
    }

    await updateCartItemService(session.user.id, itemId, qty);
    revalidatePath("/cart");
  } catch (error: any) {
    if (error instanceof OrderError) {
      throw error;
    }
    console.error("Update cart item error:", error);
    throw new Error(error.message || "Sepet güncellenirken bir hata oluştu");
  }
}

/**
 * Remove item from cart
 */
export async function removeFromCart(itemId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error("Giriş yapmanız gerekiyor");
    }

    await removeFromCartService(session.user.id, itemId);
    revalidatePath("/cart");
  } catch (error: any) {
    if (error instanceof OrderError) {
      throw error;
    }
    console.error("Remove from cart error:", error);
    throw new Error(error.message || "Ürün sepetten kaldırılırken bir hata oluştu");
  }
}
