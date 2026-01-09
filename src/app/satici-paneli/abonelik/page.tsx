"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import PageHeader from "@/components/ui/PageHeader";
import Link from "next/link";
import { PLAN_FEATURES, SubscriptionPlan } from "@/lib/subscription/constants";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface SubscriptionInfo {
  subscription: {
    id: string;
    plan: SubscriptionPlan;
    status: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    canceledAt: string | null;
  } | null;
  limitInfo: {
    canCreate: boolean;
    remaining: number | null;
    currentCount: number | null;
    limit: number | null;
  };
}

export default function AbonelikPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      fetchSubscription();
    }
  }, [authLoading, user]);

  const fetchSubscription = async () => {
    try {
      const res = await fetch("/api/subscription");
      if (res.ok) {
        const data = await res.json();
        setSubscriptionInfo(data);
      }
    } catch (err) {
      console.error("Failed to fetch subscription:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (plan: SubscriptionPlan) => {
    setActivating(plan);
    setError(null);

    try {
      const res = await fetch("/api/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message || "Abonelik aktifleştirilemedi");
      }

      await fetchSubscription();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setActivating(null);
    }
  };

  if (authLoading || loading) {
    return (
      <>
        <PageHeader title="Abonelik" />
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-surface-white rounded-lg border border-border-subtle p-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="text-text-secondary mt-4">Yükleniyor...</p>
          </div>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <PageHeader title="Abonelik" />
        <div className="max-w-[500px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-surface-white rounded-lg border border-border-subtle p-8 text-center">
            <p className="text-text-secondary mb-4">Abonelik sayfasına erişmek için giriş yapın.</p>
            <Link href="/hesap?redirect=/satici-paneli/abonelik" className="inline-block px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-md transition-colors">
              Giriş Yap
            </Link>
          </div>
        </div>
      </>
    );
  }

  const currentSubscription = subscriptionInfo?.subscription;
  const limitInfo = subscriptionInfo?.limitInfo;

  return (
    <>
      <PageHeader title="Abonelik Planları" />
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Current Subscription Status */}
        {currentSubscription && (
          <div className="bg-surface-white rounded-lg border border-border-subtle p-6 mb-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="text-lg font-bold text-text-charcoal mb-2">Mevcut Abonelik</h3>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    currentSubscription.plan === SubscriptionPlan.PREMIUM
                      ? "bg-amber-100 text-amber-700"
                      : "bg-blue-100 text-blue-700"
                  }`}>
                    {PLAN_FEATURES[currentSubscription.plan].name}
                  </span>
                  <span className="text-text-secondary">
                    {PLAN_FEATURES[currentSubscription.plan].priceFormatted}
                  </span>
                </div>
                {currentSubscription.status === "ACTIVE" && (
                  <p className="text-sm text-text-secondary mt-2">
                    Yenileme tarihi: {format(new Date(currentSubscription.currentPeriodEnd), "d MMMM yyyy", { locale: tr })}
                  </p>
                )}
              </div>
              {limitInfo && (
                <div className="text-right">
                  <p className="text-sm text-text-secondary">Bu ay yüklenen ürün</p>
                  <p className="text-2xl font-bold text-text-charcoal">
                    {limitInfo.currentCount ?? 0}
                    {limitInfo.limit !== Infinity && (
                      <span className="text-lg text-text-secondary"> / {limitInfo.limit}</span>
                    )}
                  </p>
                  {limitInfo.remaining !== null && limitInfo.remaining !== Infinity && (
                    <p className="text-sm text-green-600 mt-1">
                      {limitInfo.remaining} ürün hakkınız kaldı
                    </p>
                  )}
                  {limitInfo.remaining === Infinity && (
                    <p className="text-sm text-green-600 mt-1">Sınırsız</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Subscription Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {Object.values(SubscriptionPlan).map((plan) => {
            const features = PLAN_FEATURES[plan];
            const isCurrent = currentSubscription?.plan === plan;
            const isPremium = plan === SubscriptionPlan.PREMIUM;

            return (
              <div
                key={plan}
                className={`bg-surface-white rounded-lg border-2 p-8 relative ${
                  isCurrent
                    ? "border-primary"
                    : isPremium
                    ? "border-amber-300"
                    : "border-border-subtle"
                }`}
              >
                {isCurrent && (
                  <div className="absolute top-4 right-4 px-3 py-1 bg-primary text-white text-xs font-medium rounded-full">
                    Mevcut Plan
                  </div>
                )}
                {isPremium && !isCurrent && (
                  <div className="absolute top-4 right-4 px-3 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                    Önerilen
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-text-charcoal mb-2">{features.name}</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-text-charcoal">{features.price}</span>
                    <span className="text-text-secondary">TL/ay</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {features.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-green-500 text-[20px] mt-0.5">check_circle</span>
                      <span className="text-text-secondary">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleActivate(plan)}
                  disabled={isCurrent || activating !== null}
                  className={`w-full py-3 rounded-md font-semibold transition-colors ${
                    isCurrent
                      ? "bg-background-ivory text-text-secondary cursor-not-allowed"
                      : isPremium
                      ? "bg-amber-500 hover:bg-amber-600 text-white"
                      : "bg-primary hover:bg-primary-dark text-white"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {activating === plan ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Aktifleştiriliyor...
                    </span>
                  ) : isCurrent ? (
                    "Mevcut Plan"
                  ) : (
                    "Planı Seç"
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Info Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="font-semibold text-text-charcoal mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600">info</span>
            Bilgi
          </h4>
          <p className="text-sm text-text-secondary">
            Abonelik planınızı istediğiniz zaman değiştirebilirsiniz. Plan değişikliği anında geçerli olur ve yeni dönem için geçerli olur.
            Ödeme entegrasyonu yakında eklenecektir. Şu anda test amaçlı olarak planlar manuel olarak aktifleştirilebilir.
          </p>
        </div>
      </div>
    </>
  );
}


