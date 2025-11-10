"use client";

import { useState } from "react";
import SalesChart from "./SalesChart";
import TopProductsChart from "./TopProductsChart";
import CategoryChart from "./CategoryChart";
import PremiumInsights from "./PremiumInsights";

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

interface SalesDataPoint {
  date: string;
  sales: number;
  revenue: number;
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

interface AnalyticsDashboardProps {
  summary: Summary;
  monthlySales: SalesDataPoint[];
  topProducts: ProductPerformance[];
  categoryPerformance: CategoryPerformance[];
  isPremium: boolean;
}

export default function AnalyticsDashboard({
  summary,
  monthlySales,
  topProducts,
  categoryPerformance,
  isPremium,
}: AnalyticsDashboardProps) {
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(cents / 100);
  };

  const calculateChange = (current: number, last: number) => {
    if (last === 0) return current > 0 ? 100 : 0;
    return ((current - last) / last) * 100;
  };

  const salesChange = calculateChange(summary.currentMonth.sales, summary.lastMonth.sales);
  const revenueChange = calculateChange(
    summary.currentMonth.revenue,
    summary.lastMonth.revenue
  );
  const ordersChange = calculateChange(
    summary.currentMonth.completedOrders,
    summary.lastMonth.completedOrders
  );

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Bu Ay Satış</span>
            <span
              className={`text-xs font-medium ${
                salesChange >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {salesChange >= 0 ? "+" : ""}
              {salesChange.toFixed(1)}%
            </span>
          </div>
          <p className="text-2xl font-bold text-[#1F2937]">{summary.currentMonth.sales}</p>
          <p className="text-xs text-gray-500 mt-1">
            Geçen ay: {summary.lastMonth.sales}
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Bu Ay Gelir</span>
            <span
              className={`text-xs font-medium ${
                revenueChange >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {revenueChange >= 0 ? "+" : ""}
              {revenueChange.toFixed(1)}%
            </span>
          </div>
          <p className="text-2xl font-bold text-[#1F2937]">
            {formatCurrency(summary.currentMonth.revenue)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Geçen ay: {formatCurrency(summary.lastMonth.revenue)}
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Tamamlanan Siparişler</span>
            <span
              className={`text-xs font-medium ${
                ordersChange >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {ordersChange >= 0 ? "+" : ""}
              {ordersChange.toFixed(1)}%
            </span>
          </div>
          <p className="text-2xl font-bold text-[#1F2937]">
            {summary.currentMonth.completedOrders}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Ortalama: {formatCurrency(summary.currentMonth.averageOrderValue)}
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <span className="text-sm text-gray-600 block mb-2">Toplam Gelir</span>
          <p className="text-2xl font-bold text-[#1F2937]">
            {formatCurrency(summary.total.revenue)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {summary.total.orders} toplam sipariş
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-[#1F2937] mb-4">Aylık Satış Trendi</h2>
          <SalesChart data={monthlySales} />
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-[#1F2937] mb-4">En Çok Satan Ürünler</h2>
          <TopProductsChart data={topProducts} />
        </div>
      </div>

      {/* Category Performance */}
      {categoryPerformance.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-[#1F2937] mb-4">Kategori Performansı</h2>
          <CategoryChart data={categoryPerformance} />
        </div>
      )}

      {/* Premium Insights */}
      {isPremium && (
        <PremiumInsights
          summary={summary}
          topProducts={topProducts}
          categoryPerformance={categoryPerformance}
        />
      )}
    </div>
  );
}

