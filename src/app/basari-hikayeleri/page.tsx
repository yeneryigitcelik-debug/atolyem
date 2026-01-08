import PageHeader from "@/components/ui/PageHeader";
import Link from "next/link";

const stories = [
  {
    name: "Sinem Demirtaş",
    specialty: "Ressam",
    quote: "Atölyem.net sayesinde eserlerim Türkiye'nin dört bir yanındaki sanat severlere ulaştı. İlk yılımda 50'den fazla eser sattım.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    slug: "sinem-demirtas",
  },
  {
    name: "Mehmet Demir",
    specialty: "Seramik",
    quote: "Platform sayesinde hobimi profesyonel bir kariyere dönüştürdüm. Artık tam zamanlı sanatçıyım.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    slug: "mehmet-demir",
  },
  {
    name: "Fatma Çelik",
    specialty: "Tekstil",
    quote: "Geleneksel dokuma tekniklerimi modern tasarımlarla buluşturdum. Atölyem.net bu hikayeyi anlatmamı sağladı.",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop",
    slug: "fatma-celik",
  },
];

export default function BasariHikayeleriPage() {
  return (
    <>
      <PageHeader 
        title="Başarı Hikayeleri" 
        description="Atölyem.net'te hayallerini gerçeğe dönüştüren sanatçıların hikayeleri."
      />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-12">
          {stories.map((story, i) => (
            <div key={i} className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${i % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
              <div className={`${i % 2 === 1 ? 'lg:order-2' : ''}`}>
                <div className="aspect-[4/3] rounded-lg overflow-hidden">
                  <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url('${story.image}')` }} />
                </div>
              </div>
              <div className={`${i % 2 === 1 ? 'lg:order-1' : ''}`}>
                <span className="text-primary font-medium text-sm">{story.specialty}</span>
                <h2 className="text-2xl font-bold text-text-charcoal mt-2 mb-4">{story.name}</h2>
                <blockquote className="text-xl text-text-secondary italic leading-relaxed mb-6">
                  &quot;{story.quote}&quot;
                </blockquote>
                <Link href={`/sanatsever/${story.slug}`} className="inline-flex items-center text-primary font-medium hover:underline">
                  Sanatçıyı İncele
                  <span className="material-symbols-outlined ml-1 text-base">arrow_forward</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <section className="bg-primary py-16 mt-12">
        <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Sıradaki başarı hikayesi sizin olsun</h2>
          <p className="text-white/80 mb-8">Eserlerinizi binlerce sanat severle buluşturmaya bugün başlayın.</p>
          <Link href="/sanatci-ol" className="inline-flex px-8 py-3 bg-white text-primary font-semibold rounded-md hover:bg-gray-100 transition-colors">
            Sanatçı Ol
          </Link>
        </div>
      </section>
    </>
  );
}


