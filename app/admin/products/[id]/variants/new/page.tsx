import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import VariantForm from "../_components/VariantForm";

export default async function NewVariantPage({ params }: { params: { id: string } }) {
  const product = await db.product.findUnique({
    where: { id: params.id },
  });

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#FFF8F1] dark:bg-gray-900 p-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-3xl font-bold text-gray-900">Yeni Varyant</h1>
        <p className="mb-4 text-gray-600">Ürün: {product.title}</p>
        <VariantForm
          mode="create"
          productId={params.id}
          submitLabel="Oluştur"
          cancelHref={`/admin/products/${params.id}/edit`}
        />
      </div>
    </div>
  );
}

