import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-background-ivory border-t border-border-subtle pt-16 pb-8">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">
          {/* Brand / Newsletter */}
          <div className="lg:col-span-2 pr-0 lg:pr-12">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-text-charcoal text-3xl">palette</span>
              <h2 className="text-text-charcoal text-2xl font-bold tracking-tight">Atölyem.net</h2>
            </Link>
            <p className="text-text-secondary mb-6 text-sm">
              Sanatın ve el emeğinin değerini bilenler için oluşturulmuş, küratöryel bir pazar yeri. En yeni eserlerden haberdar olmak için bültenimize katılın.
            </p>
            <form className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="E-posta adresiniz"
                className="w-full px-4 py-2.5 bg-surface-white border border-border-subtle rounded-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm text-text-charcoal"
              />
              <button
                type="button"
                className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white font-medium rounded-md transition-colors text-sm whitespace-nowrap"
              >
                Kayıt Ol
              </button>
            </form>
          </div>

          {/* Column 1 */}
          <div>
            <h5 className="text-text-charcoal font-bold mb-4">Keşfet</h5>
            <ul className="flex flex-col gap-2.5 text-sm text-text-secondary">
              <li><Link href="/kesfet" className="hover:text-primary transition-colors">Editörün Seçimi</Link></li>
              <li><Link href="/yeni-gelenler" className="hover:text-primary transition-colors">Yeni Gelenler</Link></li>
              <li><Link href="/sanatcilar" className="hover:text-primary transition-colors">Sanatçılar</Link></li>
              <li><Link href="/hediye-rehberi" className="hover:text-primary transition-colors">Hediye Rehberi</Link></li>
              <li><Link href="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
            </ul>
          </div>

          {/* Column 2 */}
          <div>
            <h5 className="text-text-charcoal font-bold mb-4">Satıcı</h5>
            <ul className="flex flex-col gap-2.5 text-sm text-text-secondary">
              <li><Link href="/sanatci-ol" className="hover:text-primary transition-colors">Sanatçı Ol</Link></li>
              <li><Link href="/satici-paneli" className="hover:text-primary transition-colors">Satıcı Paneli</Link></li>
              <li><Link href="/satis-kurallari" className="hover:text-primary transition-colors">Satış Kuralları</Link></li>
              <li><Link href="/basari-hikayeleri" className="hover:text-primary transition-colors">Başarı Hikayeleri</Link></li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h5 className="text-text-charcoal font-bold mb-4">Kurumsal</h5>
            <ul className="flex flex-col gap-2.5 text-sm text-text-secondary">
              <li><Link href="/hakkimizda" className="hover:text-primary transition-colors">Hakkımızda</Link></li>
              <li><Link href="/iletisim" className="hover:text-primary transition-colors">İletişim</Link></li>
              <li><Link href="/kariyer" className="hover:text-primary transition-colors">Kariyer</Link></li>
              <li><Link href="/gizlilik" className="hover:text-primary transition-colors">Gizlilik Politikası</Link></li>
              <li><Link href="/yardim" className="hover:text-primary transition-colors">Yardım Merkezi</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border-subtle flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-text-secondary text-center md:text-left">
            © {new Date().getFullYear()} Atölyem.net. Tüm hakları saklıdır.
          </p>
          <div className="flex gap-4">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-primary transition-colors">
              <span className="sr-only">Instagram</span>
              <svg aria-hidden="true" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 014.146 4.1c.636-.247 1.363-.416 2.427-.465C7.673 2.013 8.044 2 12.315 2zm-3.19 18.062c3.275 0 3.666-.013 4.945-.072 1.18-.055 1.821-.247 2.25-.413.567-.219.972-.48 1.396-.906.425-.424.687-.829.906-1.396.165-.429.358-1.07.413-2.25.059-1.279.072-1.67.072-4.945s-.013-3.666-.072-4.945c-.055-1.18-.247-1.821-.413-2.25-.219-.567-.48-.972-.906-1.396-.424-.425-.829-.687-1.396-.906-.429-.165-1.07-.358-2.25-.413-1.279-.059-1.67-.072-4.945-.072-3.275 0-3.666.013-4.945.072-1.18.055-1.821.247-2.25.413-.567.219-.972.48-1.396.906-.425.424-.687.829-.906 1.396-.165.429-.358 1.07-.413 2.25-.059 1.279-.072 1.67-.072 4.945s.013 3.666.072 4.945c.055 1.18.247 1.821.413 2.25.219.567.48.972.906 1.396.424.425.829.687 1.396.906.429.165 1.07.358 2.25.413 1.28.058 1.67.072 4.949.072l-.006.002zM12.315 7.006a4.996 4.996 0 014.996 4.996 4.996 4.996 0 01-4.996 4.996 4.996 4.996 0 01-4.996-4.996 4.996 4.996 0 014.996-4.996zM7.22 12.002a5.1 5.1 0 005.1 5.1 5.1 5.1 0 005.1-5.1 5.1 5.1 0 00-5.1-5.1 5.1 5.1 0 00-5.1 5.1zm12.63-6.66a1.2 1.2 0 11-2.4 0 1.2 1.2 0 012.4 0z" clipRule="evenodd" />
              </svg>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-primary transition-colors">
              <span className="sr-only">Twitter</span>
              <svg aria-hidden="true" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

