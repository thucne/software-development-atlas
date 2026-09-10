'use client';

import { Banner } from 'fumadocs-ui/components/banner';
import Link from 'next/link';

export function AtlasReleaseBanner({ locale = 'en' }: { locale?: string }) {
  const isVi = locale === 'vi';
  const changelogHref = isVi
    ? '/vi/docs/start-here/changelog'
    : '/docs/start-here/changelog';

  return (
    <Banner id="atlas-release-2026-09-10" variant="rainbow">
      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium">
        <span className="inline-flex items-center rounded-full border border-emerald-700/40 bg-emerald-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-950/50 dark:text-emerald-300">
          {isVi ? 'Mới' : 'New'}
        </span>
        <span>
          {isVi
            ? '20 bài học kiến trúc hệ thống mới vừa ra mắt!'
            : '20 new system architecture lessons added!'}
        </span>
        <Link
          href={changelogHref}
          className="font-semibold text-fd-primary underline underline-offset-4 hover:text-fd-primary/80"
        >
          {isVi ? 'Xem nhật ký cập nhật →' : "Explore What's New →"}
        </Link>
      </div>
    </Banner>
  );
}
