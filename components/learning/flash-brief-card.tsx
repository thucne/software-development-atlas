'use client';

import { useState } from 'react';
import type { LessonModeData } from '@/lib/content/extract-lesson-modes';
import { FormattedText } from '@/components/learning/formatted-text';

interface FlashBriefCardProps {
  data: LessonModeData;
  locale?: string;
  onSwitchToDeepDive?: () => void;
  onSwitchToPractice?: () => void;
}

export function FlashBriefCard({
  data,
  locale = 'en',
  onSwitchToDeepDive,
  onSwitchToPractice,
}: FlashBriefCardProps) {
  const isVi = locale === 'vi';
  const [copied, setCopied] = useState(false);
  const [checkedTakeaways, setCheckedTakeaways] = useState<Record<number, boolean>>({});

  const handleCopyRule = () => {
    if (!data.ruleOfThumb) return;
    navigator.clipboard.writeText(data.ruleOfThumb).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const toggleTakeaway = (idx: number) => {
    setCheckedTakeaways((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const completedCount = Object.values(checkedTakeaways).filter(Boolean).length;
  const totalCount = data.takeaways.length;

  return (
    <article
      aria-label={isVi ? 'Thẻ tóm tắt 60 giây' : '60-Second Flash Brief'}
      className="space-y-5 rounded-2xl border border-fd-border/80 bg-gradient-to-b from-fd-card to-fd-card/60 p-4 shadow-sm sm:space-y-6 sm:p-6"
    >
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-fd-border/60 pb-3.5">
        <div className="flex items-center gap-2">
          <span className="inline-flex shrink-0 items-center rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            ⚡ {isVi ? 'Thẻ Tóm Tắt 60s' : '60s Flash Brief'}
          </span>
          <span className="text-xs font-medium text-fd-muted-foreground">
            {isVi ? 'Ôn tập nhanh & phỏng vấn' : 'Fast revision & mental models'}
          </span>
        </div>
        {totalCount > 0 && (
          <div className="flex items-center gap-2 rounded-lg border border-fd-border/60 bg-fd-card px-2.5 py-1 text-xs">
            <span className="text-fd-muted-foreground">
              {isVi ? 'Đã nắm:' : 'Mastered:'}
            </span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
              {completedCount}/{totalCount}
            </span>
          </div>
        )}
      </div>

      {/* Incident Spotlight */}
      {data.incidentHook && (
        <section
          aria-labelledby="incident-spotlight-heading"
          className="rounded-xl border border-red-500/30 bg-red-500/[0.03] p-4 sm:p-5"
        >
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-lg" aria-hidden="true">💥</span>
              <h3
                id="incident-spotlight-heading"
                className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400"
              >
                {isVi ? 'Sự Cố Sản Xuất Thực Tế' : 'Real-World Production Outage'}
              </h3>
            </div>

            <div className="text-sm leading-relaxed text-fd-foreground">
              <FormattedText text={data.incidentHook.story} />
            </div>

            {data.incidentHook.rootCause && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs leading-relaxed text-red-900 dark:text-red-200">
                <strong className="block mb-1 font-bold text-red-700 dark:text-red-300">
                  {isVi ? '🔍 Nguyên nhân cốt lõi:' : '🔍 Root cause:'}
                </strong>
                <FormattedText text={data.incidentHook.rootCause} />
              </div>
            )}
          </div>
        </section>
      )}

      {/* Rule of Thumb Heuristic */}
      {data.ruleOfThumb && (
        <section
          aria-labelledby="rule-of-thumb-heading"
          className="rounded-xl border border-amber-500/40 bg-amber-500/[0.04] p-4 sm:p-5"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-lg" aria-hidden="true">💡</span>
                <h3
                  id="rule-of-thumb-heading"
                  className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400"
                >
                  {isVi ? 'Quy Tắc Bỏ Túi (Rule of Thumb)' : 'Rule of Thumb Heuristic'}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCopyRule}
                aria-label={isVi ? 'Sao chép quy tắc bỏ túi' : 'Copy rule of thumb'}
                className="shrink-0 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-500/20 dark:text-amber-300"
              >
                {copied ? (isVi ? '✓ Đã chép' : '✓ Copied') : (isVi ? 'Sao chép' : 'Copy')}
              </button>
            </div>

            <div className="text-sm font-medium leading-relaxed text-fd-foreground sm:text-base">
              <FormattedText text={data.ruleOfThumb} />
            </div>
          </div>
        </section>
      )}

      {/* 5 Core Principles / Takeaways */}
      {data.takeaways.length > 0 && (
        <section aria-labelledby="takeaways-heading" className="space-y-3">
          <div className="flex items-center justify-between">
            <h3
              id="takeaways-heading"
              className="text-xs font-bold uppercase tracking-wider text-fd-muted-foreground"
            >
              {isVi
                ? `⚡ ${data.takeaways.length} Điểm Cốt Lõi (Tick để tự đánh giá)`
                : `⚡ ${data.takeaways.length} Core Principles (Check to verify)`}
            </h3>
          </div>

          <div className="grid gap-2.5">
            {data.takeaways.map((item, idx) => {
              const isChecked = Boolean(checkedTakeaways[idx]);
              return (
                <div
                  key={idx}
                  onClick={() => toggleTakeaway(idx)}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-all ${
                    isChecked
                      ? 'border-emerald-500/40 bg-emerald-500/5'
                      : 'border-fd-border/70 bg-fd-card hover:bg-fd-accent/30'
                  }`}
                >
                  {/* Custom Checkbox */}
                  <div className="mt-0.5 shrink-0">
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-md border text-xs font-bold transition-all ${
                        isChecked
                          ? 'border-emerald-500 bg-emerald-500 text-white'
                          : 'border-fd-border bg-fd-muted/50 text-transparent hover:border-emerald-500'
                      }`}
                    >
                      ✓
                    </div>
                  </div>

                  <div className="min-w-0 space-y-1">
                    <h4
                      className={`text-sm font-semibold transition-colors ${
                        isChecked
                          ? 'text-emerald-700 line-through dark:text-emerald-300'
                          : 'text-fd-foreground'
                      }`}
                    >
                      {item.highlight}
                    </h4>
                    <div className="text-xs leading-relaxed text-fd-muted-foreground sm:text-sm">
                      <FormattedText text={item.description} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Fatal Pitfall Warning */}
      {data.fatalPitfall && (
        <section
          aria-labelledby="fatal-pitfall-heading"
          className="rounded-xl border border-rose-500/40 bg-rose-500/[0.04] p-4 sm:p-5"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-lg" aria-hidden="true">⚠️</span>
              <h3
                id="fatal-pitfall-heading"
                className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400"
              >
                {isVi ? 'Cạm Bẫy Chí Mạng (Fatal Pitfall)' : 'Fatal Architectural Pitfall'}
              </h3>
            </div>
            <div className="text-sm font-medium leading-relaxed text-fd-foreground">
              <FormattedText text={data.fatalPitfall} />
            </div>
          </div>
        </section>
      )}

      {/* Footer Navigation CTAs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-fd-border/60 pt-4">
        {onSwitchToDeepDive && (
          <button
            type="button"
            onClick={onSwitchToDeepDive}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-fd-foreground transition-colors hover:text-fd-primary"
          >
            <span>📖</span>
            <span>{isVi ? 'Đọc toàn văn bài học chuyên sâu' : 'Read full deep dive lesson'}</span>
            <span>→</span>
          </button>
        )}

        {onSwitchToPractice && (
          <button
            type="button"
            onClick={onSwitchToPractice}
            className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-600 transition-colors hover:bg-indigo-500/20 dark:text-indigo-400"
          >
            <span>🎯</span>
            <span>{isVi ? 'Luyện tập tình huống thực tế' : 'Solve scenario drills'}</span>
            <span>→</span>
          </button>
        )}
      </div>
    </article>
  );
}
