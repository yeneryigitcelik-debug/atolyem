"use client";

interface Summary {
  currentMonth: {
    sales: number;
    revenue: number;
    completedOrders: number;
    averageOrderValue: number;
  };
  lastMonth: {
    sales: number;
    revenue: number;
    completedOrders: number;
    averageOrderValue: number;
  };
  total: {
    orders: number;
    revenue: number;
  };
}

interface ProductPerformance {
  productId: string;
  productTitle: string;
  sales: number;
  revenue: number;
  averageRating: number;
}

interface CategoryPerformance {
  categoryId: string;
  categoryName: string;
  sales: number;
  revenue: number;
}

interface PremiumInsightsProps {
  summary: Summary;
  topProducts: ProductPerformance[];
  categoryPerformance: CategoryPerformance[];
}

export default function PremiumInsights({
  summary,
  topProducts,
  categoryPerformance,
}: PremiumInsightsProps) {
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(cents / 100);
  };

  // Calculate growth rate
  const revenueGrowth =
    summary.lastMonth.revenue > 0
      ? ((summary.currentMonth.revenue - summary.lastMonth.revenue) /
          summary.lastMonth.revenue) *
        100
      : 0;

  // Get top category
  const topCategory = categoryPerformance[0];

  // Get best performing product
  const bestProduct = topProducts[0];

  // Calculate recommendations
  const recommendations: string[] = [];

  if (revenueGrowth < 0) {
    recommendations.push("Bu ay geliriniz düşüş gösterdi. Ürün fiyatlandırmalarınızı gözden geçirin.");
  }

  if (summary.currentMonth.averageOrderValue < 50000) {
    recommendations.push("Ortalama sipariş değeriniz düşük. Ürün paketleri veya çapraz satış önerileri ekleyin.");
  }

  if (topProducts.length < 5) {
    recommendations.push("Daha fazla ürün çeşitliliği ekleyerek satış potansiyelinizi artırabilirsiniz.");
  }

  if (bestProduct && bestProduct.averageRating < 4) {
    recommendations.push("En çok satan ürününüzün değerlendirmelerini iyileştirmek için müşteri geri bildirimlerini inceleyin.");
  }

  return (
    <div className="bg-gradient-to-br from-[#D97706]/10 to-[#92400E]/10 rounded-lg border border-[#D97706]/20 p-6">
      <div className="flex items-center gap-3 mb-6">
        <span className="material-symbols-outlined text-[#D97706] text-3xl">insights</span>
        <div>
          <h2 className="text-2xl font-bold text-[#1F2937]">Premium İçgörüler</h2>
          <p className="text-sm text-gray-600">Gelişmiş analitik ve öneriler</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Büyüme Oranı</div>
          <div className={`text-2xl font-bold ${revenueGrowth >= 0 ? "text-green-600" : "text-red-600"}`}>
            {revenueGrowth >= 0 ? "+" : ""}
            {revenueGrowth.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500 mt-1">Aylık gelir değişimi</div>
        </div>

        {topCategory && (
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">En İyi Kategori</div>
            <div className="text-xl font-bold text-[#1F2937]">{topCategory.categoryName}</div>
            <div className="text-xs text-gray-500 mt-1">
              {formatCurrency(topCategory.revenue)} gelir
            </div>
          </div>
        )}

        {bestProduct && (
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">En Çok Satan Ürün</div>
            <div className="text-lg font-bold text-[#1F2937] truncate">
              {bestProduct.productTitle}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              ⭐ {bestProduct.averageRating.toFixed(1)} • {bestProduct.sales} satış
            </div>
          </div>
        )}
      </div>

      {recommendations.length > 0 && (
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h3 className="font-semibold text-[#1F2937] mb-3">Öneriler</h3>
          <ul className="space-y-2">
            {recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="material-symbols-outlined text-[#D97706] text-lg flex-shrink-0">
                  lightbulb
                </span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {recommendations.length === 0 && (
        <div className="bg-white rounded-lg p-4 text-center">
          <span className="material-symbols-outlined text-green-600 text-4xl mb-2">check_circle</span>
          <p className="text-gray-700 font-medium">Harika! Performansınız optimal seviyede.</p>
        </div>
      )}
    </div>
  );
}

