"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/app/components/ui/ToastProvider";

interface PremiumPlansProps {
  currentPlan: "BASIC" | "PREMIUM" | "ENTERPRISE";
  isPremium: boolean;
}

export default function PremiumPlans({ currentPlan, isPremium }: PremiumPlansProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const plans = [
    {
      id: "BASIC",
      name: "Temel Plan",
      price: 0,
      period: "Ücretsiz",
      features: [
        "Aylık 10 ürün yükleme",
        "Temel satış raporları",
        "Standart komisyon (%15)",
        "E-posta desteği",
      ],
      popular: false,
    },
    {
      id: "PREMIUM",
      name: "Premium Plan",
      price: 299,
      period: "aylık",
      features: [
        "Sınırsız ürün yükleme",
        "Gelişmiş satış raporları",
        "Düşük komisyon (%12)",
        "Öncelikli destek",
        "Özel mağaza teması",
        "Sosyal medya entegrasyonu",
      ],
      popular: true,
    },
    {
      id: "ENTERPRISE",
      name: "Kurumsal Plan",
      price: 999,
      period: "aylık",
      features: [
        "Sınırsız ürün yükleme",
        "Özel API erişimi",
        "En düşük komisyon (%10)",
        "7/24 öncelikli destek",
        "Özel mağaza tasarımı",
        "Toplu ürün yükleme",
        "Gelişmiş analitik",
      ],
      popular: false,
    },
  ];

  const handleSubscribe = async (planId: string, price: number) => {
    if (planId === "BASIC") {
      showToast("Temel plan zaten aktif", "info");
      return;
    }

    if (planId === currentPlan && isPremium) {
      showToast("Bu plan zaten aktif", "info");
      return;
    }

    setLoading(planId);

    try {
      const response = await fetch("/api/subscriptions/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Abonelik oluşturulamadı");
      }

      if (data.redirectUrl) {
        // Ödeme sayfasına yönlendir
        window.location.href = data.redirectUrl;
      } else {
        showToast("Abonelik başarıyla oluşturuldu", "success");
        router.refresh();
      }
    } catch (error: any) {
      console.error("Subscribe error:", error);
      showToast(error.message || "Bir hata oluştu", "error");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {plans.map((plan) => {
        const isCurrentPlan = plan.id === currentPlan;
        const isDisabled = loading !== null;

        return (
          <div
            key={plan.id}
            className={`rounded-lg border-2 p-6 bg-white shadow-sm ${
              plan.popular
                ? "border-[#D97706] relative"
                : "border-gray-200"
            } ${isCurrentPlan ? "ring-2 ring-[#D97706]" : ""}`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-[#D97706] text-white px-3 py-1 rounded-full text-xs font-semibold">
                  Popüler
                </span>
              </div>
            )}

            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-[#1F2937] mb-2">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-[#D97706]">{plan.price}</span>
                {plan.price > 0 && (
                  <>
                    <span className="text-gray-600">₺</span>
                    <span className="text-gray-500 text-sm">/{plan.period}</span>
                  </>
                )}
              </div>
              {isCurrentPlan && (
                <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  Aktif Plan
                </span>
              )}
            </div>

            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-green-600 text-lg flex-shrink-0">
                    check_circle
                  </span>
                  <span className="text-sm text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscribe(plan.id, plan.price)}
              disabled={isCurrentPlan || isDisabled}
              className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                isCurrentPlan
                  ? "bg-gray-200 text-gray-600 cursor-not-allowed"
                  : plan.popular
                  ? "bg-[#D97706] text-white hover:bg-[#92400E]"
                  : "bg-gray-100 text-[#1F2937] hover:bg-gray-200"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading === plan.id
                ? "İşleniyor..."
                : isCurrentPlan
                ? "Aktif Plan"
                : plan.price === 0
                ? "Ücretsiz Başla"
                : "Abone Ol"}
            </button>
          </div>
        );
      })}
    </div>
  );
}

