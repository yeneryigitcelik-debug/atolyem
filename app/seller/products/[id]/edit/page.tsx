import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import SellerProductForm from "../../_components/SellerProductForm";

export default async function EditSellerProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: userId },
    include: { seller: true },
  });

  if (!user?.seller) redirect("/seller");

  const product = await db.product.findUnique({
    where: { id },
    include: {
      variants: true,
      images: { orderBy: { sort: "asc" } },
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
        <SellerProductForm
          productId={id}
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
            variants: product.variants.map((variant) => ({
              id: variant.id,
              sku: variant.sku,
              priceCents: variant.priceCents,
              stock: variant.stock,
            })),
          }}
          categories={categories}
          submitLabel="Güncelle"
          cancelHref="/seller/products"
        />

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

