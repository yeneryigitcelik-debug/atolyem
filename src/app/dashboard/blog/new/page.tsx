"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

const CATEGORIES = [
  "Rehber",
  "Röportaj",
  "Trend",
  "Bakım",
  "Dekorasyon",
  "Topluluk",
  "Teknik",
  "İlham",
];

export default function NewBlogPostPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  const handleSubmit = async (publishStatus: "DRAFT" | "PUBLISHED") => {
    if (!title.trim() || !content.trim()) {
      setError("Başlık ve içerik gereklidir.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/blog", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          excerpt: excerpt.trim() || null,
          coverImageUrl: coverImageUrl.trim() || null,
          category: category || null,
          status: publishStatus,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Yazı oluşturulamadı");
      }

      const data = await response.json();
      
      if (publishStatus === "PUBLISHED") {
        router.push(`/blog/${data.post.slug}`);
      } else {
        router.push("/dashboard/blog");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    router.push("/hesap?redirect=/dashboard/blog/new");
    return null;
  }

  return (
    <div className="min-h-screen bg-background-ivory">
      {/* Header */}
      <div className="bg-surface-white border-b border-border-subtle sticky top-0 z-10">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/blog"
                className="p-2 hover:bg-background-ivory rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </Link>
              <h1 className="text-xl font-bold text-text-charcoal">Yeni Blog Yazısı</h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className={`px-4 py-2 border rounded-lg font-medium text-sm transition-colors ${
                  previewMode
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border-subtle text-text-charcoal hover:border-primary"
                }`}
              >
                <span className="material-symbols-outlined text-[18px] mr-1 align-middle">
                  {previewMode ? "edit" : "visibility"}
                </span>
                {previewMode ? "Düzenle" : "Önizle"}
              </button>
              <button
                onClick={() => handleSubmit("DRAFT")}
                disabled={submitting}
                className="px-4 py-2 border border-border-subtle text-text-charcoal hover:border-primary rounded-lg font-medium text-sm transition-colors"
              >
                Taslak Kaydet
              </button>
              <button
                onClick={() => handleSubmit("PUBLISHED")}
                disabled={submitting}
                className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">publish</span>
                    Yayınla
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Editor */}
          <div className="lg:col-span-2">
            {previewMode ? (
              <div className="bg-surface-white rounded-xl border border-border-subtle p-8">
                <h1 className="text-3xl font-bold text-text-charcoal mb-4">{title || "Başlık"}</h1>
                {excerpt && <p className="text-text-secondary text-lg mb-6">{excerpt}</p>}
                {coverImageUrl && (
                  <div className="aspect-video rounded-lg overflow-hidden mb-8">
                    <img src={coverImageUrl} alt={title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="prose prose-lg max-w-none">
                  {content.split('\n\n').map((p, i) => (
                    <p key={i} className="text-text-secondary mb-4">{p}</p>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-text-charcoal mb-2">
                    Başlık <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Yazınız için dikkat çekici bir başlık..."
                    className="w-full px-4 py-3 border border-border-subtle rounded-lg focus:outline-none focus:border-primary text-lg font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-charcoal mb-2">
                    Özet
                  </label>
                  <textarea
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="Kısa bir özet (opsiyonel, otomatik oluşturulabilir)..."
                    rows={2}
                    className="w-full px-4 py-3 border border-border-subtle rounded-lg focus:outline-none focus:border-primary resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-charcoal mb-2">
                    İçerik <span className="text-red-500">*</span>
                  </label>
                  <div className="border border-border-subtle rounded-lg overflow-hidden">
                    <div className="bg-surface-warm border-b border-border-subtle px-4 py-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setContent(content + "**kalın**")}
                        className="p-1.5 hover:bg-surface-white rounded text-text-secondary hover:text-text-charcoal"
                        title="Kalın"
                      >
                        <span className="material-symbols-outlined text-[18px]">format_bold</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setContent(content + "*italik*")}
                        className="p-1.5 hover:bg-surface-white rounded text-text-secondary hover:text-text-charcoal"
                        title="İtalik"
                      >
                        <span className="material-symbols-outlined text-[18px]">format_italic</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setContent(content + "\n\n## Başlık\n\n")}
                        className="p-1.5 hover:bg-surface-white rounded text-text-secondary hover:text-text-charcoal"
                        title="Başlık"
                      >
                        <span className="material-symbols-outlined text-[18px]">title</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setContent(content + "\n\n> Alıntı metni\n\n")}
                        className="p-1.5 hover:bg-surface-white rounded text-text-secondary hover:text-text-charcoal"
                        title="Alıntı"
                      >
                        <span className="material-symbols-outlined text-[18px]">format_quote</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setContent(content + "\n\n- Liste öğesi\n- Liste öğesi\n\n")}
                        className="p-1.5 hover:bg-surface-white rounded text-text-secondary hover:text-text-charcoal"
                        title="Liste"
                      >
                        <span className="material-symbols-outlined text-[18px]">format_list_bulleted</span>
                      </button>
                    </div>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Yazınızı buraya yazın... Markdown formatını kullanabilirsiniz."
                      rows={20}
                      className="w-full px-4 py-3 focus:outline-none resize-none"
                    />
                  </div>
                  <p className="text-xs text-text-secondary mt-2">
                    Markdown formatı desteklenir: **kalın**, *italik*, ## başlık, &gt; alıntı, - liste
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-surface-white rounded-xl border border-border-subtle p-6 space-y-6 sticky top-24">
              <div>
                <label className="block text-sm font-medium text-text-charcoal mb-2">
                  Kapak Resmi URL
                </label>
                <input
                  type="url"
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 border border-border-subtle rounded-lg focus:outline-none focus:border-primary text-sm"
                />
                {coverImageUrl && (
                  <div className="mt-2 aspect-video rounded-lg overflow-hidden bg-background-ivory">
                    <img
                      src={coverImageUrl}
                      alt="Kapak önizleme"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-charcoal mb-2">
                  Kategori
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 border border-border-subtle rounded-lg focus:outline-none focus:border-primary text-sm bg-white"
                >
                  <option value="">Kategori seçin...</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 border-t border-border-subtle">
                <h3 className="font-medium text-text-charcoal mb-3">Yazım İpuçları</h3>
                <ul className="space-y-2 text-sm text-text-secondary">
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[16px] mt-0.5 text-primary">check</span>
                    Dikkat çekici bir başlık kullanın
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[16px] mt-0.5 text-primary">check</span>
                    Paragrafları kısa tutun
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[16px] mt-0.5 text-primary">check</span>
                    Görsel kullanmayı unutmayın
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[16px] mt-0.5 text-primary">check</span>
                    Alt başlıklarla bölümlendirin
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



