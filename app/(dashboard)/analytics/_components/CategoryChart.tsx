"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

interface CategoryPerformance {
  categoryId: string;
  categoryName: string;
  sales: number;
  revenue: number;
}

interface CategoryChartProps {
  data: CategoryPerformance[];
}

const COLORS = ["#D97706", "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

export default function CategoryChart({ data }: CategoryChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 0,
    }).format(value / 100);
  };

  const chartData = data.map((item) => ({
    name: item.categoryName,
    value: item.revenue / 100, // Convert to TL
    sales: item.sales,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={(props: any) => {
            if (!props || typeof props !== 'object') return '';
            const name = props.name || props.payload?.name || '';
            const percent = props.percent || props.payload?.percent || 0;
            return `${name} ${(percent * 100).toFixed(0)}%`;
          }}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => formatCurrency(value * 100)}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

