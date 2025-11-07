import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Header from "@/app/components/Header";

export default async function AkademiPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden" style={{ backgroundColor: '#FFF8F1' }}>
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 justify-center px-4 sm:px-8 md:px-12 lg:px-20 xl:px-40 py-5">
          <div className="layout-content-container flex w-full max-w-[1280px] flex-1 flex-col">
            <Header />

            <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <p className="text-lg text-[#897261] dark:text-[#a18a78]">Başlangıç Seviyesi Seramik Kiti</p>
              <h2 className="text-5xl md:text-7xl font-bold mt-2">İçindeki Sanatçıyı Keşfet</h2>
            </div>
            <div
              className="w-full h-96 md:h-[500px] rounded-xl bg-cover bg-center"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuACxSnAVomegltUbEhs3l2J7li-Dpn4c6JCv7vvGXsmB_8rx83eczwiTaq_7M_7hCNsqxlylAO6VwbsW8b_D_erpzOM6GGbstRnbQgXZ8tJBrU-ywx2xRXDIrhxENQXPFT0WHtqFlzXE8IYn4nDfG04s7tjcX9kDgNdqbMcQZr65BhljRiWB3DU6pk4_eCP60UCbpfO3QYbZ_G5M4N8rA5-StQheEQX64cv0Hat0a0JVn0Hcv7cquI58WFUiwJaGldTs_XvpLfk0lg3")',
              }}
            ></div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 md:py-24 bg-[#f4f2f0] dark:bg-[#3a2a1c]">
          <div className="container mx-auto px-6">
            <h3 className="text-3xl md:text-4xl font-bold text-center mb-12">Nasıl Çalışır?</h3>
            <div className="grid md:grid-cols-3 gap-12 text-center">
              <div className="flex flex-col items-center">
                <div className="bg-[#ec6d13]/20 dark:bg-[#ec6d13]/30 p-4 rounded-full mb-4">
                  <svg className="w-6 h-6 text-[#ec6d13]" fill="currentColor" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
                    <path d="M223.68,66.15,135.68,18a15.88,15.88,0,0,0-15.36,0l-88,48.17a16,16,0,0,0-8.32,14v95.64a16,16,0,0,0,8.32,14l88,48.17a15.88,15.88,0,0,0,15.36,0l88-48.17a16,16,0,0,0,8.32-14V80.18A16,16,0,0,0,223.68,66.15ZM128,32l80.35,44L178.57,92.29l-80.35-44Zm0,88L47.65,76,81.56,57.43l80.35,44Zm88,55.85h0l-80,43.79V133.83l32-17.51V152a8,8,0,0,0,16,0V107.56l32-17.51v85.76Z"></path>
                  </svg>
                </div>
                <h4 className="text-xl font-bold mb-2">1. Kitini Al</h4>
                <p className="text-[#897261] dark:text-[#a18a78]">Get Your Kit</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-[#ec6d13]/20 dark:bg-[#ec6d13]/30 p-4 rounded-full mb-4">
                  <svg className="w-6 h-6 text-[#ec6d13]" fill="currentColor" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
                    <path d="M216,40H40A16,16,0,0,0,24,56V168a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm-92.44,78.66-48,32A8,8,0,0,1,64,144V80a8,8,0,0,1,12.44-6.66l48,32a8,8,0,0,1,0,13.32Z"></path>
                  </svg>
                </div>
                <h4 className="text-xl font-bold mb-2">2. Videoyla Öğren</h4>
                <p className="text-[#897261] dark:text-[#a18a78]">Learn with Video</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-[#ec6d13]/20 dark:bg-[#ec6d13]/30 p-4 rounded-full mb-4">
                  <svg className="w-6 h-6 text-[#ec6d13]" fill="currentColor" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
                    <path d="M232,96a7.89,7.89,0,0,0-.3-2.2L217.35,43.6A16.07,16.07,0,0,0,202,32H54A16.07,16.07,0,0,0,38.65,43.6L24.31,93.8A7.89,7.89,0,0,0,24,96v16a40,40,0,0,0,16,32v64a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V144a40,40,0,0,0,16-32ZM54,48H202l11.42,40H42.61ZM200,208H56V151.2a40.57,40.57,0,0,0,8,.8,40,40,0,0,0,32-16,40,40,0,0,0,64,0,40,40,0,0,0,32,16,40.57,40.57,0,0,0,8-.8Z"></path>
                  </svg>
                </div>
                <h4 className="text-xl font-bold mb-2">3. Atölyem'de Sat</h4>
                <p className="text-[#897261] dark:text-[#a18a78]">Sell on Atölyem</p>
              </div>
            </div>
          </div>
        </section>

        {/* Kit Contents Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
            <div
              className="w-full aspect-square rounded-xl bg-cover bg-center"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAjo16uLscvESWK30hhCsKT41pOJWXHSQSGevaSee3xKMO0zmPWJfqamilFa-F8urhOh2rstdrugb4jEr5vHljps608TAyhfik1471mB75WLNs0Lm8ZWVxmPsUQ7g6LvcUcQLbKA6tj4DBJqErsP774ySd7LN0fa_vGStU0AYZctDKM4xEvDqNlEIO2wYb-_SQ9jmDjJ7irKlUd3i-cfc54WGDBSeP6ChTOfozS-70wF_0FUrfnbSEJbcyRHp4ZwbioF9Ltk8OYS3Fg")',
              }}
            ></div>
            <div>
              <h3 className="text-3xl md:text-4xl font-bold mb-6">Kit İçeriği</h3>
              <ul className="space-y-3 text-lg text-[#897261] dark:text-[#a18a78]">
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-[#ec6d13]/50"></span>
                  Clay
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-[#ec6d13]/50"></span>
                  Tools
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-[#ec6d13]/50"></span>
                  Glazes
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-[#ec6d13]/50"></span>
                  Brushes
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-[#ec6d13]/50"></span>
                  Instructions
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-[#f4f2f0] dark:bg-[#3a2a1c] py-12">
          <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <p className="text-[#897261] dark:text-[#a18a78]">Price</p>
              <p className="text-4xl font-bold">$49.99</p>
            </div>
            <button className="w-full md:w-auto bg-[#ec6d13] text-white text-lg font-bold px-10 py-4 rounded-xl hover:opacity-90 transition-opacity">
              Hemen Başla
            </button>
          </div>
        </section>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

