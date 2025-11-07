"use client";

import { useState, useEffect } from "react";

/**
 * Address management component for user profile
 * Handles CRUD operations for user addresses
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

export default function AddressManager() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    city: "",
    district: "",
    addressLine: "",
    phone: "",
    isDefault: false,
  });
  const [error, setError] = useState("");

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const res = await fetch("/api/addresses");
      if (res.ok) {
        const data = await res.json();
        setAddresses(data.addresses || []);
      }
    } catch (error) {
      console.error("Load addresses error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const url = editing ? "/api/addresses" : "/api/addresses";
      const method = editing ? "PATCH" : "POST";
      const body = editing ? { id: editing, ...formData } : formData;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Bir hata oluştu");
      }

      setShowForm(false);
      setEditing(null);
      setFormData({
        title: "",
        city: "",
        district: "",
        addressLine: "",
        phone: "",
        isDefault: false,
      });
      loadAddresses();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleEdit = (address: Address) => {
    setEditing(address.id);
    setFormData({
      title: address.title,
      city: address.city,
      district: address.district,
      addressLine: address.addressLine,
      phone: address.phone || "",
      isDefault: address.isDefault,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu adresi silmek istediğinize emin misiniz?")) return;

    try {
      const res = await fetch(`/api/addresses?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Silme işlemi başarısız");
      }

      loadAddresses();
    } catch (error: any) {
      alert(error.message);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#1F2937]">Adreslerim</h3>
        <button
          onClick={() => {
            setShowForm(true);
            setEditing(null);
            setFormData({
              title: "",
              city: "",
              district: "",
              addressLine: "",
              phone: "",
              isDefault: false,
            });
          }}
          className="rounded-md bg-[#D97706] px-4 py-2 text-sm text-white hover:bg-[#92400E]"
        >
          + Yeni Adres
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-lg border border-gray-200 bg-white p-6 space-y-4">
          {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adres Başlığı</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="Ev, İş, vb."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Şehir</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">İlçe</label>
              <input
                type="text"
                required
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adres</label>
            <textarea
              required
              value={formData.addressLine}
              onChange={(e) => setFormData({ ...formData, addressLine: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefon (Opsiyonel)</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                className="rounded border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">Varsayılan adres olarak ayarla</span>
            </label>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-md bg-[#D97706] px-4 py-2 text-white hover:bg-[#92400E]"
            >
              {editing ? "Güncelle" : "Kaydet"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditing(null);
                setError("");
              }}
              className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              İptal
            </button>
          </div>
        </form>
      )}

      {addresses.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <p className="text-gray-600 mb-4">Henüz adres eklenmemiş</p>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((address) => (
            <div
              key={address.id}
              className="flex items-start justify-between rounded-lg border border-gray-200 bg-white p-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">{address.title}</span>
                  {address.isDefault && (
                    <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                      Varsayılan
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  {address.district}, {address.city}
                </div>
                <div className="text-sm text-gray-600">{address.addressLine}</div>
                {address.phone && (
                  <div className="text-sm text-gray-600 mt-1">Tel: {address.phone}</div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(address)}
                  className="text-sm text-[#D97706] hover:text-[#92400E]"
                >
                  Düzenle
                </button>
                <button
                  onClick={() => handleDelete(address.id)}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Sil
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

