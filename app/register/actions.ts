"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function registerAction(formData: {
  name: string;
  email: string;
  password: string;
}) {
  try {
    // Email kontrolü
    const existingUser = await db.user.findUnique({
      where: { email: formData.email },
    });

    if (existingUser) {
      return { error: "Bu email adresi zaten kullanılıyor" };
    }

    // Şifreyi hashle
    const bcrypt = await import("bcrypt");
    const hashedPw = await bcrypt.hash(formData.password, 10);

    // Kullanıcıyı oluştur
    await db.user.create({
      data: {
        email: formData.email,
        name: formData.name,
        hashedPw,
        role: "CUSTOMER",
      },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Register error:", error);
    return { error: "Kayıt sırasında bir hata oluştu" };
  }
}

