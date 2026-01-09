"use client";

import Link from "next/link";

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  secondaryHref?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  secondaryLabel,
  secondaryHref,
}: EmptyStateProps) {
  return (
    <div className="text-center py-16">
      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="material-symbols-outlined text-primary text-4xl">{icon}</span>
      </div>
      <h2 className="text-xl font-bold text-text-charcoal mb-2">{title}</h2>
      <p className="text-text-secondary mb-8 max-w-md mx-auto">{description}</p>
      
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {actionLabel && (actionHref || onAction) && (
          actionHref ? (
            <Link
              href={actionHref}
              className="inline-flex items-center justify-center px-8 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-md transition-colors"
            >
              {actionLabel}
            </Link>
          ) : (
            <button
              onClick={onAction}
              className="inline-flex items-center justify-center px-8 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-md transition-colors"
            >
              {actionLabel}
            </button>
          )
        )}
        
        {secondaryLabel && secondaryHref && (
          <Link
            href={secondaryHref}
            className="inline-flex items-center justify-center px-8 py-3 border border-border-subtle text-text-charcoal hover:border-primary hover:text-primary font-semibold rounded-md transition-colors"
          >
            {secondaryLabel}
          </Link>
        )}
      </div>
    </div>
  );
}


