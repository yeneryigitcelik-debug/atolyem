export default function Home() {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden">
      {/* Üst bar */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-primary/20 dark:border-primary/30 px-10 py-4">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <svg className="text-primary size-6" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path clipRule="evenodd" d="M24 4H6V17.3333V30.6667H24V44H42V30.6667V17.3333H24V4Z" fill="currentColor" fillRule="evenodd"></path>
            </svg>
            <h2 className="text-xl font-bold tracking-tight text-black dark:text-white">Atölyem.net</h2>
          </div>

          {/* Menü */}
          <nav className="flex items-center gap-8">
            <a className="text-base font-medium text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white" href="#">Keşfet</a>
            <a className="text-base font-medium text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white" href="#">Koleksiyonlar</a>
            <a className="text-base font-medium text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white" href="#">Atölye Başla</a>
          </nav>
        </div>

        {/* Sağ taraf: arama + ikonlar */}
        <div className="flex flex-1 items-center justify-end gap-4">
          <label className="relative flex min-w-40 max-w-sm flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-black/40 dark:text-white/40">
              {/* Arama ikonu */}
              <svg fill="currentColor" height="20" viewBox="0 0 256 256" width="20" xmlns="http://www.w3.org/2000/svg">
                <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
              </svg>
            </div>
            <input
              className="w-full rounded-lg border-none bg-primary/10 py-2.5 pl-10 pr-4 text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Search"
            />
          </label>

          {/* Profil/ikon butonları */}
          <button className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-primary/10 text-black dark:text-white dark:bg-primary/20">
            <svg fill="currentColor" height="20" viewBox="0 0 256 256" width="20" xmlns="http://www.w3.org/2000/svg">
              <path d="M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,1,0,13.85-8ZM72,96a56,56,0,1,1,56,56A56.06,56.06,0,0,1,72,96Z"></path>
            </svg>
          </button>

          {/* Avatar */}
          <div
            className="size-10 rounded-full bg-cover bg-center"
            style={{
              backgroundImage:
                'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBebdr7Uxb4z_HjNo4Eyakxx3Wrqc5EO9F49zqDHGvm1KclEDx2NxHkaFA0JAqnsm8eLC_eSHWO3jp_xcSAUhDOPXF5opSOkiAgJq7I7nTF9KgOBIhwirsPDIAM7jjSe1lDyb2OBTCrL426fFMyK4XpbeI0OLXyv3ZUbW34-5QKEPhiFwXPCPujks60lSQVGaFQNAICTRTJED4eCOtJK-QUEK9JPJaHE4kK3ff7vgZG-osodrlG5XZtrlv6LAin6jfw8QvlepXQZS0H")',
            }}
          />
        </div>
      </header>

      {/* İçerik */}
      <main className="flex flex-1 justify-center py-12">
        <div className="w-full max-w-7xl px-8">

          {/* Hero */}
          <div className="relative mb-16 h-[500px] w-full overflow-hidden rounded-xl">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDCOnz737NEQFDNcnTl-rhHzFW-GpuPK1EusseXf-IrP5QVJSo_65VY6uipbteZlzvF5gtA7eeRWxGfZjWybM3_7gzPXkzOkpPSf80jWi8kIgkOXcYGRWJPCmkZKwm4yKrugdwj98I89-nD1KKvRaHcP2k-Cjxb4XghMqqHRkJzUFhsV917DLgZyz9rBqaJqOvT4W-uiO8haOqFMId5zczSiVq1aya7mJchlCGrAeKafmPzkVJmj8VJL23OxS-chwZspOq3uz5Z1ExL")',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 p-12">
              <h1 className="font-display text-6xl font-bold text-white">Her Eserde Bir Hikaye</h1>
            </div>
          </div>

          {/* Atölye Başla Kitleri */}
          <section className="mb-16">
            <h2 className="font-display mb-6 text-4xl font-bold text-black dark:text-white">
              Yaratıcılığa İlk Adım: Atölye Başla Kitleri
            </h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {[
                {
                  title: "Başlangıç Seti: Modern Tuval",
                  desc: "Akrilik boya ve fırçalarla ilk eserinizi yaratın.",
                  url:
                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCyIOAJKGNdykZvYWGLtfggi4YV68Lm3HyWl7x3b2hPFFBEuGgLv8zyq48wfdp7oGJw7xgv5Y-RrL1vfd9eT5b2I-jxkLvnqP36EwFOR7EgFXSrGB6kNFABSSFFrVKGow4XxkNsIbKj3jarpPkN7IDaqx0Vac7O1FPsJ4vXEvaexlnbqzbzmrgbInYC1Bfe5CsdFItlQvPMEcpT6GNJVUc6AT63CnjJN-C4DF9-Am1OLnCGdN6jh35NknXbM6DKNUaH0vwiX4CjCFvp")',
                },
                {
                  title: "Seramik Modelleme Kiti",
                  desc: "Kendi ellerinizle şekil verin, fırınlamaya hazır.",
                  url:
                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAQUnqktBfDRsCuvYmPLdZFvwAR2w8bO-MIrL_PuIldipoiaDKm-bl0IzxaNgBm-iYHQLTgh6OloiwgUkn2GmnmSQPtAW6YkepeRJvTC3WHf_5kct5HnKN52Pd7mboVc8rk2xxFSKJ0-Y5hzJvBZI24PojT1kqqhySaITJkUCtH_66q09ETEItYhS7LARgXbCy46RY88C7aYyuiEBLnQoCQiIrW9RzDUk9iU-iL4cXekzS-nEWCAMioac8UMYMSK5eKxMKJWCf5G6Tm")',
                },
                {
                  title: "Ahşap Oyma Başlangıç Seti",
                  desc: "Doğal ahşabı sanat eserine dönüştürün.",
                  url:
                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBaKFW8bb6jGJUny_juwF3nA-xraiamtJYvA8RaGBbmIMqlyz5_vYVBSrbf-lwqjGTMzuLFhhUz829rZdfeeAwdbxdPqem26NHvM7vbYoD78XjFRdcE6sL0C72m_CYtkbjDTvDEiU2KOTNEQAQWxDN07HLY2OHS3XxC5ApMxj3f-CHOnWCHBxTvsm2xIHM6EPZ4zMCpC5D3gK8D5p54nzR1fWMHCC7bJUc4tho6dD56JgvUJh8Jx_41C6DBeaGf6EjcaumLBIGePpGz")',
                },
              ].map((c) => (
                <div key={c.title} className="group flex flex-col gap-4">
                  <div
                    className="aspect-[4/3] w-full overflow-hidden rounded-lg bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                    style={{ backgroundImage: c.url }}
                  />
                  <div>
                    <p className="text-lg font-medium text-black dark:text-white">{c.title}</p>
                    <p className="text-base text-black/60 dark:text-white/60">{c.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Koleksiyonlar */}
          <section className="mb-16">
            <h2 className="font-display mb-6 text-4xl font-bold text-black dark:text-white">Koleksiyonlar</h2>
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {[
                {
                  title: "Duvar Sanatı & Tablolar",
                  url:
                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuD_qO3YKhtMMNed6PcKvtcd2DoHx1hqrFhkZKPEKsjrsjSZDjDSCy-MoAXBPU4AqY_sVYksYelf0Jkq3KnP9VjC4tq9YssO2DhqepYQ6cB8wOzd4KZjVZ3uYP8BUgAqJelGUOf1J_bsjXU-fPHOxfF-Os7SR2Yi--U_75uRGqtSrpEFVUXDCTh2jejcAZwsohYR2LQs3b5m4_jcfEu3c9KfjPTM4EP9-TxuHkM9wwbinpFntM61ehWM6q8icta-4BpGDM-_oAP5bJ5X")',
                },
                {
                  title: "Seramik & Porselen",
                  url:
                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDE7FU9AN0asYCR7D-zqJQi7w9bRGR3ZlHiQxIcYfa1Ltgb5MpxaINVrHj0Sjze7riK7ITMySYRIu0gYP3s03boGwsg9I8jqNO2VIGxvzESIb0cN5ATIoztmHAiB9NIjlbUqMiJ5HLZP_vRr-S4Dp5uYNAbBPCEQ0cMncQrPUCdSczVbAjoGZK7PDPDyxsTCh7dNMz-VwHJ3_4hzka6bzxaiTD96G7tar_IXDOuzo02yTQyl-LVnszMgUOWEw0fF_1vuj0eAB9II4b5")',
                },
                {
                  title: "Tekstil & Dokuma",
                  url:
                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBU16Ys0CVnhJ32WEy82y31BptBFcWBVoaovGZRPOjG43XBwR-DK8BKXSZ84DdOuMaBN0Y4VzpIqUywBkEoyZYRbF6oQdiJS9r9S3JD_bF-SAQXo4EcuII4_YzcqKdLUvYPtyIJD2Do0zukoGSwdpWYtJu00oaxv0wyAVaAzb5iLteW6aYrB4vtW5qSCpdi9f7v6dnrz2YirMfcdkEot1bRnLHafCfbuWEzbrORp8916_kb1bChw9rzipwlzGuSiaRgDL7G5N4ED2-R")',
                },
                {
                  title: "Ahşap & Oyma",
                  url:
                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDiCB28J-T7Xl88wm3tJh5oEY_T-kvY6NyoHIqLlTEeDo_pbEhv8TxZfCvwNlhxj7q8pjVYQImK0pfJRDAc0fa4xrmMJXqj3XadDsnr4t5ufXCZPuQ020mXjxfooIz16sXimKsb4TfsJZNPaqoFk1d2fBf8RJN3MWTg-z7BkNtSLMmmlsRuuwJrhvGWDjRMc650xQ0xxUBQu80MTpfmnT00JZ4-LnsgCO0XdNRcIP3S1BhKc_73fL-f-UkcaXpVDGgpoQPXT9Ji-RPg")',
                },
              ].map((k) => (
                <div key={k.title} className="group relative flex flex-col overflow-hidden rounded-lg">
                  <div className="aspect-square w-full bg-cover bg-center transition-transform duration-300 group-hover:scale-105" style={{ backgroundImage: k.url }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <p className="absolute bottom-0 p-4 text-lg font-medium text-white">{k.title}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Öne çıkan sanatçılar */}
          <section className="mb-16">
            <h2 className="font-display mb-8 text-4xl font-bold text-black dark:text-white">Öne Çıkan Sanatçılar</h2>
            <div className="flex justify-center gap-12 overflow-x-auto pb-4">
              {[
                { name: "Elif Özdemir", tag: "Resim", url: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBOqHrvrMnaibgLmNLx31G_C86tjSAN9cH8xTgeX8aM2v8MYziBriYluBbj6Cu6a_ipICc5Q_hrj4PT9v1VOaupByQ0i2evOCEqnf1mGiygBPyp-73MNUAE6X8_IZWxbh5j_MQbCMugzhpvDjjdsYS8kSUtk2KbEPhp9ARzWKJqXC_7No10odwXaS5K18A3gRV6ciAFVT1ChwjS9qcwBRCGEo8yJb_U91iQmTGnyiJRZ5teaEaYws-vNNx3YqgTZO5Ow5x8_fOj9zdJ")' },
                { name: "Can Yılmaz", tag: "Seramik", url: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCt17mzrXvH46c1resxcoTRkRn0dygb73Z1V0oC1kUWf5f0QwsVlYEyInGeoSCuyXOZwjVItCU_8lh5lQPLXr8MjYhSYzFhJKkMTHvaqFPUrNgcpMULG9Zn6ktS6QL654pJMo5S2q9i8noEUF6pcHbBoqNQl87mhe-EKImEFqIRcEnCt94IkOs1WYugRS7-YqnjNtcVk5-XvRTx0qPHI841_zmZUmdmzicpehNkL4gQtO81CBxJoGGUFP4jOTA_-1q1p00Aw_aiwBx6")' },
                { name: "Ayşe Kaya", tag: "Tekstil", url: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCZCP4ml4tw49ArbE1nIz1fMaayBFpXTCqGvmwl_blbqdeEKcvNemqX0KReE58kdywTi-hz0bs235tT8HgHLuOTqcH7iy5qeGvv6uRaN3AU_e479AXGjjVhuyAwuYE1yUZ7oKPlqsqRfeECyvRmvhJwCKhzRoQ_3d1Hirmny71p9su81O0ifsp-WAIz5ObHGd2_ScLRrJtaUV8IEGGcDav2jJZTY7QkJ8FQNMwe8qriLC_QXc1pf7s4JK6RqJrQk72x8GZN1NrDIIua")' },
                { name: "Mehmet Demir", tag: "Ahşap", url: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBQImyFvKGhF3uEkLlcR6Y-RMClYA4qoE3eodWTdBrxMZxb3dTJkl9IItwOONlC-ol9hTQ8U53QJ3DNtQZmJmNK3WSDmlKMr9LRKvdP9zHzWtT-gZ-_u-7GssrGYoxEkBjRA1xYxWWhR7TyTVkhSjFp0jI0_MYdM1FZ6k12VLgwFzZJW01yCHky9eaEuU5zwhvKP9L940SxvKDlyOZjROQoa0azZpE1LGfNGvKXuEzw4HGyC5Zn4v45_ztSzbOmenBwkptZ9RjY08et")' },
                { name: "Zeynep Arslan", tag: "Cam Sanatı", url: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDYGoeKnlrtjUd3rHZ0HW1gwQpX9xWgtKoZAyoE5VBv2PJBySx78uiWvmgmML9AaJLzLy4b4uENEpLv5k6PmCRWrWH3u9dB4yBTTmx1ex1yvANz-34STkjpiQLMuP-W5EtwEVq_HSpT2osof0MSPxANpjl8IRqQ_itqYsRsXZ7t-NgW6UvDAwemjaRyS3iOWkw5VLcQ5UeOpNuFt7wSO1x3bgzSJGmtgHWj0Z8G3VNrkrsXcp1xzUg5WNWYk3GD7Ur9RM_UUqEnrITH")' },
              ].map((a) => (
                <div key={a.name} className="flex flex-shrink-0 flex-col items-center gap-4 text-center">
                  <div className="size-32 rounded-full bg-cover bg-center" style={{ backgroundImage: a.url }} />
                  <div>
                    <p className="text-lg font-medium text-black dark:text-white">{a.name}</p>
                    <p className="text-base text-black/60 dark:text-white/60">{a.tag}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Yeni Eklenenler */}
          <section>
            <h2 className="font-display mb-6 text-4xl font-bold text-black dark:text-white">Yeni Eklenenler</h2>
            <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-4">
              {[
                { title: "Soyut Manzara", url: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBPOSeMp0ZAb287u_0eHNWbiSrrI23pheIThYglIh-tsd8AYuE3uC7em-j01IJ6418SxS3nOd7m2kedX277woGKU3BGLUTjKYeeVpiJR5JWiBuuUJs4hVTDOESQ4ZS059eAFPHJ31TCGKJqQzprYHRFWUWYX5mMc0_1ETLqs8tNSwW8HdJuNTAZQU0HgPZw4CaXJROUp51w-EU23hWovDxcNZwER35m0xFrMDWajVv4_CmBU7mEze4COSFUAwEZQDFUxy9UIkbmz89m")' },
                { title: "Geometrik Formlar", url: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDVDV4ZzTpS5B6uOgSIAdL7LjPwSGL4fUYlX_G302FO4_jCiHUGrRF2XUCQ583kGnvzxTFMCFQO-px9D-u9rU4lcJMDywD49SChoejkVY66HywkCJfL8MPJ5LhfDxhSUqnmn07p7yVfXOCZGXMgCq_csd_uoLZVtl-XXdnKtxFQFdWCJgHsvFjGfsLrCq3WmA0v4sL_c4pubJolXO4QQPQpL4UMUzivGakzhiqK3ti8ymPrqml9nw9lfVksKViE2TI2OpIBc4ynxPje")' },
                { title: "El Yapımı Seramik Kase", url: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuA7GbiiNOLHufjdWb0E96c_AfX2Sr2zE4mcVAHf9mFtzWaJmhD9uT4lTN213itoMwXrfJd2EKkqI2Bni6MgU_Sf5C7UNdgBHrj8W2c4oQrDoW30Zy6a0qCYSWdbXsHEAgwm1yML_QAQG7bbeeB10epIsczkLAeTKU4tm_GlSCN4OKPDI_oFUDcmVO8e8fi3az4__aZSR5_0MzOEd7vlBoqFdGAbPDZ5zb9yxURbnNXAxh_GgFwr7iv80RZkUjxgWoEQPCcR30Tqis6L")' },
                { title: "Dokuma Duvar Panosu", url: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBFOjNg4xF6UpyPtyg7XaME5efYF64yXkgQO6NZk-XXA_GgCXL970A6JRBCjwM6QICVx2Pvxn2ZY-gclhWFZofkQTr7L3B-GeKqRwuRwg5Iu6YxCtdXHmkPqL068jlHfZ4fp-uofue1EOccqpVIHnYl57fROFFfHXyFt1wCe816_gXIXFiN-WluQZmJIw3HEr-u6X0dUPjufAnsIF-_C6LMEa1gn5gBIk_N_xncf-qrMUV3fz3d6tLDi6RkAvJvstWbnZMvVSvjZTXc")' },
                { title: "Botanik Baskı", url: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCeirNPSuOHJgo_SJAoQHj02USXywyMqe6XGa9hZbEMuSKaYJcTFx8qYHuUKgCamxcEAyYshLcsyGl57mX1388psZDl88X-aenmk8w7HBbOR6jBoBZATlNxIM_txo5_hkrj5NHZ6CUCdcasbbmOMcsAoOqSzewQZgzUFeZYLkWSSqYD7VldJ2aarrF_aZr_Q80jWuEo8Q6aaV7No950yuTqge76wupSCtzP7BIZvecbpYmAoeHa-ddRI7gunrCl8oJ5-V0WXCxItVZJ")' },
                { title: "Ahşap Dekoratif Obje", url: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBO9V6hWBaYdXEZHDsC3-4oxkMDI-3IlZ0gUhk_b8XaYrgi7N1OeKf9Tvw_lQWElGleN74ZS5_wrkSkKuas7yVQyhlIOk4lHdxeJalJ9bwW84WXsXwWi1XW12djwAHaeY8W8W0CJUCwmSzjbVwMU4mu_ftLCku2sFBv2jTXyXF9CsnPN5M3GdBgENynIy2ieUrfVtVXIFqcopcRdPU6ysnXF8-TuQ8vTgl4Fsot-C3pOL6Han7VGtu_N6OMmIVuPeBk8rwgecGK3xPy")' },
              ].map((n) => (
                <div key={n.title} className="group flex flex-col gap-3">
                  <div className="aspect-square w-full overflow-hidden rounded-lg bg-cover bg-center transition-transform duration-300 group-hover:scale-105" style={{ backgroundImage: n.url }} />
                  <p className="text-lg font-medium text-black dark:text-white">{n.title}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}