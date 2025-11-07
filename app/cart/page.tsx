"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

type CartItem = {
  id: string;
  variantId: string;
  qty: number;
  priceCents: number;
  variant: {
    id: string;
    sku: string;
    priceCents: number;
    product: {
      id: string;
      title: string;
      slug: string;
      images: Array<{ url: string; alt: string | null }>;
    };
  };
};

export default function CartPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      loadCart();
    }
  }, [status, router]);

  const loadCart = async () => {
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        setCart(data.items || []);
      }
    } catch (error) {
      console.error("Cart load error:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, qty: number) => {
    if (qty < 1) {
      await removeItem(itemId);
      return;
    }
    try {
      const res = await fetch("/api/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, qty }),
      });
      if (res.ok) {
        loadCart();
      }
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const res = await fetch("/api/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      });
      if (res.ok) {
        loadCart();
      }
    } catch (error) {
      console.error("Remove error:", error);
    }
  };

  const totalCents = cart.reduce((sum, item) => sum + item.priceCents * item.qty, 0);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8F1] dark:bg-gray-900 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-3xl font-bold text-gray-900">Sepetim</h1>
        {cart.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
            <p className="mb-4 text-gray-600">Sepetiniz boş</p>
            <Link
              href="/catalog"
              className="inline-block rounded-md bg-[#D97706] px-4 py-2 text-white hover:bg-[#92400E]"
            >
              Alışverişe Başla
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 rounded-lg border border-gray-200 bg-white p-4"
                  >
                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.variant.product.images[0]?.url ?? "/uploads/sample.jpg"}
                        alt={item.variant.product.images[0]?.alt ?? item.variant.product.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <Link
                          href={`/products/${item.variant.product.slug}`}
                          className="font-medium text-gray-900 hover:text-[#D97706]"
                        >
                          {item.variant.product.title}
                        </Link>
                        <div className="text-sm text-gray-500">{item.variant.sku}</div>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.qty - 1)}
                            className="rounded border border-gray-300 px-2 py-1 text-sm hover:bg-gray-50"
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-sm">{item.qty}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.qty + 1)}
                            className="rounded border border-gray-300 px-2 py-1 text-sm hover:bg-gray-50"
                          >
                            +
                          </button>
                        </div>
                        <div className="font-medium">
                          {((item.priceCents * item.qty) / 100).toLocaleString("tr-TR")} TL
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          Sil
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
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
                  <div className="border-t border-gray-200 pt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Toplam</span>
                      <span>{(totalCents / 100).toLocaleString("tr-TR")} TL</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => router.push("/checkout")}
                  className="w-full rounded-md bg-[#D97706] px-4 py-2 text-white hover:bg-[#92400E]"
                >
                  Siparişi Tamamla
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

