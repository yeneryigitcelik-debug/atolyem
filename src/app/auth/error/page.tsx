import Link from "next/link";

export default function AuthErrorPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-red-600 text-3xl">error</span>
        </div>
        <h1 className="text-2xl font-bold text-text-charcoal mb-2">Kimlik Doğrulama Hatası</h1>
        <p className="text-text-secondary mb-8">
          Giriş işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/hesap"
            className="px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-md transition-colors"
          >
            Tekrar Dene
          </Link>
          <Link
            href="/"
            className="px-6 py-3 bg-surface-white border border-border-subtle text-text-charcoal hover:border-primary hover:text-primary font-semibold rounded-md transition-colors"
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    </div>
  );
}
