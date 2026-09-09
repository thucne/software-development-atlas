import type { ReactNode } from 'react';

export type TermBoxProps = {
  term: string;
  children: ReactNode;
};

export function TermBox({ term, children }: TermBoxProps) {
  const label = `What is ${term}?`;

  return (
    <aside
      aria-label={label}
      className="my-5 rounded-lg border border-fd-border bg-fd-card p-4"
    >
      <p className="mt-0 font-semibold text-fd-foreground">{label}</p>
      <div className="text-fd-muted-foreground [&>:first-child]:mt-2 [&>:last-child]:mb-0">
        {children}
      </div>
    </aside>
  );
}
