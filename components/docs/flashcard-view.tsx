'use client';

import type { Flashcard } from '@/lib/content/flashcards';
import type { CardAspectRatio } from '@/lib/export-card';
import { forwardRef } from 'react';

interface FlashcardViewProps {
  card: Flashcard;
  ratio: CardAspectRatio;
  currentIndex?: number;
  totalCards?: number;
  locale?: 'en' | 'vi';
}

const toneStyles = {
  accent: {
    border: 'border-blue-500/40',
    badge: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    glow: 'from-blue-600/15 via-transparent to-transparent',
    iconBg: 'bg-blue-500/15 text-blue-400',
    accentLine: 'bg-blue-500',
  },
  warning: {
    border: 'border-amber-500/40',
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    glow: 'from-amber-600/15 via-transparent to-transparent',
    iconBg: 'bg-amber-500/15 text-amber-400',
    accentLine: 'bg-amber-500',
  },
  danger: {
    border: 'border-rose-500/40',
    badge: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    glow: 'from-rose-600/15 via-transparent to-transparent',
    iconBg: 'bg-rose-500/15 text-rose-400',
    accentLine: 'bg-rose-500',
  },
  success: {
    border: 'border-emerald-500/40',
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    glow: 'from-emerald-600/15 via-transparent to-transparent',
    iconBg: 'bg-emerald-500/15 text-emerald-400',
    accentLine: 'bg-emerald-500',
  },
};

export const FlashcardView = forwardRef<HTMLDivElement, FlashcardViewProps>(
  ({ card, ratio, currentIndex = 0, totalCards = 4, locale = 'en' }, ref) => {
    const tone = toneStyles[card.badgeTone] || toneStyles.accent;
    const isVi = locale === 'vi';

    // Layout configuration based on canonical card specifications
    const containerClasses = {
      '9:16': 'w-[390px] h-[693px] p-6',
      '1:1': 'w-[480px] h-[480px] p-5',
      '16:9': 'w-[760px] h-[428px] px-6 py-4',
    }[ratio];

    const titleSize = {
      '9:16': 'text-xl',
      '1:1': 'text-lg',
      '16:9': 'text-base sm:text-lg',
    }[ratio];

    return (
      <div
        ref={ref}
        data-ratio={ratio}
        className={`relative flex flex-col justify-between overflow-hidden rounded-2xl bg-[#090d16] text-slate-100 shadow-2xl border ${tone.border} ${containerClasses} font-sans select-none`}
        style={{
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7)',
        }}
      >
        {/* Background Technical Grid & Ambient Glow */}
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.2) 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }}
        />
        <div
          className={`pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-gradient-to-br ${tone.glow} blur-3xl`}
        />
        <div
          className={`pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-gradient-to-tr ${tone.glow} blur-3xl`}
        />

        {/* Top Bar: Brand & Metadata */}
        <div className="relative z-10 flex items-center justify-between border-b border-slate-800/80 pb-2">
          <div className="flex items-center gap-2 min-w-0 pr-2">
            <svg
              className="h-4 w-4 shrink-0 text-blue-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400 font-mono truncate whitespace-nowrap">
              Atlas · {card.domainTitle}
            </span>
          </div>

          <div className="flex items-center shrink-0">
            <span className="text-[11px] font-mono font-medium text-slate-400">
              {String(currentIndex + 1).padStart(2, '0')}/{String(totalCards).padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Middle Content Area */}
        <div className="relative z-10 flex flex-1 flex-col justify-center py-1.5 sm:py-2 overflow-hidden">
          {/* Card Badge */}
          <div className={ratio === '16:9' ? 'mb-1.5' : 'mb-2'}>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border ${
                ratio === '16:9'
                  ? 'px-2.5 py-0.5 text-[10px]'
                  : 'px-3 py-1 text-[11px]'
              } font-semibold uppercase tracking-wider ${tone.badge}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${tone.accentLine}`} />
              {card.badge}
            </span>
          </div>

          {/* Title & Subtitle (Zero Line-Clamp) */}
          <h3
            className={`font-extrabold tracking-tight text-white leading-tight ${titleSize}`}
          >
            {card.title}
          </h3>
          {card.subtitle && (
            <p
              className={`text-slate-400 font-mono ${
                ratio === '16:9' ? 'mt-0.5 text-[11px]' : 'mt-1 text-xs'
              }`}
            >
              {card.subtitle}
            </p>
          )}

          {/* Body Content based on Card Type */}
          <div className={ratio === '16:9' ? 'mt-2' : 'mt-3'}>
            {/* Type: Rule of Thumb Quote */}
            {card.type === 'rule-of-thumb' && card.quote && (
              <div className="rounded-xl border border-blue-500/25 bg-blue-950/25 p-4 sm:p-5">
                <p className="text-sm sm:text-base font-bold leading-snug text-blue-100">
                  &ldquo;{card.quote}&rdquo;
                </p>
                {card.content && card.content !== card.quote && (
                  <p className="mt-2 text-xs sm:text-[13px] leading-relaxed text-slate-300">
                    {card.content}
                  </p>
                )}
              </div>
            )}

            {/* Type: Real-World Incident Story */}
            {card.type === 'incident' && card.content && (
              <div className="rounded-xl border border-amber-500/20 bg-amber-950/20 p-3.5 sm:p-4">
                <div className="flex items-center gap-2 mb-1.5 text-amber-400 text-xs font-semibold">
                  <span>⚡</span>
                  <span>{isVi ? 'Sự cố thực chiến' : 'Production Outage'}</span>
                </div>
                <p className="text-xs sm:text-[13px] leading-relaxed text-slate-200">
                  {card.content}
                </p>
              </div>
            )}

            {/* Type: Fatal Pitfall */}
            {card.type === 'pitfall' && card.content && (
              <div className="rounded-xl border border-rose-500/25 bg-rose-950/25 p-3.5 sm:p-4">
                <div className="flex items-center gap-2 mb-1.5 text-rose-400 text-xs font-bold uppercase tracking-wide">
                  <span>⚠️</span>
                  <span>{isVi ? 'Cạm bẫy nghiêm trọng' : 'Critical Hazard'}</span>
                </div>
                <p className="text-xs sm:text-[13px] leading-relaxed text-slate-100">
                  {card.content}
                </p>
              </div>
            )}

            {/* Type: Core Takeaways List (2-col on 16:9, 1-col on 9:16 and 1:1) */}
            {card.type === 'takeaways' && card.bulletItems && (
              <div
                className={
                  ratio === '16:9'
                    ? 'grid grid-cols-2 gap-2.5'
                    : ratio === '1:1'
                      ? 'space-y-1.5'
                      : 'space-y-2'
                }
              >
                {card.bulletItems.slice(0, 4).map((item, idx) => {
                  const cleanLabel = item.label
                    .replace(/\*\*/g, '')
                    .replace(/[:\s]+$/, '');
                  const cleanText = item.text
                    .replace(/\*\*/g, '')
                    .replace(/^[:\s]+/, '');

                  return (
                    <div
                      key={idx}
                      className={`flex items-start gap-2 rounded-lg border border-slate-800/60 bg-slate-900/40 text-slate-300 ${
                        ratio === '16:9'
                          ? 'p-2 text-[11px] leading-snug'
                          : ratio === '1:1'
                            ? 'p-2 text-[11px] leading-snug'
                            : 'p-2.5 text-xs leading-snug'
                      }`}
                    >
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] font-bold text-emerald-400 font-mono">
                        {idx + 1}
                      </span>
                      <span className="min-w-0">
                        <strong className="text-slate-100 font-semibold">
                          {cleanLabel}:
                        </strong>{' '}
                        <span>{cleanText}</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Bar: Watermark & Site URL (Clean & Never Truncated) */}
        <div className="relative z-10 flex items-center justify-between border-t border-slate-800/80 pt-2.5 text-[11px] text-slate-400 font-mono">
          <div className="flex items-center gap-1.5 min-w-0 pr-2 truncate">
            <span className="font-semibold text-slate-200 shrink-0">SD Atlas</span>
            <span className="text-slate-600 shrink-0">·</span>
            <span className="text-slate-400 font-medium truncate whitespace-nowrap">
              {card.domainTitle}
            </span>
          </div>

          <div className="flex items-center gap-1 text-blue-400 font-medium shrink-0 whitespace-nowrap">
            <span>thucde.dev/learn</span>
            <svg
              className="h-3 w-3 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M7 17l9.2-9.2M17 17V7H7" />
            </svg>
          </div>
        </div>
      </div>
    );
  },
);

FlashcardView.displayName = 'FlashcardView';
