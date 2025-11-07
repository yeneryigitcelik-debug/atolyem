import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { updateProductAction } from "../actions";
import Link from "next/link";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const product = await db.product.findUnique({
    where: { id: params.id },
    include: {
      variants: true,
      images: true,
    },
  });

  if (!product) {
    notFound();
  }

  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="min-h-screen bg-[#FFF8F1] dark:bg-gray-900 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-3xl font-bold text-gray-900">Ürün Düzenle</h1>
        <form action={updateProductAction.bind(null, params.id)} className="space-y-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Başlık
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                defaultValue={product.title}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary"
              />
            </div>
            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                Slug
              </label>
              <input
                type="text"
                id="slug"
                name="slug"
                required
                defaultValue={product.slug}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary"
              />
            </div>
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Açıklama
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={product.description || ""}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary"
            />
          </div>
          <div>
            <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
              Kategori
            </label>
            <select
              id="categoryId"
              name="categoryId"
              defaultValue={product.categoryId || ""}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary"
            >
              <option value="">Seçiniz</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                defaultChecked={product.isActive}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="ml-2 text-sm text-gray-700">Aktif</span>
            </label>
          </div>
          <div className="flex gap-4">
            <button
              type="submit"
              className="rounded-md bg-primary px-4 py-2 text-white hover:bg-secondary transition-colors"
            >
              Güncelle
            </button>
            <Link
              href="/admin/products"
              className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              İptal
            </Link>
          </div>
        </form>

        <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Varyantlar</h2>
            <Link
              href={`/admin/products/${product.id}/variants/new`}
              className="rounded-md bg-primary px-4 py-2 text-sm text-white hover:bg-secondary transition-colors"
            >
              Yeni Varyant
            </Link>
          </div>
          <div className="space-y-2">
            {product.variants.map((variant) => (
              <div
                key={variant.id}
                className="flex items-center justify-between rounded-md border border-gray-200 p-3"
              >
                <div>
                  <div className="font-medium">{variant.sku}</div>
                  <div className="text-sm text-gray-500">
                    {(variant.priceCents / 100).toLocaleString("tr-TR")} TL - Stok: {variant.stock}
                  </div>
                </div>
                <Link
                  href={`/admin/products/${product.id}/variants/${variant.id}/edit`}
                  className="text-sm text-primary hover:text-primary/80"
                >
                  Düzenle
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

