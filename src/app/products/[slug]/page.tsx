import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

type Props = { params: { slug: string } };

export default async function ProductPage({ params }: Props) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: { images: true, category: true, artist: true },
  });

  if (!product || !product.isPublished) return notFound();

  return (
    <main className="mx-auto max-w-4xl p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={product.images[0]?.url ?? "/uploads/sample.jpg"} alt={product.images[0]?.alt ?? product.title} className="w-full rounded-xl border" />
        <div>
          <div className="text-sm text-gray-500">{product.category.name}</div>
          <h1 className="text-2xl font-bold">{product.title}</h1>
          <div className="text-lg mt-2">{(product.priceTL / 100).toLocaleString("tr-TR")} TL</div>
          <p className="mt-4 text-gray-700 whitespace-pre-line">{product.description}</p>
          <div className="mt-6 text-sm text-gray-500">Sanatçı: {product.artist.name ?? product.artist.email}</div>
        </div>
      </div>
    </main>
  );
}
