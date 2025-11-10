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
              cfImageId: img.cfImageId || undefined,
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
      </div>
    </div>
  );
}

