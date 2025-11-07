import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { updateSellerProductAction } from "../../actions";
import Link from "next/link";

export default async function EditSellerProductPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: userId },
    include: { seller: true },
  });

  if (!user?.seller) redirect("/seller");

  const product = await db.product.findUnique({
    where: { id: params.id },
    include: {
      variants: true,
      images: true,
    },
  });

  if (!product || product.sellerId !== user.seller.id) {
    notFound();
  }

  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="min-h-screen bg-[#FFF8F1] dark:bg-gray-900 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-3xl font-bold text-gray-900">Ürün Düzenle</h1>
        <form action={async (formData: FormData) => {
          "use server";
          const result = await updateSellerProductAction(params.id, null, formData);
          if (result && "error" in result) {
            // Error handling - could redirect or show error
            return;
          }
        }} className="space-y-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
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
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#D97706] focus:outline-none focus:ring-[#D97706]"
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
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#D97706] focus:outline-none focus:ring-[#D97706]"
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
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#D97706] focus:outline-none focus:ring-[#D97706]"
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
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#D97706] focus:outline-none focus:ring-[#D97706]"
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
                className="rounded border-gray-300 text-[#D97706] focus:ring-[#D97706]"
              />
              <span className="ml-2 text-sm text-gray-700">Aktif</span>
            </label>
          </div>
          <div className="flex gap-4">
            <button
              type="submit"
              className="rounded-md bg-[#D97706] px-4 py-2 text-white hover:bg-[#92400E]"
            >
              Güncelle
            </button>
            <Link
              href="/seller/products"
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
              href={`/seller/products/${product.id}/variants/new`}
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
                  href={`/seller/products/${product.id}/variants/${variant.id}/edit`}
                  className="text-sm text-[#D97706] hover:text-[#92400E]"
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

