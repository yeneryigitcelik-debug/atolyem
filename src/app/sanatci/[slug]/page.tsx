"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

/**
 * Redirect /sanatci/[slug] to /atolye/[username]
 * This maintains backward compatibility while using the artist workshop page
 */
export default function SanatciRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  useEffect(() => {
    // Redirect to artist workshop page
    router.replace(`/atolye/${slug}`);
  }, [slug, router]);

  // Show loading state during redirect
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf9f7]">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-stone-500">Atölyeye yönlendiriliyor...</p>
      </div>
    </div>
  );
}
