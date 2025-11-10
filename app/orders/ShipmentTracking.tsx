"use client";

import { useState, useEffect } from "react";

interface Shipment {
  id: string;
  carrier: string;
  trackingCode: string | null;
  status: "CREATED" | "IN_TRANSIT" | "DELIVERED" | "RETURNED";
  createdAt: string;
  updatedAt: string;
}

interface ShipmentTrackingProps {
  orderId: string;
}

const statusLabels: Record<string, string> = {
  CREATED: "Oluşturuldu",
  IN_TRANSIT: "Yolda",
  DELIVERED: "Teslim Edildi",
  RETURNED: "İade Edildi",
};

const statusColors: Record<string, string> = {
  CREATED: "bg-gray-100 text-gray-800",
  IN_TRANSIT: "bg-blue-100 text-blue-800",
  DELIVERED: "bg-green-100 text-green-800",
  RETURNED: "bg-red-100 text-red-800",
};

export default function ShipmentTracking({ orderId }: ShipmentTrackingProps) {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadShipments();
  }, [orderId]);

  const loadShipments = async () => {
    try {
      const res = await fetch(`/api/shipments?orderId=${orderId}`);
      if (res.ok) {
        const data = await res.json();
        setShipments(data.shipments || []);
      }
    } catch (error) {
      console.error("Load shipments error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-sm text-gray-600">Kargo bilgisi yükleniyor...</div>;
  }

  if (shipments.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 space-y-3">
      {shipments.map((shipment) => (
        <div key={shipment.id} className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-900">{shipment.carrier}</div>
              {shipment.trackingCode && (
                <div className="mt-1 text-xs text-gray-600">
                  Takip No: <span className="font-mono">{shipment.trackingCode}</span>
                </div>
              )}
            </div>
            <div className="text-right">
              <span
                className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusColors[shipment.status] || statusColors.CREATED}`}
              >
                {statusLabels[shipment.status] || shipment.status}
              </span>
              {shipment.trackingCode && (
                <a
                  href={`https://www.google.com/search?q=${shipment.carrier}+${shipment.trackingCode}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 block text-xs text-[#D97706] hover:underline"
                >
                  Takip Et →
                </a>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

