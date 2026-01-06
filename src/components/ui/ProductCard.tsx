import Link from "next/link";

interface ProductCardProps {
  title: string;
  artist: string;
  price: number;
  slug: string;
  image: string;
  badge?: string;
}

export default function ProductCard({ title, artist, price, slug, image, badge }: ProductCardProps) {
  return (
    <Link
      href={`/urun/${slug}`}
      className="group bg-surface-white rounded-md border border-border-subtle hover:border-primary transition-all duration-300 hover:shadow-md hover:-translate-y-1 relative block"
    >
      <button className="absolute top-3 right-3 z-10 p-1.5 bg-white/80 rounded-full text-text-secondary hover:text-primary transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
        <span className="material-symbols-outlined text-[20px]">favorite</span>
      </button>
      <div className="aspect-square overflow-hidden rounded-t-md bg-gray-100">
        <div
          className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
          style={{ backgroundImage: `url('${image}')` }}
        />
      </div>
      <div className="p-4">
        {badge && (
          <div className="flex gap-2 mb-2">
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-background-ivory border border-border-subtle ${badge === "Orijinal" || badge === "Limited" ? "text-primary" : "text-text-secondary"}`}>
              {badge}
            </span>
          </div>
        )}
        <h4 className="text-text-charcoal font-semibold text-lg leading-tight truncate">{title}</h4>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-text-secondary">
            Sanatçı: <span className="text-text-charcoal font-medium">{artist}</span>
          </p>
          <span className="text-text-charcoal font-bold">{price.toLocaleString("tr-TR")} TL</span>
        </div>
      </div>
    </Link>
  );
}

