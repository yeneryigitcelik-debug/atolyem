import PageHeader from "@/components/ui/PageHeader";

export default function SatisKurallariPage() {
  return (
    <>
      <PageHeader title="Satış Kuralları" description="Atölyem.net'te satış yapmak için bilmeniz gerekenler." />

      <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-bold text-text-charcoal mb-4">1. Satıcı Kriterleri</h2>
            <ul className="list-disc pl-6 text-text-secondary space-y-2">
              <li>18 yaşından büyük olmak</li>
              <li>Türkiye&apos;de ikamet etmek veya Türkiye&apos;de vergi mükellefi olmak</li>
              <li>Orijinal, el yapımı veya özgün tasarım ürünler satmak</li>
              <li>Portfolyo veya önceki çalışma örnekleri sunmak</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-charcoal mb-4">2. Ürün Politikası</h2>
            <p className="text-text-secondary mb-4">Aşağıdaki ürünler platformumuzda satılamaz:</p>
            <ul className="list-disc pl-6 text-text-secondary space-y-2">
              <li>Seri üretim ürünler</li>
              <li>Telif hakları ihlali içeren ürünler</li>
              <li>Yasa dışı veya zararlı ürünler</li>
              <li>Replika veya taklit ürünler</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-charcoal mb-4">3. Komisyon ve Ödeme</h2>
            <div className="bg-surface-warm rounded-lg p-6">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-3xl font-bold text-primary">%15</p>
                  <p className="text-text-secondary text-sm">Platform komisyonu</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary">%85</p>
                  <p className="text-text-secondary text-sm">Sanatçı payı</p>
                </div>
              </div>
            </div>
            <p className="text-text-secondary mt-4">Ödemeler her ayın 1&apos;i ve 15&apos;inde banka hesabınıza aktarılır.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-charcoal mb-4">4. Kargo ve Teslimat</h2>
            <ul className="list-disc pl-6 text-text-secondary space-y-2">
              <li>Sipariş alındıktan sonra 3 iş günü içinde kargoya verilmelidir</li>
              <li>Ürünler hasardan koruyacak şekilde paketlenmelidir</li>
              <li>Kargo takip numarası sisteme girilmelidir</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-charcoal mb-4">5. İade Politikası</h2>
            <p className="text-text-secondary">
              Alıcılar 14 gün içinde iade talep edebilir. Hasarlı veya yanlış gönderilen ürünlerde iade kargo ücreti satıcıya aittir. Özel sipariş ürünler iade kapsamı dışındadır.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-charcoal mb-4">6. Hesap Askıya Alma</h2>
            <p className="text-text-secondary">
              Kurallara uyulmadığı durumlarda hesabınız geçici veya kalıcı olarak askıya alınabilir. Üç kez uyarı alan hesaplar kalıcı olarak kapatılır.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}

