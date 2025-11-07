import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import CategoryForm from "../../_components/CategoryForm";

export default async function EditCategoryPage({ params }: { params: { id: string } }) {
  const category = await db.category.findUnique({
    where: { id: params.id },
  });

  if (!category) {
    notFound();
  }

  const categories = await db.category.findMany({
    where: { id: { not: params.id } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="min-h-screen bg-[#FFF8F1] dark:bg-gray-900 p-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-3xl font-bold text-gray-900">Kategori Düzenle</h1>
        <CategoryForm
          mode="edit"
          categoryId={params.id}
          defaultValues={{
            name: category.name,
            slug: category.slug,
            parentId: category.parentId || undefined,
          }}
          categories={categories}
          submitLabel="Güncelle"
          cancelHref="/admin/categories"
        />
      </div>
    </div>
  );
}

