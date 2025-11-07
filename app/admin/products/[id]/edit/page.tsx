import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { updateProductAction } from "@/app/admin/products/actions";
import Link from "next/link";
import ProductForm from "@/app/admin/products/_components/ProductForm";

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
  const sellers = await db.seller.findMany({
    include: { user: true },
    orderBy: { displayName: "asc" },
  });

  return (
    <div className="min-h-screen bg-[#FFF8F1] dark:bg-gray-900 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-3xl font-bold text-gray-900">Ürün Düzenle</h1>
        <ProductForm
          mode="edit"
          productId={params.id}
          defaultValues={{
            title: product.title,
            slug: product.slug,
            description: product.description || undefined,
            categoryId: product.categoryId || undefined,
            isActive: product.isActive,
            images: product.images.map((img) => ({
              id: img.id,
              url: img.url,
              alt: img.alt || undefined,
              sort: img.sort,
            })),
          }}
          categories={categories}
          sellers={sellers}
          submitLabel="Güncelle"
          cancelHref="/admin/products"
        />

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

