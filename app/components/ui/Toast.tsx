"use client";

import { useEffect } from "react";

export interface Toast {
  id: string;
  message: string;
  type?: "success" | "error" | "info" | "warning";
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onClose: (id: string) => void;
}

export function ToastItem({ toast, onClose }: ToastProps) {
  useEffect(() => {
    if (toast.duration !== 0) {
      const timer = setTimeout(() => {
        onClose(toast.id);
      }, toast.duration || 5000);

      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.duration, onClose]);

  const typeStyles = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
  };

  const iconStyles = {
    success: "text-green-600",
    error: "text-red-600",
    info: "text-blue-600",
    warning: "text-yellow-600",
  };

  const icons = {
    success: "check_circle",
    error: "error",
    info: "info",
    warning: "warning",
  };

  const type = toast.type || "info";

  return (
    <div
      className={`flex items-start gap-3 rounded-lg border p-4 shadow-lg transition-all animate-in slide-in-from-top-5 ${typeStyles[type]}`}
      role="alert"
    >
      <span className={`material-symbols-outlined flex-shrink-0 ${iconStyles[type]}`}>
        {icons[type]}
      </span>
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button
        onClick={() => onClose(toast.id)}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Kapat"
      >
        <span className="material-symbols-outlined text-lg">close</span>
      </button>
    </div>
  );
}

