import PageHeader from "@/components/ui/PageHeader";

export default function IletisimPage() {
  return (
    <>
      <PageHeader 
        title="İletişim" 
        description="Sorularınız için bize ulaşın. Size yardımcı olmaktan mutluluk duyarız."
      />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-surface-white rounded-lg border border-border-subtle p-8">
            <h2 className="text-xl font-bold text-text-charcoal mb-6">Bize Yazın</h2>
            <form className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-charcoal mb-2">Ad Soyad</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-border-subtle rounded-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder="Adınız Soyadınız"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-charcoal mb-2">E-posta</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border border-border-subtle rounded-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder="ornek@email.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-charcoal mb-2">Konu</label>
                <select className="w-full px-4 py-3 border border-border-subtle rounded-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-text-charcoal">
                  <option>Genel Soru</option>
                  <option>Sipariş Hakkında</option>
                  <option>Satıcı Başvurusu</option>
                  <option>Teknik Destek</option>
                  <option>İş Birliği</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-charcoal mb-2">Mesajınız</label>
                <textarea
                  rows={5}
                  className="w-full px-4 py-3 border border-border-subtle rounded-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                  placeholder="Mesajınızı buraya yazın..."
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-md transition-colors"
              >
                Gönder
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            <div className="bg-surface-white rounded-lg border border-border-subtle p-8">
              <h2 className="text-xl font-bold text-text-charcoal mb-6">İletişim Bilgileri</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-primary text-2xl mt-1">mail</span>
                  <div>
                    <h3 className="font-semibold text-text-charcoal">E-posta</h3>
                    <p className="text-text-secondary">destek@atolyem.net</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-primary text-2xl mt-1">phone</span>
                  <div>
                    <h3 className="font-semibold text-text-charcoal">Telefon</h3>
                    <p className="text-text-secondary">+90 (212) 000 00 00</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-primary text-2xl mt-1">location_on</span>
                  <div>
                    <h3 className="font-semibold text-text-charcoal">Adres</h3>
                    <p className="text-text-secondary">Levent, İstanbul, Türkiye</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-primary text-2xl mt-1">schedule</span>
                  <div>
                    <h3 className="font-semibold text-text-charcoal">Çalışma Saatleri</h3>
                    <p className="text-text-secondary">Pazartesi - Cuma: 09:00 - 18:00</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface-warm rounded-lg border border-border-subtle p-8">
              <h3 className="font-bold text-text-charcoal mb-4">Sıkça Sorulan Sorular</h3>
              <p className="text-text-secondary mb-4">Cevabını aradığınız soru belki Yardım Merkezimizde vardır.</p>
              <a href="/yardim" className="inline-flex items-center text-primary font-medium hover:underline">
                Yardım Merkezi
                <span className="material-symbols-outlined ml-1 text-base">arrow_forward</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}


