"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ProductPerformance {
  productId: string;
  productTitle: string;
  sales: number;
  revenue: number;
  averageRating: number;
}

interface TopProductsChartProps {
  data: ProductPerformance[];
}

export default function TopProductsChart({ data }: TopProductsChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 0,
    }).format(value / 100);
  };

  const chartData = data.slice(0, 10).map((item) => ({
    name: item.productTitle.length > 20
      ? item.productTitle.substring(0, 20) + "..."
      : item.productTitle,
    sales: item.sales,
    revenue: item.revenue / 100, // Convert to TL
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" tick={{ fontSize: 12 }} />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 12 }}
          width={150}
        />
        <Tooltip
          formatter={(value: number, name: string) => {
            if (name === "revenue") {
              return formatCurrency(value * 100);
            }
            return value;
          }}
        />
        <Legend />
        <Bar dataKey="sales" fill="#D97706" name="Satış Sayısı" />
        <Bar dataKey="revenue" fill="#3B82F6" name="Gelir (₺)" />
      </BarChart>
    </ResponsiveContainer>
  );
}

