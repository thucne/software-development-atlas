'use client';

import { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';

const BANNER_ID = 'atlas-release-2026-09-22';
const GLOBAL_KEY = 'nd-banner-mf2wky3sorsw4zdsgmydimjwg4';

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

function getSnapshot(): boolean {
  try {
    return (
      localStorage.getItem(BANNER_ID) === 'true' ||
      localStorage.getItem(GLOBAL_KEY) === 'true'
    );
  } catch {
    return false;
  }
}

function getServerSnapshot(): boolean {
  return false;
}

export function AtlasReleaseBanner({ locale = 'en' }: { locale?: string }) {
  const isDismissed = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [closedLocally, setClosedLocally] = useState(false);

  const open = !isDismissed && !closedLocally;

  const onClose = () => {
    setClosedLocally(true);
    try {
      localStorage.setItem(BANNER_ID, 'true');
      localStorage.setItem(GLOBAL_KEY, 'true');
    } catch {
      // ignore localStorage errors
    }
  };

  if (!open) {
    return <style>{`:root { --fd-banner-height: 0px; }`}</style>;
  }

  const isVi = locale === 'vi';
  const changelogHref = isVi
    ? '/vi/docs/start-here/changelog'
    : '/docs/start-here/changelog';
  const primaryCopy = isVi
    ? '54 bài học mới được bổ sung từ 10/09!'
    : '54 new lessons added since Sep 10!';
  const secondaryCopy = isVi
    ? 'Tiếp nối mốc 33 bài học kiến trúc hệ thống ngày 10/09.'
    : "Following the Sep 10 milestone's 33 new system architecture lessons.";

  return (
    <div
      id={BANNER_ID}
      className="sticky top-0 z-40 flex h-12 flex-row items-center justify-center bg-fd-background px-4 text-center text-sm font-medium"
      style={{ height: '3rem' }}
    >
      <style>{`:root { --fd-banner-height: 3rem; }
@keyframes fd-moving-banner {
  from { background-position: 0% 0; }
  to { background-position: 100% 0; }
}`}</style>
      <div
        className="pointer-events-none absolute inset-0 -z-1 overflow-hidden"
        aria-hidden="true"
        style={{
          maskImage:
            'linear-gradient(to bottom,white,transparent), radial-gradient(circle at top center, white, transparent)',
          WebkitMaskImage:
            'linear-gradient(to bottom,white,transparent), radial-gradient(circle at top center, white, transparent)',
          maskComposite: 'intersect',
          WebkitMaskComposite: 'source-in',
          animation: 'fd-moving-banner 20s linear infinite',
          backgroundImage:
            'repeating-linear-gradient(70deg, rgba(0,149,255,0.56) 0%, rgba(231,77,255,0.77) 12.5%, rgba(255,0,0,0.73) 25%, rgba(131,255,166,0.66) 37.5%, rgba(0,149,255,0.56) 50%)',
          backgroundSize: '200% 100%',
          filter: 'saturate(2)',
        }}
      />
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
      <button
        type="button"
        aria-label="Close Banner"
        onClick={onClose}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-fd-muted-foreground/50 transition-colors hover:bg-fd-accent hover:text-fd-foreground"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-4"
          aria-hidden="true"
        >
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      </button>
    </div>
  );
}
