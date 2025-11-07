"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createCategoryAction(prevState: any, formData: FormData) {
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const parentId = formData.get("parentId") as string | null;

  if (!name || !slug) {
    return { error: "Ad ve slug gereklidir" };
  }

  try {
    await db.category.create({
      data: {
        name,
        slug,
        parentId: parentId || null,
      },
    });

    revalidatePath("/admin/categories");
    redirect("/admin/categories");
  } catch (error: any) {
    if (error.code === "P2002") {
      return { error: "Bu slug zaten kullanılıyor" };
    }
    return { error: "Kategori oluşturulurken bir hata oluştu" };
  }
}

export async function updateCategoryAction(id: string, prevState: any, formData: FormData) {
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const parentId = formData.get("parentId") as string | null;

  if (!name || !slug) {
    return { error: "Ad ve slug gereklidir" };
  }

  try {
    await db.category.update({
      where: { id },
      data: {
        name,
        slug,
        parentId: parentId || null,
      },
    });

    revalidatePath("/admin/categories");
    redirect("/admin/categories");
  } catch (error: any) {
    if (error.code === "P2002") {
      return { error: "Bu slug zaten kullanılıyor" };
    }
    return { error: "Kategori güncellenirken bir hata oluştu" };
  }
}

export async function deleteCategoryAction(id: string) {
  try {
    await db.category.delete({
      where: { id },
    });

    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error: any) {
    return { error: "Kategori silinirken bir hata oluştu" };
  }
}

