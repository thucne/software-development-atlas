'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

export type TermBoxProps = {
  term: string;
  title?: string;
  locale?: string;
  children: ReactNode;
};

export function TermBox({ term, title, locale, children }: TermBoxProps) {
  let pathname = '';
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    pathname = usePathname() || '';
  } catch {
    pathname = '';
  }
  const isVi =
    locale === 'vi' || pathname.includes('/vi/docs') || pathname.endsWith('/vi');
  const label = title ?? (isVi ? `${term} là gì?` : `What is ${term}?`);

  return (
    <aside
      aria-label={label}
      data-atlas-term-box=""
      className="atlas-term-box my-2.5 rounded-md border border-fd-border/80 border-l-[3px] border-l-fd-primary/45 bg-fd-muted/15 px-3 py-2.5 shadow-none"
    >
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="inline-flex max-w-full rounded-md border border-fd-border/70 bg-fd-card px-1.5 py-0.5 text-[11px] font-semibold tracking-wide text-fd-foreground">
          {term}
        </span>
        <p className="m-0 text-xs font-medium text-fd-muted-foreground">{label}</p>
      </div>
      <div className="mt-1.5 text-[13px] leading-relaxed text-fd-muted-foreground [&>p]:my-1.5 [&>p:first-child]:mt-0 [&>p:last-child]:mb-0 [&>p:first-child]:text-fd-foreground/90 [&_strong]:font-semibold [&_strong]:text-fd-foreground">
        {children}
      </div>
    </aside>
  );
}
