"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

/**
 * Redirect /sanatci/[slug] to /sanatsever/[username]
 * This maintains backward compatibility while using unified profile routes
 */
export default function SanatciRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  useEffect(() => {
    // Redirect to unified profile route
    router.replace(`/sanatsever/${slug}`);
  }, [slug, router]);

  // Show loading state during redirect
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-text-secondary">Yönlendiriliyor...</p>
      </div>
    </div>
  );
}
