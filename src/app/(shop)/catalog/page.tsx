import { prisma } from "@/lib/db";

export default async function CatalogPage() {
  const products = await prisma.product.findMany({
    where: { isPublished: true },
    include: { images: true, category: true, artist: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="text-2xl font-bold mb-4">Katalog</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((p) => (
          <a key={p.id} href={`/products/${p.slug}`} className="border rounded-xl p-4 hover:shadow">
            <div className="aspect-square bg-gray-100 mb-3 overflow-hidden rounded-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.images[0]?.url ?? "/uploads/sample.jpg"} alt={p.images[0]?.alt ?? p.title} className="w-full h-full object-cover" />
            </div>
            <div className="text-sm text-gray-500">{p.category.name}</div>
            <div className="font-medium">{p.title}</div>
            <div className="text-gray-700">{(p.priceTL / 100).toLocaleString("tr-TR")} TL</div>
            <div className="text-xs text-gray-500 mt-1">Sanatçı: {p.artist.name ?? p.artist.email}</div>
          </a>
        ))}
      </div>
    </main>
  );
}

