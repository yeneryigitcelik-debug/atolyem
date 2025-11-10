"use client";

import { useState } from "react";
import DirectImageUploader from "@/app/components/DirectImageUploader";
import ProductImage from "@/app/components/ProductImage";

export default function TestDirectUploadPage() {
  const [uploadedImages, setUploadedImages] = useState<
    Array<{ id: string; url: string }>
  >([]);
  const [deleteStatus, setDeleteStatus] = useState<string>("");

  const handleUploadComplete = (imageId: string, imageUrl: string) => {
    setUploadedImages((prev) => [...prev, { id: imageId, url: imageUrl }]);
    setDeleteStatus("");
  };

  const handleUploadError = (error: string) => {
    setDeleteStatus(`Upload Error: ${error}`);
  };

  const handleDelete = async (imageId: string) => {
    try {
      const response = await fetch(`/api/images/${imageId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: "Delete failed",
        }));
        throw new Error(errorData.error || "Delete failed");
      }

      setUploadedImages((prev) => prev.filter((img) => img.id !== imageId));
      setDeleteStatus(`Image ${imageId} deleted successfully`);
    } catch (error: any) {
      setDeleteStatus(`Delete Error: ${error.message}`);
    }
  };

  return (
    <div className="container mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold">Cloudflare Direct Upload Test</h1>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">1. Upload Image</h2>
        <DirectImageUploader
          onUploadComplete={handleUploadComplete}
          onUploadError={handleUploadError}
        />
      </div>

      {deleteStatus && (
        <div
          className={`p-4 rounded ${
            deleteStatus.includes("Error")
              ? "bg-red-100 text-red-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {deleteStatus}
        </div>
      )}

      {uploadedImages.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">2. Uploaded Images</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {uploadedImages.map((img) => (
              <div key={img.id} className="border rounded-lg p-4 space-y-2">
                <div className="relative w-full h-48 rounded overflow-hidden">
                  <ProductImage
                    cfImageId={img.id}
                    variant="card"
                    alt="Uploaded image"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="text-sm space-y-1">
                  <p className="font-mono text-xs break-all">ID: {img.id}</p>
                  <p className="text-xs break-all">URL: {img.url}</p>
                </div>
                <button
                  onClick={() => handleDelete(img.id)}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">3. Test Direct URL</h2>
        {uploadedImages.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Test direct URL (should return 200):
            </p>
            {uploadedImages.map((img) => (
              <a
                key={img.id}
                href={img.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-blue-600 hover:underline text-sm break-all"
              >
                {img.url}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

