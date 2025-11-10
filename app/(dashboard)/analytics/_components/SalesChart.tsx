"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface SalesDataPoint {
  date: string;
  sales: number;
  revenue: number;
}

interface SalesChartProps {
  data: SalesDataPoint[];
}

export default function SalesChart({ data }: SalesChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 0,
    }).format(value / 100);
  };

  const formatDate = (dateStr: string) => {
    const [year, month] = dateStr.split("-");
    const monthNames = [
      "Oca",
      "Şub",
      "Mar",
      "Nis",
      "May",
      "Haz",
      "Tem",
      "Ağu",
      "Eyl",
      "Eki",
      "Kas",
      "Ara",
    ];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  const chartData = data.map((item) => ({
    ...item,
    dateLabel: formatDate(item.date),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="dateLabel"
          tick={{ fontSize: 12 }}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis
          yAxisId="left"
          tick={{ fontSize: 12 }}
          label={{ value: "Satış Sayısı", angle: -90, position: "insideLeft" }}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tick={{ fontSize: 12 }}
          tickFormatter={formatCurrency}
          label={{ value: "Gelir (₺)", angle: 90, position: "insideRight" }}
        />
        <Tooltip
          formatter={(value: number, name: string) => {
            if (name === "revenue") {
              return formatCurrency(value);
            }
            return value;
          }}
          labelFormatter={(label) => `Tarih: ${label}`}
        />
        <Legend />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="sales"
          stroke="#D97706"
          strokeWidth={2}
          name="Satış Sayısı"
          dot={{ r: 4 }}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="revenue"
          stroke="#3B82F6"
          strokeWidth={2}
          name="Gelir"
          dot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

