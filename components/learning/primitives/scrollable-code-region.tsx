import type { ReactNode } from 'react';

export type ScrollableCodeRegionProps = {
  label: string;
  children: ReactNode;
};

export function ScrollableCodeRegion({
  label,
  children,
}: ScrollableCodeRegionProps) {
  return (
    <div
      role="region"
      aria-label={label}
      tabIndex={0}
      className="overflow-x-auto rounded-lg border bg-fd-muted p-4 focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      <pre className="m-0 min-w-max text-sm leading-relaxed">
        <code className="!block !border-0 !bg-transparent !p-0">
          {children}
        </code>
      </pre>
    </div>
  );
}
