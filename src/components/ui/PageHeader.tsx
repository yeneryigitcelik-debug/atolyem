interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: string;
}

export default function PageHeader({ title, description, badge }: PageHeaderProps) {
  return (
    <div className="bg-surface-warm border-b border-border-subtle">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {badge && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary mb-4">
            {badge}
          </span>
        )}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-charcoal tracking-tight">{title}</h1>
        {description && (
          <p className="mt-4 text-lg text-text-secondary max-w-2xl">{description}</p>
        )}
      </div>
    </div>
  );
}


