import { useId, type ReactNode } from 'react';

export type LabPanelProps = {
  title: string;
  children: ReactNode;
  className?: string;
};

export function LabPanel({ title, children, className = '' }: LabPanelProps) {
  const titleId = useId();

  return (
    <section
      aria-labelledby={titleId}
      className={`rounded-lg border bg-fd-card p-4 ${className}`.trim()}
    >
      <h4 id={titleId} className="mb-3 font-semibold">
        {title}
      </h4>
      {children}
    </section>
  );
}
