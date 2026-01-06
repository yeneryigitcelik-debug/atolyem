import PageHeader from "@/components/ui/PageHeader";

export default function GizlilikPage() {
  return (
    <>
      <PageHeader title="Gizlilik Politikası" description="Verilerinizi nasıl koruyoruz." />

      <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose max-w-none">
          <p className="text-text-secondary mb-8">Son güncelleme: 1 Ocak 2026</p>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-text-charcoal mb-4">1. Toplanan Veriler</h2>
            <p className="text-text-secondary leading-relaxed mb-4">
              Atölyem.net olarak, hizmetlerimizi sunmak için aşağıdaki verileri topluyoruz:
            </p>
            <ul className="list-disc pl-6 text-text-secondary space-y-2">
              <li>Kimlik bilgileri (ad, soyad, e-posta)</li>
              <li>İletişim bilgileri (telefon, adres)</li>
              <li>Ödeme bilgileri (güvenli ödeme altyapısı üzerinden)</li>
              <li>Kullanım verileri (site ziyaretleri, tercihler)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-text-charcoal mb-4">2. Verilerin Kullanımı</h2>
            <p className="text-text-secondary leading-relaxed">
              Topladığımız veriler; siparişlerinizi işlemek, hesabınızı yönetmek, müşteri desteği sağlamak ve size daha iyi hizmet sunmak için kullanılır. Verileriniz hiçbir koşulda üçüncü taraflarla pazarlama amaçlı paylaşılmaz.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-text-charcoal mb-4">3. Veri Güvenliği</h2>
            <p className="text-text-secondary leading-relaxed">
              Verileriniz 256-bit SSL şifreleme ile korunur. Ödeme bilgileriniz PCI-DSS uyumlu altyapıda işlenir ve sunucularımızda saklanmaz.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-text-charcoal mb-4">4. Çerezler</h2>
            <p className="text-text-secondary leading-relaxed">
              Sitemizde deneyiminizi iyileştirmek için çerezler kullanıyoruz. Tarayıcı ayarlarınızdan çerezleri yönetebilirsiniz.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-text-charcoal mb-4">5. Haklarınız</h2>
            <p className="text-text-secondary leading-relaxed mb-4">
              KVKK kapsamında aşağıdaki haklara sahipsiniz:
            </p>
            <ul className="list-disc pl-6 text-text-secondary space-y-2">
              <li>Verilerinize erişim hakkı</li>
              <li>Verilerin düzeltilmesini talep hakkı</li>
              <li>Verilerin silinmesini talep hakkı</li>
              <li>Veri işlemeye itiraz hakkı</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-charcoal mb-4">6. İletişim</h2>
            <p className="text-text-secondary leading-relaxed">
              Gizlilik politikamızla ilgili sorularınız için <a href="mailto:gizlilik@atolyem.net" className="text-primary hover:underline">gizlilik@atolyem.net</a> adresinden bize ulaşabilirsiniz.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}

