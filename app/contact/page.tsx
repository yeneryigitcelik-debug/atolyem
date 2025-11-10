"use client";

import { useState } from "react";
import Link from "next/link";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form gönderimi burada yapılacak
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 3000);
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden" style={{ backgroundColor: '#FFF8F1' }}>
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 justify-center px-4 sm:px-8 md:px-12 lg:px-20 xl:px-40 py-5">
          <div className="layout-content-container flex w-full max-w-[1280px] flex-1 flex-col">
            <main className="flex-1 my-8">
              <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-4xl font-bold text-[#1F2937] mb-8">Bize Ulaşın</h1>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h2 className="text-2xl font-semibold text-[#1F2937] mb-4">İletişim Bilgileri</h2>
                    <div className="space-y-4 text-gray-700">
                      <div>
                        <h3 className="font-semibold text-[#1F2937] mb-1">E-posta</h3>
                        <a href="mailto:info@atolyem.net" className="text-[#D97706] hover:underline">
                          info@atolyem.net
                        </a>
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#1F2937] mb-1">Telefon</h3>
                        <a href="tel:+905551234567" className="text-[#D97706] hover:underline">
                          +90 (555) 123 45 67
                        </a>
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#1F2937] mb-1">Adres</h3>
                        <p className="text-gray-600">
                          Atölyem.net<br />
                          İstanbul, Türkiye
                        </p>
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#1F2937] mb-2">Çalışma Saatleri</h3>
                        <p className="text-gray-600">
                          Pazartesi - Cuma: 09:00 - 18:00<br />
                          Cumartesi: 10:00 - 16:00<br />
                          Pazar: Kapalı
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-2xl font-semibold text-[#1F2937] mb-4">Mesaj Gönderin</h2>
                    {submitted ? (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
                        Mesajınız başarıyla gönderildi! En kısa sürede size dönüş yapacağız.
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            Ad Soyad *
                          </label>
                          <input
                            type="text"
                            id="name"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#D97706] focus:outline-none focus:ring-2 focus:ring-[#D97706]/20"
                          />
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            E-posta *
                          </label>
                          <input
                            type="email"
                            id="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#D97706] focus:outline-none focus:ring-2 focus:ring-[#D97706]/20"
                          />
                        </div>
                        <div>
                          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                            Konu *
                          </label>
                          <select
                            id="subject"
                            required
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#D97706] focus:outline-none focus:ring-2 focus:ring-[#D97706]/20"
                          >
                            <option value="">Seçiniz</option>
                            <option value="general">Genel Bilgi</option>
                            <option value="seller">Satıcı Olmak</option>
                            <option value="order">Sipariş Sorunu</option>
                            <option value="technical">Teknik Destek</option>
                            <option value="other">Diğer</option>
                          </select>
                        </div>
                        <div>
                          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                            Mesajınız *
                          </label>
                          <textarea
                            id="message"
                            required
                            rows={5}
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-[#D97706] focus:outline-none focus:ring-2 focus:ring-[#D97706]/20"
                          />
                        </div>
                        <button
                          type="submit"
                          className="w-full rounded-md bg-[#D97706] px-6 py-2 text-white hover:bg-[#92400E] transition-colors font-medium"
                        >
                          Gönder
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

