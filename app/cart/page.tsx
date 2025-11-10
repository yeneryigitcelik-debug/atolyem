import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCart } from "@/lib/orderService";
import Link from "next/link";
import CartActions from "./CartActions";

export default async function CartPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  // getCart çıktısını doğrudan kullan
  const cart = await getCart(session.user.id);

  const cartItems = cart?.items || [];
  const totalCents = cart?.totalCents || 0;

  return (
    <div className="min-h-screen bg-[#FFF8F1] dark:bg-gray-900 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-3xl font-bold text-gray-900">Sepetim</h1>
        {cartItems.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
            <p className="mb-4 text-gray-600">Sepetiniz boş</p>
            <Link
              href="/pazar"
              className="inline-block rounded-md bg-[#D97706] px-4 py-2 text-white hover:bg-[#92400E] transition-colors"
            >
              Alışverişe Başla
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {cartItems.map((item) => {
                  const variant = item.variant;
                  const product = variant.product;
                  const image = product.images[0];
                  const itemTotal = item.priceCents * item.qty;
                  
                  return (
                    <div
                      key={item.id}
                      className="flex gap-4 rounded-lg border border-gray-200 bg-white p-4"
                    >
                      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={image?.url || "https://via.placeholder.com/200x200?text=Görsel+Yok"}
                          alt={image?.alt ?? product.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <Link
                            href={`/products/${product.slug}`}
                            className="font-medium text-gray-900 hover:text-[#D97706] transition-colors"
                          >
                            {product.title}
                          </Link>
                          <div className="text-sm text-gray-500">{variant.sku}</div>
                          {/* Stok göstergesi - optimistic UI için temel */}
                          {variant.stock < item.qty && (
                            <div className="mt-1 text-xs text-red-600">
                              ⚠️ Stok yetersiz (Mevcut: {variant.stock}, Sepette: {item.qty})
                            </div>
                          )}
                          {variant.stock === item.qty && variant.stock > 0 && (
                            <div className="mt-1 text-xs text-orange-600">
                              ⚠️ Son {variant.stock} adet
                            </div>
                          )}
                        </div>
                        <CartActions
                          itemId={item.id}
                          currentQty={item.qty}
                          maxStock={variant.stock}
                          priceCents={item.priceCents}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <h2 className="mb-4 text-lg font-semibold">Sipariş Özeti</h2>
                <div className="mb-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Ara Toplam</span>
                    <span>{(totalCents / 100).toLocaleString("tr-TR")} TL</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Kargo</span>
                    <span>Ücretsiz</span>
                  </div>
                  {/* Kupon alanı - optimistic UI için temel */}
                  <div className="border-t border-gray-200 pt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Toplam</span>
                      <span>{(totalCents / 100).toLocaleString("tr-TR")} TL</span>
                    </div>
                  </div>
                </div>
                <Link
                  href="/checkout"
                  className="block w-full rounded-md bg-[#D97706] px-4 py-2 text-center text-white hover:bg-[#92400E] transition-colors"
                >
                  Siparişi Tamamla
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

