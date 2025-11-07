import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { updateVariantAction } from "../../../actions";

export default async function EditVariantPage({
  params,
}: {
  params: { id: string; variantId: string };
}) {
  const variant = await db.variant.findUnique({
    where: { id: params.variantId },
    include: { product: true },
  });

  if (!variant || variant.productId !== params.id) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#FFF8F1] dark:bg-gray-900 p-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-3xl font-bold text-gray-900">Varyant Düzenle</h1>
        <p className="mb-4 text-gray-600">Ürün: {variant.product.title}</p>
        <form action={updateVariantAction.bind(null, params.variantId)} className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div>
            <label htmlFor="sku" className="block text-sm font-medium text-gray-700">
              SKU
            </label>
            <input
              type="text"
              id="sku"
              name="sku"
              required
              defaultValue={variant.sku}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary"
            />
          </div>
          <div>
            <label htmlFor="priceCents" className="block text-sm font-medium text-gray-700">
              Fiyat (Kuruş)
            </label>
            <input
              type="number"
              id="priceCents"
              name="priceCents"
              required
              min="0"
              defaultValue={variant.priceCents}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary"
            />
            <p className="mt-1 text-xs text-gray-500">Örnek: 199900 = 1999.00 TL</p>
          </div>
          <div>
            <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
              Stok
            </label>
            <input
              type="number"
              id="stock"
              name="stock"
              required
              min="0"
              defaultValue={variant.stock}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary"
            />
          </div>
          <div>
            <label htmlFor="attributes" className="block text-sm font-medium text-gray-700">
              Özellikler (JSON - Opsiyonel)
            </label>
            <textarea
              id="attributes"
              name="attributes"
              rows={4}
              defaultValue={variant.attributes ? JSON.stringify(variant.attributes, null, 2) : ""}
              placeholder='{"renk": "kırmızı", "boyut": "L"}'
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-primary"
            />
          </div>
          <div className="flex gap-4">
            <button
              type="submit"
              className="rounded-md bg-primary px-4 py-2 text-white hover:bg-secondary transition-colors"
            >
              Güncelle
            </button>
            <a
              href={`/admin/products/${params.id}/edit`}
              className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              İptal
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

