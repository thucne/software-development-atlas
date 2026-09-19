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

    const levelDisplay =
      card.level === 'beginner'
        ? isVi
          ? 'Cơ bản'
          : 'Beginner'
        : card.level === 'advanced'
          ? isVi
            ? 'Nâng cao'
            : 'Advanced'
          : isVi
            ? 'Trung cấp'
            : 'Intermediate';

    // Layout configuration based on aspect ratio
    const containerClasses = {
      '9:16': 'w-full max-w-[420px] aspect-[9/16] p-7 md:p-8',
      '1:1': 'w-full max-w-[480px] aspect-square p-7 md:p-8',
      '16:9': 'w-full max-w-[680px] aspect-[16/9] p-6 md:p-8',
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
        <div className="relative z-10 flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <svg
              className="h-4 w-4 text-blue-400"
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
            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400 font-mono">
              Atlas · {card.domainTitle}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded bg-slate-800/80 px-1.5 py-0.5 text-[10px] font-mono uppercase text-slate-300">
              {levelDisplay}
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              {String(currentIndex + 1).padStart(2, '0')}/{String(totalCards).padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Middle Content Area */}
        <div className="relative z-10 flex flex-1 flex-col justify-center py-4">
          {/* Card Badge */}
          <div className="mb-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ${tone.badge}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${tone.accentLine}`} />
              {card.badge}
            </span>
          </div>

          {/* Title & Subtitle */}
          <h3
            className={`font-extrabold tracking-tight text-white ${
              ratio === '9:16'
                ? 'text-xl md:text-2xl line-clamp-2'
                : ratio === '16:9'
                  ? 'text-lg md:text-xl line-clamp-1'
                  : 'text-lg md:text-xl line-clamp-2'
            }`}
          >
            {card.title}
          </h3>
          {card.subtitle && (
            <p className="mt-1 text-xs text-slate-400 font-mono line-clamp-1">
              {card.subtitle}
            </p>
          )}

          {/* Body Content based on Card Type */}
          <div className="mt-3">
            {/* Type: Rule of Thumb Quote */}
            {card.type === 'rule-of-thumb' && card.quote && (
              <div className="relative rounded-xl border border-blue-500/20 bg-blue-950/20 p-4 md:p-5">
                <span className="absolute -top-3 left-4 rounded bg-blue-500 px-1.5 py-0.5 text-[10px] font-bold text-slate-950 uppercase">
                  {isVi ? 'Quy tắc vàng' : 'Rule of thumb'}
                </span>
                <p className="text-sm md:text-base leading-relaxed text-slate-200 italic">
                  &ldquo;{card.quote}&rdquo;
                </p>
              </div>
            )}

            {/* Type: Real-World Incident Story */}
            {card.type === 'incident' && card.content && (
              <div className="rounded-xl border border-amber-500/20 bg-amber-950/20 p-4 md:p-5">
                <div className="flex items-center gap-2 mb-2 text-amber-400 text-xs font-semibold">
                  <span>⚡</span>
                  <span>{isVi ? 'Sự cố thực chiến' : 'Production Outage'}</span>
                </div>
                <p className="text-xs md:text-sm leading-relaxed text-slate-300">
                  {card.content}
                </p>
              </div>
            )}

            {/* Type: Fatal Pitfall */}
            {card.type === 'pitfall' && card.content && (
              <div className="rounded-xl border border-rose-500/25 bg-rose-950/25 p-4 md:p-5">
                <div className="flex items-center gap-2 mb-2 text-rose-400 text-xs font-bold uppercase tracking-wide">
                  <span>⚠️</span>
                  <span>{isVi ? 'Cạm bẫy nghiêm trọng' : 'Critical Hazard'}</span>
                </div>
                <p className="text-xs md:text-sm leading-relaxed text-slate-200">
                  {card.content}
                </p>
              </div>
            )}

            {/* Type: Core Takeaways List */}
            {card.type === 'takeaways' && card.bulletItems && (
              <ul className="space-y-2">
                {card.bulletItems.slice(0, ratio === '16:9' ? 3 : 4).map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 rounded-lg border border-slate-800/60 bg-slate-900/40 p-2.5 text-xs text-slate-300"
                  >
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] font-bold text-emerald-400 font-mono">
                      {idx + 1}
                    </span>
                    <span className="leading-snug">
                      <strong className="text-slate-100 font-semibold">
                        {item.label}:
                      </strong>{' '}
                      {item.text}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Bottom Bar: Watermark, Site URL & Verification */}
        <div className="relative z-10 flex items-center justify-between border-t border-slate-800/80 pt-3 text-[11px] text-slate-400 font-mono">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-300">SD Atlas</span>
            <span>·</span>
            <span className="text-slate-500 truncate max-w-[160px] md:max-w-[200px]">
              {card.lessonTitle}
            </span>
          </div>

          <div className="flex items-center gap-1 text-blue-400 font-medium">
            <span>thucde.dev/learn</span>
            <svg
              className="h-3 w-3"
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
