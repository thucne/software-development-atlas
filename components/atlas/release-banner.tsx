'use client';

import { Banner } from 'fumadocs-ui/components/banner';
import Link from 'next/link';

export function AtlasReleaseBanner({ locale = 'en' }: { locale?: string }) {
  const isVi = locale === 'vi';
  const changelogHref = isVi
    ? '/vi/docs/start-here/changelog'
    : '/docs/start-here/changelog';
  const primaryCopy = isVi
    ? '13 bài học mới được bổ sung từ 10/09!'
    : '13 new lessons added since Sep 10!';
  const secondaryCopy = isVi
    ? 'Tiếp nối mốc 33 bài học kiến trúc hệ thống ngày 10/09.'
    : "Following the Sep 10 milestone's 33 new system architecture lessons.";

  return (
    <Banner id="atlas-release-2026-09-16" variant="rainbow">
      <div className="flex min-w-0 flex-col items-center justify-center gap-0.5 ps-3 pe-8 text-center text-xs font-medium sm:flex-row sm:flex-wrap sm:gap-2 sm:px-8 sm:text-sm">
        <div className="inline-flex max-w-full items-center justify-center gap-1.5 sm:contents">
          <span className="inline-flex shrink-0 items-center rounded-full border border-emerald-700/40 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800 sm:px-2 sm:text-[11px] dark:border-emerald-500/40 dark:bg-emerald-950/50 dark:text-emerald-300">
            {isVi ? 'Mới' : 'New'}
          </span>
          <span className="leading-snug">{primaryCopy}</span>
        </div>
        <span className="hidden leading-snug sm:inline">{secondaryCopy}</span>
        <Link
          href={changelogHref}
          className="whitespace-nowrap font-semibold text-fd-primary underline underline-offset-4 hover:text-fd-primary/80"
        >
          {isVi ? 'Xem nhật ký cập nhật →' : "Explore What's New →"}
        </Link>
      </div>
    </Banner>
  );
}
