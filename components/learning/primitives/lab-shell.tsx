import { useId, type ReactNode } from 'react';

export type LabShellProps = {
  title: string;
  description: ReactNode;
  children: ReactNode;
  className?: string;
};

export function LabShell({
  title,
  description,
  children,
  className = '',
}: LabShellProps) {
  const titleId = useId();

  return (
    <section
      aria-labelledby={titleId}
      className={`my-8 space-y-6 rounded-xl border bg-fd-card p-4 sm:p-6 ${className}`.trim()}
    >
      <div className="space-y-2">
        <h3 id={titleId} className="text-xl font-semibold">
          {title}
        </h3>
        <div className="text-fd-muted-foreground">{description}</div>
      </div>
      {children}
    </section>
  );
}
