import type { ReactNode } from 'react';

export type LiveStatusProps = {
  label?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function LiveStatus({
  label,
  children,
  className = '',
}: LiveStatusProps) {
  return (
    <div
      aria-live="polite"
      className={`rounded-md bg-fd-muted p-3 text-sm ${className}`.trim()}
    >
      {label ? <strong>{label}:</strong> : null}
      {label ? ' ' : null}
      {children}
    </div>
  );
}
