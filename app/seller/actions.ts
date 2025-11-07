"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createSellerAction(formData: FormData) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  if (!userId) {
    return { error: "Giriş yapmanız gerekiyor" };
  }

  const displayName = formData.get("displayName") as string;

  if (!displayName || displayName.trim().length < 2) {
    return { error: "Atölye adı en az 2 karakter olmalıdır" };
  }

  try {
    // Kullanıcının zaten seller hesabı var mı kontrol et
    const existingSeller = await db.seller.findUnique({
      where: { userId },
    });

    if (existingSeller) {
      return { error: "Zaten bir satıcı hesabınız var" };
    }

    // Seller hesabı oluştur
    await db.seller.create({
      data: {
        userId,
        displayName: displayName.trim(),
        commissionBps: 1500, // Varsayılan %15 komisyon
      },
    });

    // Kullanıcının rolünü SELLER yap
    await db.user.update({
      where: { id: userId },
      data: { role: "SELLER" },
    });

    revalidatePath("/seller");
    revalidatePath("/profile");
    redirect("/seller");
  } catch (error: any) {
    console.error("Create seller error:", error);
    if (error.code === "P2002") {
      return { error: "Bu kullanıcı için zaten bir satıcı hesabı mevcut" };
    }
    return { error: "Satıcı hesabı oluşturulurken bir hata oluştu" };
  }
}

