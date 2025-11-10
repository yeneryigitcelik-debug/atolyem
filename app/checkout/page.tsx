"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import CouponInput from "./CouponInput";

/**
 * Checkout page - Place order with address selection
 */
interface Address {
  id: string;
  title: string;
  city: string;
  district: string;
  addressLine: string;
  phone: string | null;
  isDefault: boolean;
}

interface CartItem {
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
}

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const [discountCents, setDiscountCents] = useState(0);
  const [appliedCouponCode, setAppliedCouponCode] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      loadData();
    }
  }, [status, router]);

  const loadData = async () => {
    try {
      const [cartRes, addressesRes] = await Promise.all([
        fetch("/api/cart"),
        fetch("/api/addresses"),
      ]);

      if (cartRes.ok) {
        const cartData = await cartRes.json();
        setCart(cartData.items || []);
      }

      if (addressesRes.ok) {
        const addressesData = await addressesRes.json();
        setAddresses(addressesData.addresses || []);
        const defaultAddress = addressesData.addresses?.find((a: Address) => a.isDefault);
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
        }
      }
    } catch (error) {
      console.error("Load error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      setError("Lütfen bir adres seçin");
      return;
    }

    setPlacing(true);
    setError("");

    try {
      // Step 1: Place order (CART → PENDING)
      const placeRes = await fetch("/api/orders/place", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addressId: selectedAddressId }),
      });

      if (!placeRes.ok) {
        const data = await placeRes.json();
        throw new Error(data.error || "Sipariş oluşturulamadı");
      }

      const placeData = await placeRes.json();
      const orderId = placeData.orderId;

      // Step 2: Initialize payment (default to PAYTR, can be made configurable)
      const paymentRes = await fetch("/api/payments/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          gateway: "PAYTR", // Can be made configurable
        }),
      });

      if (!paymentRes.ok) {
        const data = await paymentRes.json();
        throw new Error(data.error || "Ödeme başlatılamadı");
      }

      const paymentData = await paymentRes.json();

      // Step 3: Redirect to payment gateway
      if (paymentData.redirectUrl) {
        window.location.href = paymentData.redirectUrl;
      } else {
        throw new Error("Ödeme yönlendirme URL'si alınamadı");
      }
    } catch (error: any) {
      setError(error.message || "Bir hata oluştu");
      setPlacing(false);
    }
  };

  const subtotalCents = cart.reduce((sum, item) => sum + item.priceCents * item.qty, 0);
  const totalCents = subtotalCents - discountCents;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Yükleniyor...</div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#FFF8F1] dark:bg-gray-900 p-8">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
            <p className="mb-4 text-gray-600">Sepetiniz boş</p>
            <Link
              href="/catalog"
              className="inline-block rounded-md bg-[#D97706] px-4 py-2 text-white hover:bg-[#92400E]"
            >
              Alışverişe Başla
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8F1] dark:bg-gray-900 p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-6 text-3xl font-bold text-gray-900">Sipariş Özeti</h1>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-800">{error}</div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Address Selection */}
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold">Teslimat Adresi</h2>
              {addresses.length === 0 ? (
                <div className="text-center py-4">
                  <p className="mb-4 text-gray-600">Henüz adres eklenmemiş</p>
                  <Link
                    href="/profile?tab=addresses"
                    className="inline-block rounded-md bg-[#D97706] px-4 py-2 text-white hover:bg-[#92400E]"
                  >
                    Adres Ekle
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((address) => (
                    <label
                      key={address.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
                        selectedAddressId === address.id
                          ? "border-[#D97706] bg-[#FFF8F1]"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        value={address.id}
                        checked={selectedAddressId === address.id}
                        onChange={(e) => setSelectedAddressId(e.target.value)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{address.title}</span>
                          {address.isDefault && (
                            <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                              Varsayılan
                            </span>
                          )}
                        </div>
                        <div className="mt-1 text-sm text-gray-600">
                          {address.district}, {address.city}
                        </div>
                        <div className="mt-1 text-sm text-gray-600">{address.addressLine}</div>
                        {address.phone && (
                          <div className="mt-1 text-sm text-gray-600">Tel: {address.phone}</div>
                        )}
                      </div>
                    </label>
                  ))}
                  <Link
                    href="/profile?tab=addresses"
                    className="block text-center text-sm text-[#D97706] hover:underline"
                  >
                    + Yeni Adres Ekle
                  </Link>
                </div>
              )}
            </div>

            {/* Coupon Code */}
            <CouponInput
              cartTotalCents={cart.reduce((sum, item) => sum + item.priceCents * item.qty, 0)}
              onCouponApplied={(discount, code) => {
                setDiscountCents(discount);
                setAppliedCouponCode(code);
              }}
            />

            {/* Order Items */}
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold">Sipariş Detayları</h2>
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      <Image
                        src={item.variant.product.images[0]?.url || "https://via.placeholder.com/200x200?text=Görsel+Yok"}
                        alt={item.variant.product.images[0]?.alt ?? item.variant.product.title}
                        fill
                        className="object-cover"
                        sizes="80px"
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
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Adet: {item.qty}</span>
                        <span className="font-medium">
                          {((item.priceCents * item.qty) / 100).toLocaleString("tr-TR")} TL
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold">Sipariş Özeti</h2>
              <div className="mb-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Ara Toplam</span>
                  <span>{(subtotalCents / 100).toLocaleString("tr-TR")} TL</span>
                </div>
                {discountCents > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>İndirim ({appliedCouponCode})</span>
                    <span>-{(discountCents / 100).toLocaleString("tr-TR")} TL</span>
                  </div>
                )}
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
                onClick={handlePlaceOrder}
                disabled={placing || !selectedAddressId || addresses.length === 0}
                className="w-full rounded-md bg-[#D97706] px-4 py-2 text-white hover:bg-[#92400E] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {placing ? "İşleniyor..." : "Siparişi Tamamla"}
              </button>
              <Link
                href="/cart"
                className="mt-3 block w-full text-center text-sm text-gray-600 hover:text-gray-900"
              >
                ← Sepete Dön
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

