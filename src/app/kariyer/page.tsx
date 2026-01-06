import PageHeader from "@/components/ui/PageHeader";
import Link from "next/link";

const jobs = [
  { title: "Frontend Developer", department: "Teknoloji", type: "Tam Zamanlı", location: "İstanbul / Uzaktan" },
  { title: "Küratör Asistanı", department: "İçerik", type: "Tam Zamanlı", location: "İstanbul" },
  { title: "Müşteri Temsilcisi", department: "Destek", type: "Tam Zamanlı", location: "İstanbul" },
  { title: "Sosyal Medya Uzmanı", department: "Pazarlama", type: "Tam Zamanlı", location: "Uzaktan" },
];

export default function KariyerPage() {
  return (
    <>
      <PageHeader 
        title="Kariyer" 
        description="Sanat dünyasını değiştirmek için bize katılın."
      />

      {/* Why Join */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-text-charcoal mb-8 text-center">Neden Atölyem?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-surface-white rounded-lg border border-border-subtle p-6 text-center">
            <span className="material-symbols-outlined text-primary text-3xl mb-4">diversity_3</span>
            <h3 className="font-bold text-text-charcoal mb-2">Dinamik Ekip</h3>
            <p className="text-text-secondary text-sm">Sanata tutkulu, yenilikçi bir ekiple çalışın.</p>
          </div>
          <div className="bg-surface-white rounded-lg border border-border-subtle p-6 text-center">
            <span className="material-symbols-outlined text-primary text-3xl mb-4">trending_up</span>
            <h3 className="font-bold text-text-charcoal mb-2">Büyüme Fırsatı</h3>
            <p className="text-text-secondary text-sm">Hızla büyüyen bir startup'ta kariyer gelişimi.</p>
          </div>
          <div className="bg-surface-white rounded-lg border border-border-subtle p-6 text-center">
            <span className="material-symbols-outlined text-primary text-3xl mb-4">work_history</span>
            <h3 className="font-bold text-text-charcoal mb-2">Esnek Çalışma</h3>
            <p className="text-text-secondary text-sm">Hibrit ve uzaktan çalışma imkanları.</p>
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="bg-surface-warm border-y border-border-subtle py-16">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-text-charcoal mb-8">Açık Pozisyonlar</h2>
          <div className="space-y-4">
            {jobs.map((job, i) => (
              <div key={i} className="bg-surface-white rounded-lg border border-border-subtle p-6 hover:border-primary transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-text-charcoal">{job.title}</h3>
                    <div className="flex flex-wrap gap-3 mt-2">
                      <span className="text-sm text-text-secondary flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">work</span>
                        {job.department}
                      </span>
                      <span className="text-sm text-text-secondary flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">schedule</span>
                        {job.type}
                      </span>
                      <span className="text-sm text-text-secondary flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">location_on</span>
                        {job.location}
                      </span>
                    </div>
                  </div>
                  <button className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white font-medium rounded-md transition-colors whitespace-nowrap">
                    Başvur
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-2xl font-bold text-text-charcoal mb-4">Aradığınız pozisyon yok mu?</h2>
        <p className="text-text-secondary mb-8">Özgeçmişinizi gönderin, uygun bir pozisyon açıldığında sizinle iletişime geçelim.</p>
        <Link href="/iletisim" className="inline-flex px-8 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-md transition-colors">
          İletişime Geç
        </Link>
      </section>
    </>
  );
}

