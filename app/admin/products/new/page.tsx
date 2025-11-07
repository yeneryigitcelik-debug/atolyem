import { db } from "@/lib/db";
import { createProductAction } from "../actions";
import ProductForm from "@/app/admin/products/_components/ProductForm";

export default async function NewProductPage() {
  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
  });
  const sellers = await db.seller.findMany({
    include: { user: true },
    orderBy: { displayName: "asc" },
  });

  return (
    <div className="min-h-screen bg-[#FFF8F1] dark:bg-gray-900 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-3xl font-bold text-gray-900">Yeni Ürün</h1>
        <ProductForm
          mode="create"
          categories={categories}
          sellers={sellers}
          submitLabel="Oluştur"
          cancelHref="/admin/products"
        />
      </div>
    </div>
  );
}

