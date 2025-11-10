"use client";

import { useState } from "react";
import Link from "next/link";

interface Subscription {
  id: string;
  plan: string;
  status: string;
  amountCents: number;
  startedAt: string;
  expiresAt: string | null;
  canceledAt: string | null;
  paymentGateway: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface SubscriptionsListProps {
  subscriptions: Subscription[];
}

export default function SubscriptionsList({ subscriptions }: SubscriptionsListProps) {
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "CANCELED" | "EXPIRED">("ALL");

  const filteredSubscriptions = subscriptions.filter((sub) => {
    if (filter === "ALL") return true;
    return sub.status === filter;
  });

  const statusColors: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-800",
    CANCELED: "bg-red-100 text-red-800",
    EXPIRED: "bg-gray-100 text-gray-800",
    PENDING: "bg-yellow-100 text-yellow-800",
  };

  const planLabels: Record<string, string> = {
    BASIC: "Temel",
    PREMIUM: "Premium",
    ENTERPRISE: "Kurumsal",
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Filters */}
      <div className="p-4 border-b border-gray-200 flex gap-2">
        <button
          onClick={() => setFilter("ALL")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === "ALL"
              ? "bg-[#D97706] text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Tümü
        </button>
        <button
          onClick={() => setFilter("ACTIVE")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === "ACTIVE"
              ? "bg-[#D97706] text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Aktif
        </button>
        <button
          onClick={() => setFilter("CANCELED")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === "CANCELED"
              ? "bg-[#D97706] text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          İptal Edilmiş
        </button>
        <button
          onClick={() => setFilter("EXPIRED")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === "EXPIRED"
              ? "bg-[#D97706] text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Süresi Dolmuş
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kullanıcı
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Plan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Durum
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tutar
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Başlangıç
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bitiş
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ödeme
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredSubscriptions.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  Abonelik bulunamadı
                </td>
              </tr>
            ) : (
              filteredSubscriptions.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {sub.user.name || "İsimsiz"}
                      </div>
                      <div className="text-sm text-gray-500">{sub.user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">
                      {planLabels[sub.plan] || sub.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        statusColors[sub.status] || statusColors.PENDING
                      }`}
                    >
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {(sub.amountCents / 100).toFixed(2)} ₺
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(sub.startedAt).toLocaleDateString("tr-TR")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {sub.expiresAt
                      ? new Date(sub.expiresAt).toLocaleDateString("tr-TR")
                      : "Otomatik yenileme"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {sub.paymentGateway}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

