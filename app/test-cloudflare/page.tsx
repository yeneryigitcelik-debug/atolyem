/**
 * Cloudflare Images Test Sayfası
 * Bu sayfa Cloudflare Images yapılandırmasını test etmek için kullanılır
 * 
 * Kullanım: http://localhost:3000/test-cloudflare
 */

"use client";

import { useState } from "react";
import Image from "next/image";

export default function TestCloudflarePage() {
  const [testUrl, setTestUrl] = useState("");
  const [imageId, setImageId] = useState("");
  const [variant, setVariant] = useState("public");
  const [accountHash] = useState(process.env.NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_HASH || "5uHlQDyzeO-VZtA207nD0w");

  const buildUrl = () => {
    if (imageId) {
      const url = `https://imagedelivery.net/${accountHash}/${imageId}/${variant}`;
      setTestUrl(url);
      return url;
    }
    return "";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-3xl font-bold text-gray-900">Cloudflare Images Test</h1>

        {/* Yapılandırma Bilgileri */}
        <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Yapılandırma</h2>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Account Hash:</span>{" "}
              {accountHash ? (
                <span className="text-green-600">{accountHash.substring(0, 20)}...</span>
              ) : (
                <span className="text-red-600">EKSIK - NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_HASH</span>
              )}
            </div>
            <div>
              <span className="font-medium">Varsayılan Variant:</span> {variant}
            </div>
          </div>
        </div>

        {/* URL Oluşturucu */}
        <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">URL Test</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cloudflare Image ID
              </label>
              <input
                type="text"
                value={imageId}
                onChange={(e) => setImageId(e.target.value)}
                placeholder="Örn: abc123def456"
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              />
              <p className="mt-1 text-xs text-gray-500">
                Cloudflare Images panelinden bir görselin ID'sini buraya yapıştırın
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Variant
              </label>
              <select
                value={variant}
                onChange={(e) => setVariant(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="public">public</option>
                <option value="thumbnail">thumbnail</option>
                <option value="avatar">avatar</option>
              </select>
            </div>
            <button
              onClick={buildUrl}
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              URL Oluştur
            </button>
          </div>
        </div>

        {/* Test Sonuçları */}
        {testUrl && (
          <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">Test Sonuçları</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Oluşturulan URL
                </label>
                <div className="rounded-md border border-gray-300 bg-gray-50 p-3 text-sm break-all">
                  {testUrl}
                </div>
                <a
                  href={testUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-sm text-blue-600 hover:underline"
                >
                  Tarayıcıda aç →
                </a>
              </div>

              {/* Next.js Image ile Test */}
              <div>
                <h3 className="mb-2 text-lg font-medium">Next.js Image Component ile Test</h3>
                <div className="relative h-64 w-64 overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                  <Image
                    src={testUrl}
                    alt="Test görsel"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              </div>

              {/* Düz img Tag ile Test */}
              <div>
                <h3 className="mb-2 text-lg font-medium">Düz &lt;img&gt; Tag ile Test</h3>
                <div className="relative h-64 w-64 overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={testUrl}
                    alt="Test görsel"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      console.error("img tag error:", e);
                      alert("Görsel yüklenemedi! URL'yi kontrol edin.");
                    }}
                    onLoad={() => {
                      console.log("img tag loaded successfully!");
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Talimatlar */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
          <h2 className="mb-4 text-xl font-semibold text-blue-900">Nasıl Test Edilir?</h2>
          <ol className="list-decimal space-y-2 pl-5 text-sm text-blue-800">
            <li>Cloudflare Images panelinden bir görselin ID'sini kopyalayın</li>
            <li>Yukarıdaki formu doldurup "URL Oluştur" butonuna tıklayın</li>
            <li>Oluşturulan URL'yi tarayıcıda açın - görsel görünüyorsa Cloudflare tarafı OK</li>
            <li>Next.js Image ve düz img tag testlerini kontrol edin</li>
            <li>Tarayıcı konsolunu (F12) açıp hata mesajlarını kontrol edin</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

