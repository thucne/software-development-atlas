import type { ReactNode } from 'react';

export type ScrollableCodeRegionProps = {
  label: string;
  children: ReactNode;
  /** Cap visible height so long scenarios do not dominate the lab. */
  maxHeightClassName?: string;
  compact?: boolean;
};

export function ScrollableCodeRegion({
  label,
  children,
  maxHeightClassName,
  compact = false,
}: ScrollableCodeRegionProps) {
  return (
    <div
      role="region"
      aria-label={label}
      tabIndex={0}
      className={[
        'min-w-0 max-w-full overflow-auto rounded-lg border bg-fd-muted focus-visible:outline-2 focus-visible:outline-offset-2',
        compact ? 'p-2.5' : 'p-4',
        maxHeightClassName,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <pre
        className={[
          'm-0 max-w-full whitespace-pre-wrap break-words leading-relaxed',
          compact ? 'text-xs' : 'text-sm',
        ].join(' ')}
      >
        <code className="!block !max-w-full !border-0 !bg-transparent !p-0 !whitespace-pre-wrap !break-words">
          {children}
        </code>
      </pre>
    </div>
  );
}
