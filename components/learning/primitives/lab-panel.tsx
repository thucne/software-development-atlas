import { useId, type ReactNode } from 'react';

export type LabPanelProps = {
  title: string;
  children: ReactNode;
  className?: string;
  compact?: boolean;
};

export function LabPanel({
  title,
  children,
  className = '',
  compact = false,
}: LabPanelProps) {
  const titleId = useId();

  return (
    <section
      aria-labelledby={titleId}
      data-lab-panel-density={compact ? 'compact' : 'comfortable'}
      className={[
        'min-w-0 rounded-lg border bg-fd-card',
        compact ? 'p-2.5' : 'p-4',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <h4
        id={titleId}
        className={compact ? 'mb-1.5 text-sm font-semibold' : 'mb-3 font-semibold'}
      >
        {title}
      </h4>
      {children}
    </section>
  );
}
