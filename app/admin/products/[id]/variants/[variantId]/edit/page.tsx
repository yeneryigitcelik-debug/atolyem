import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import VariantForm from "../../_components/VariantForm";

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
        <VariantForm
          mode="edit"
          productId={params.id}
          variantId={params.variantId}
          defaultValues={{
            sku: variant.sku,
            priceCents: variant.priceCents,
            stock: variant.stock,
            attributes: variant.attributes,
          }}
          submitLabel="Güncelle"
          cancelHref={`/admin/products/${params.id}/edit`}
        />
      </div>
    </div>
  );
}

