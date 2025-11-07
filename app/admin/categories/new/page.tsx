import { db } from "@/lib/db";
import CategoryForm from "../_components/CategoryForm";

export default async function NewCategoryPage() {
  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="min-h-screen bg-[#FFF8F1] dark:bg-gray-900 p-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-3xl font-bold text-gray-900">Yeni Kategori</h1>
        <CategoryForm
          mode="create"
          categories={categories}
          submitLabel="Oluştur"
          cancelHref="/admin/categories"
        />
      </div>
    </div>
  );
}

