import PageHeader from "@/components/ui/PageHeader";
import Link from "next/link";

export default function KoleksiyonlarPage() {
  return (
    <>
      <PageHeader 
        title="Koleksiyonlar" 
        description="Editörlerimiz tarafından özenle derlenen tematik koleksiyonları keşfedin."
      />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-20 bg-surface-white rounded-lg border border-border-subtle">
          <span className="material-symbols-outlined text-6xl text-border-subtle mb-4">collections</span>
          <h3 className="text-xl font-semibold text-text-charcoal mb-2">Koleksiyonlar Hazırlanıyor</h3>
          <p className="text-text-secondary mb-6 max-w-md mx-auto">
            Küratörlerimiz sizin için özel tematik koleksiyonlar oluşturuyor. Yakında burada olacaklar!
          </p>
          <Link 
            href="/kesfet" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-md transition-colors"
          >
            Eserleri Keşfet
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
        </div>
      </div>
    </>
  );
}
