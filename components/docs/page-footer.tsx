'use client';

import { useFooterItems } from 'fumadocs-ui/utils/use-footer-items';
import Link from 'fumadocs-core/link';
import { usePathname } from 'next/navigation';
import { useMemo, type ReactNode } from 'react';

function ChevronLeft({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}


interface FooterItemData {
  name: string;
  url: string;
  description?: string;
}

interface FooterItems {
  previous?: FooterItemData;
  next?: FooterItemData;
}

interface PageFooterProps {
  items?: FooterItems;
  className?: string;
  children?: ReactNode;
}

export function PageFooter({ items, children, className }: PageFooterProps) {
  const footerList = useFooterItems();
  const pathname = usePathname();

  const { previous, next } = useMemo(() => {
    if (items) return items;
    const idx = footerList.findIndex((item) => item.url === pathname);
    if (idx === -1) return {};
    return {
      previous: footerList[idx - 1] as FooterItemData | undefined,
      next: footerList[idx + 1] as FooterItemData | undefined,
    };
  }, [footerList, items, pathname]);

  const hasBoth = Boolean(previous && next);

  return (
    <>
      <div
        className={[
          '@container grid gap-4',
          hasBoth ? 'grid-cols-2' : 'grid-cols-1',
          className ?? '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {previous && <FooterItem item={previous} index={0} />}
        {next && <FooterItem item={next} index={1} />}
      </div>
      {children}
    </>
  );
}

function FooterItem({ item, index }: { item: FooterItemData; index: 0 | 1 }) {
  const Icon = index === 0 ? ChevronLeft : ChevronRight;
  const label = index === 0 ? 'Previous Page' : 'Next Page';
  const isNext = index === 1;

  return (
    <Link
      href={item.url}
      className={[
        'flex min-w-0 flex-col gap-2 rounded-lg border p-4 text-sm',
        'transition-colors hover:bg-fd-accent/80 hover:text-fd-accent-foreground',
        '@max-lg:col-span-full',
        isNext ? 'text-end' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* min-w-0 on the flex row so children can shrink below their natural size */}
      <div
        className={[
          'flex min-w-0 items-center gap-1.5 font-medium',
          isNext ? 'flex-row-reverse' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <Icon className="-mx-1 size-4 shrink-0 rtl:rotate-180" />
        {/* truncate clips overflow text instead of pushing sibling column */}
        <p className="min-w-0 truncate">{item.name}</p>
      </div>

      <p className="truncate text-fd-muted-foreground">
        {item.description ?? label}
      </p>
    </Link>
  );
}
