"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import PageHeader from "@/components/ui/PageHeader";
import AccountSidebar from "@/components/layout/AccountSidebar";
import Link from "next/link";

interface Address {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  district: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
}

const initialAddresses: Address[] = [
  {
    id: "1",
    label: "Ev",
    fullName: "Ahmet Yılmaz",
    phone: "+90 532 123 45 67",
    addressLine1: "Atatürk Caddesi No: 123",
    addressLine2: "Daire: 5",
    district: "Kadıköy",
    province: "İstanbul",
    postalCode: "34710",
    isDefault: true,
  },
  {
    id: "2",
    label: "İş",
    fullName: "Ahmet Yılmaz",
    phone: "+90 532 123 45 67",
    addressLine1: "Barbaros Bulvarı No: 45",
    addressLine2: "Kat: 3",
    district: "Beşiktaş",
    province: "İstanbul",
    postalCode: "34353",
    isDefault: false,
  },
];

const provinces = [
  "Adana", "Ankara", "Antalya", "Bursa", "Denizli", "Diyarbakır", "Eskişehir", 
  "Gaziantep", "İstanbul", "İzmir", "Kayseri", "Kocaeli", "Konya", "Mersin", 
  "Muğla", "Sakarya", "Samsun", "Trabzon"
];

export default function AdreslerimPage() {
  const { user, isLoading } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Omit<Address, "id" | "isDefault">>({
    label: "",
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    district: "",
    province: "",
    postalCode: "",
  });

  const resetForm = () => {
    setFormData({
      label: "",
      fullName: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      district: "",
      province: "",
      postalCode: "",
    });
    setIsAddingNew(false);
    setEditingId(null);
  };

  const handleEdit = (address: Address) => {
    setFormData({
      label: address.label,
      fullName: address.fullName,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || "",
      district: address.district,
      province: address.province,
      postalCode: address.postalCode,
    });
    setEditingId(address.id);
    setIsAddingNew(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      setAddresses(prev => prev.map(addr => 
        addr.id === editingId 
          ? { ...addr, ...formData }
          : addr
      ));
    } else {
      const newAddress: Address = {
        ...formData,
        id: Date.now().toString(),
        isDefault: addresses.length === 0,
      };
      setAddresses(prev => [...prev, newAddress]);
    }
    
    resetForm();
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await new Promise(resolve => setTimeout(resolve, 300));
    setAddresses(prev => prev.filter(addr => addr.id !== id));
    setDeletingId(null);
  };

  const handleSetDefault = (id: string) => {
    setAddresses(prev => prev.map(addr => ({
      ...addr,
      isDefault: addr.id === id,
    })));
  };

  if (!isLoading && !user) {
    return (
      <>
        <PageHeader title="Adreslerim" />
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-primary text-4xl">login</span>
            </div>
            <h2 className="text-xl font-bold text-text-charcoal mb-2">Giriş Yapın</h2>
            <p className="text-text-secondary mb-8">Adreslerinizi görmek için hesabınıza giriş yapın.</p>
            <Link 
              href="/hesap" 
              className="inline-flex px-8 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-md transition-colors"
            >
              Giriş Yap
            </Link>
          </div>
        </div>
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <PageHeader title="Adreslerim" />
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-16">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="text-text-secondary mt-4">Yükleniyor...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Adreslerim" />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <AccountSidebar activePage="adreslerim" />

          {/* Content */}
          <div className="lg:col-span-3">
            {/* Add New Button */}
            {!isAddingNew && !editingId && (
              <button
                onClick={() => setIsAddingNew(true)}
                className="w-full mb-6 py-4 border-2 border-dashed border-border-subtle hover:border-primary text-text-secondary hover:text-primary rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">add</span>
                Yeni Adres Ekle
              </button>
            )}

            {/* Address Form */}
            {(isAddingNew || editingId) && (
              <div className="bg-surface-white rounded-lg border border-border-subtle p-6 mb-6">
                <h3 className="font-bold text-text-charcoal mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">
                    {editingId ? "edit" : "add_location"}
                  </span>
                  {editingId ? "Adresi Düzenle" : "Yeni Adres Ekle"}
                </h3>
                
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-charcoal mb-2">Adres Etiketi</label>
                      <input
                        type="text"
                        value={formData.label}
                        onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                        required
                        placeholder="Örn: Ev, İş"
                        className="w-full px-4 py-3 border border-border-subtle rounded-md focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-charcoal mb-2">Ad Soyad</label>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        required
                        className="w-full px-4 py-3 border border-border-subtle rounded-md focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-charcoal mb-2">Telefon</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                      placeholder="+90 5XX XXX XX XX"
                      className="w-full px-4 py-3 border border-border-subtle rounded-md focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-charcoal mb-2">Adres Satırı 1</label>
                    <input
                      type="text"
                      value={formData.addressLine1}
                      onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                      required
                      placeholder="Sokak, cadde, bina no"
                      className="w-full px-4 py-3 border border-border-subtle rounded-md focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-charcoal mb-2">Adres Satırı 2 (Opsiyonel)</label>
                    <input
                      type="text"
                      value={formData.addressLine2}
                      onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                      placeholder="Daire, kat, blok"
                      className="w-full px-4 py-3 border border-border-subtle rounded-md focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-charcoal mb-2">İl</label>
                      <select
                        value={formData.province}
                        onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                        required
                        className="w-full px-4 py-3 border border-border-subtle rounded-md focus:outline-none focus:border-primary"
                      >
                        <option value="">Seçiniz</option>
                        {provinces.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-charcoal mb-2">İlçe</label>
                      <input
                        type="text"
                        value={formData.district}
                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                        required
                        className="w-full px-4 py-3 border border-border-subtle rounded-md focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-charcoal mb-2">Posta Kodu</label>
                      <input
                        type="text"
                        value={formData.postalCode}
                        onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                        required
                        className="w-full px-4 py-3 border border-border-subtle rounded-md focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 py-3 border border-border-subtle text-text-charcoal hover:border-primary hover:text-primary rounded-lg transition-colors"
                    >
                      İptal
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-colors"
                    >
                      {editingId ? "Güncelle" : "Kaydet"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Address List */}
            {addresses.length > 0 ? (
              <div className="space-y-4">
                {addresses.map((address) => (
                  <div
                    key={address.id}
                    className={`bg-surface-white rounded-lg border p-6 transition-all ${
                      address.isDefault ? "border-primary" : "border-border-subtle"
                    } ${deletingId === address.id ? "opacity-50 scale-98" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-grow">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-bold text-text-charcoal">{address.label}</span>
                          {address.isDefault && (
                            <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded">
                              Varsayılan
                            </span>
                          )}
                        </div>
                        <p className="font-medium text-text-charcoal">{address.fullName}</p>
                        <p className="text-text-secondary">{address.phone}</p>
                        <p className="text-text-secondary mt-2">
                          {address.addressLine1}
                          {address.addressLine2 && <>, {address.addressLine2}</>}
                        </p>
                        <p className="text-text-secondary">
                          {address.district}, {address.province} {address.postalCode}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(address)}
                          className="p-2 text-text-secondary hover:text-primary hover:bg-background-ivory rounded-lg transition-colors"
                          title="Düzenle"
                        >
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(address.id)}
                          disabled={deletingId === address.id}
                          className="p-2 text-text-secondary hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Sil"
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    </div>
                    
                    {!address.isDefault && (
                      <button
                        onClick={() => handleSetDefault(address.id)}
                        className="mt-4 text-sm text-primary hover:text-primary-dark font-medium"
                      >
                        Varsayılan Yap
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              !isAddingNew && (
                <div className="text-center py-16">
                  <span className="material-symbols-outlined text-6xl text-border-subtle mb-4">location_off</span>
                  <h2 className="text-xl font-bold text-text-charcoal mb-2">Henüz adres eklemediniz</h2>
                  <p className="text-text-secondary mb-8">Teslimat için adres ekleyin.</p>
                  <button
                    onClick={() => setIsAddingNew(true)}
                    className="inline-flex px-8 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-md transition-colors"
                  >
                    Adres Ekle
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </>
  );
}
