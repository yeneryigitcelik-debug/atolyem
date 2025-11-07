import { db } from "@/lib/db";
import Link from "next/link";

export default async function CatalogPage() {
  const products = await db.product.findMany({
    where: { isActive: true },
    include: {
      images: { orderBy: { sort: "asc" } },
      category: true,
      seller: { include: { user: true } },
      variants: {
        orderBy: { priceCents: "asc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="mb-4 text-2xl font-bold">Katalog</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => {
          const minPrice = p.variants[0]?.priceCents || 0;
          return (
            <Link
              key={p.id}
              href={`/products/${p.slug}`}
              className="rounded-xl border p-4 transition-shadow hover:shadow-md"
            >
              <div className="mb-3 aspect-square overflow-hidden rounded-lg bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.images[0]?.url ?? "/uploads/sample.jpg"}
                  alt={p.images[0]?.alt ?? p.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="text-sm text-gray-500">{p.category?.name || "Kategori yok"}</div>
              <div className="font-medium">{p.title}</div>
              <div className="text-gray-700">
                {minPrice > 0 ? `${(minPrice / 100).toLocaleString("tr-TR")} TL` : "Fiyat yok"}
              </div>
              <div className="mt-1 text-xs text-gray-500">
                Sanatçı: {p.seller.user.name || p.seller.user.email}
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}

