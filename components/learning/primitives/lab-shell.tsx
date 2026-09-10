import { useId, type ReactNode } from 'react';

export type LabShellProps = {
  title: string;
  description: ReactNode;
  children: ReactNode;
  className?: string;
  /** Tighter spacing for dense teaching simulators. */
  compact?: boolean;
};

export function LabShell({
  title,
  description,
  children,
  className = '',
  compact = false,
}: LabShellProps) {
  const titleId = useId();

  return (
    <section
      aria-labelledby={titleId}
      data-lab-density={compact ? 'compact' : 'comfortable'}
      className={[
        'min-w-0 max-w-full rounded-xl border bg-fd-card',
        compact ? 'my-5 space-y-3 p-3 sm:p-4' : 'my-8 space-y-6 p-4 sm:p-6',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className={compact ? 'space-y-1' : 'space-y-2'}>
        <h3
          id={titleId}
          className={compact ? 'text-lg font-semibold' : 'text-xl font-semibold'}
        >
          {title}
        </h3>
        <div
          className={
            compact
              ? 'text-sm text-fd-muted-foreground'
              : 'text-fd-muted-foreground'
          }
        >
          {description}
        </div>
      </div>
      {children}
    </section>
  );
}
