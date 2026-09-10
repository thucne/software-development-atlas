import type { ReactNode } from 'react';

export type LiveStatusProps = {
  label?: ReactNode;
  children: ReactNode;
  className?: string;
  compact?: boolean;
};

export function LiveStatus({
  label,
  children,
  className = '',
  compact = false,
}: LiveStatusProps) {
  return (
    <div
      aria-live="polite"
      className={[
        'rounded-md bg-fd-muted text-sm',
        compact ? 'px-2.5 py-1.5' : 'p-3',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {label ? <strong>{label}:</strong> : null}
      {label ? ' ' : null}
      {children}
    </div>
  );
}
