"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteSellerProductAction } from "../actions";

interface DeleteProductButtonProps {
  productId: string;
  productTitle: string;
}

export default function DeleteProductButton({ productId, productTitle }: DeleteProductButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`"${productTitle}" ürününü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
      return;
    }

    setLoading(true);
    try {
      const result = await deleteSellerProductAction(productId);
      if (result.error) {
        alert(result.error);
      } else {
        router.refresh();
      }
    } catch (error) {
      alert("Bir hata oluştu");
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? "Siliniyor..." : "Sil"}
    </button>
  );
}

