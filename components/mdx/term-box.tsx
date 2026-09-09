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
  const isVi = locale === 'vi' || pathname.includes('/vi/docs') || pathname.endsWith('/vi');
  const label = title ?? (isVi ? `${term} là gì?` : `What is ${term}?`);

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
