import PageHeader from "@/components/ui/PageHeader";
import Link from "next/link";

export default function HakkimizdaPage() {
  return (
    <>
      <PageHeader 
        title="Hakkımızda" 
        description="Sanatın ve el emeğinin değerini bilenler için kurulmuş bir platform."
      />

      {/* Story */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl font-bold text-text-charcoal mb-6">Hikayemiz</h2>
            <div className="space-y-4 text-text-secondary leading-relaxed">
              <p>
                Atölyem.net, 2023 yılında Türkiye&apos;nin dört bir yanındaki yetenekli sanatçıları sanatseverlerle buluşturmak amacıyla kuruldu.
              </p>
              <p>
                Amacımız, el emeği göz nuru eserlerin hak ettiği değeri bulmasını sağlamak ve sanatçıların sürdürülebilir bir gelir elde etmelerine yardımcı olmak.
              </p>
              <p>
                Her eser, uzman editörlerimiz tarafından titizlikle incelenir ve platformumuza sadece özgün, kaliteli işler kabul edilir.
              </p>
            </div>
          </div>
          <div className="aspect-[4/3] rounded-lg overflow-hidden">
            <div
              className="w-full h-full bg-cover bg-center"
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&h=600&fit=crop')" }}
            />
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-surface-warm border-y border-border-subtle py-16">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-text-charcoal mb-12 text-center">Değerlerimiz</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-primary text-2xl">palette</span>
              </div>
              <h3 className="text-lg font-bold text-text-charcoal mb-2">Özgünlük</h3>
              <p className="text-text-secondary">Her eser benzersiz ve orijinal. Seri üretim değil, el emeği.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-primary text-2xl">handshake</span>
              </div>
              <h3 className="text-lg font-bold text-text-charcoal mb-2">Güven</h3>
              <p className="text-text-secondary">Tüm sanatçılarımız doğrulanmış. Güvenli alışveriş garantisi.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-primary text-2xl">eco</span>
              </div>
              <h3 className="text-lg font-bold text-text-charcoal mb-2">Sürdürülebilirlik</h3>
              <p className="text-text-secondary">Yerel üretim, minimal karbon ayak izi.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-text-charcoal mb-12 text-center">Ekibimiz</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { name: "Aylin Yılmaz", role: "Kurucu & CEO" },
            { name: "Mehmet Demir", role: "Baş Küratör" },
            { name: "Zeynep Kaya", role: "Topluluk Yöneticisi" },
            { name: "Can Öztürk", role: "Teknoloji Direktörü" },
          ].map((member, i) => (
            <div key={i} className="text-center">
              <div className="w-24 h-24 rounded-full bg-background-ivory mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold text-text-charcoal">{member.name.split(' ').map(n => n[0]).join('')}</span>
              </div>
              <h3 className="font-semibold text-text-charcoal">{member.name}</h3>
              <p className="text-sm text-text-secondary">{member.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-16">
        <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Bize Katılın</h2>
          <p className="text-white/80 mb-8">Sanatçı olarak satış yapmak veya ekibimize katılmak için hemen iletişime geçin.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/sanatci-ol" className="px-8 py-3 bg-white text-primary font-semibold rounded-md hover:bg-gray-100 transition-colors">
              Sanatçı Ol
            </Link>
            <Link href="/kariyer" className="px-8 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-md hover:bg-white/10 transition-colors">
              Kariyer
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

