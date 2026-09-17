'use client';

import { useState } from 'react';
import type { LessonModeData } from '@/lib/content/extract-lesson-modes';

interface FlashBriefCardProps {
  data: LessonModeData;
  locale?: string;
  slug?: string;
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
      className="space-y-6 rounded-2xl border border-fd-border/80 bg-gradient-to-b from-fd-card to-fd-card/50 p-5 shadow-lg sm:p-7"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-fd-border/60 pb-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            ⚡ {isVi ? 'Thẻ Tóm Tắt 60s' : '60s Flash Brief'}
          </span>
          <span className="text-xs font-medium text-fd-muted-foreground">
            {isVi ? 'Ôn tập nhanh & phỏng vấn' : 'Fast revision & mental models'}
          </span>
        </div>
        {totalCount > 0 && (
          <span className="text-xs font-semibold text-fd-muted-foreground">
            {isVi
              ? `Đã nắm: ${completedCount}/${totalCount} ý chính`
              : `Mastered: ${completedCount}/${totalCount} takeaways`}
          </span>
        )}
      </div>

      {/* Incident Spotlight */}
      {data.incidentHook && (
        <section aria-labelledby="incident-spotlight-heading" className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <span className="text-2xl" aria-hidden="true">💥</span>
            <div className="space-y-2">
              <h3 id="incident-spotlight-heading" className="text-sm font-bold uppercase tracking-wide text-red-600 dark:text-red-400">
                {isVi ? 'Sự Cố Sản Xuất Thực Tế' : 'Real-World Production Outage'}
              </h3>
              <p className="text-sm leading-relaxed text-fd-foreground">
                {data.incidentHook.story}
              </p>
              {data.incidentHook.rootCause && (
                <p className="rounded-md bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-800 dark:text-red-300">
                  <strong className="font-bold">{isVi ? 'Nguyên nhân cốt lõi: ' : 'Root cause: '}</strong>
                  {data.incidentHook.rootCause}
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Rule of Thumb Heuristic */}
      {data.ruleOfThumb && (
        <section aria-labelledby="rule-of-thumb-heading" className="rounded-xl border border-amber-500/40 bg-amber-500/5 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="text-2xl" aria-hidden="true">💡</span>
              <div className="space-y-1">
                <h3 id="rule-of-thumb-heading" className="text-sm font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400">
                  {isVi ? 'Quy Tắc Bỏ Túi (Rule of Thumb)' : 'Rule of Thumb'}
                </h3>
                <p className="text-sm font-medium leading-relaxed text-fd-foreground sm:text-base">
                  {data.ruleOfThumb}
                </p>
              </div>
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
        </section>
      )}

      {/* 5 Core Principles / Takeaways */}
      {data.takeaways.length > 0 && (
        <section aria-labelledby="takeaways-heading" className="space-y-3">
          <h3 id="takeaways-heading" className="text-xs font-bold uppercase tracking-wider text-fd-muted-foreground">
            {isVi ? '⚡ 5 Điểm Cốt Lõi Cần Nhớ (Tick Để Tự Đánh Giá)' : '⚡ Core Principles (Check to Self-Verify)'}
          </h3>
          <div className="grid gap-2.5">
            {data.takeaways.map((item, idx) => {
              const isChecked = !!checkedTakeaways[idx];
              return (
                <div
                  key={idx}
                  onClick={() => toggleTakeaway(idx)}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-all ${
                    isChecked
                      ? 'border-emerald-500/40 bg-emerald-500/5'
                      : 'border-fd-border/70 bg-fd-card/60 hover:bg-fd-accent/30'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleTakeaway(idx)}
                    aria-label={item.highlight}
                    className="mt-1 size-4 shrink-0 rounded border-fd-border text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="space-y-0.5">
                    <span
                      className={`text-sm font-bold ${
                        isChecked
                          ? 'text-emerald-700 dark:text-emerald-300'
                          : 'text-fd-foreground'
                      }`}
                    >
                      {item.highlight}:
                    </span>{' '}
                    <span className="text-sm leading-relaxed text-fd-muted-foreground">
                      {item.description}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Fatal Pitfall Warning */}
      {data.fatalPitfall && (
        <section aria-labelledby="fatal-pitfall-heading" className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <span className="text-2xl" aria-hidden="true">⚠️</span>
            <div className="space-y-1">
              <h3 id="fatal-pitfall-heading" className="text-sm font-bold uppercase tracking-wide text-rose-600 dark:text-rose-400">
                {isVi ? 'Cạm Bẫy Chết Người (Fatal Pitfall)' : 'Fatal Pitfall to Avoid'}
              </h3>
              <p className="text-sm leading-relaxed text-rose-950 dark:text-rose-200">
                {data.fatalPitfall}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Navigation Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-fd-border/60 pt-4">
        {onSwitchToDeepDive && (
          <button
            type="button"
            onClick={onSwitchToDeepDive}
            className="inline-flex items-center gap-1.5 rounded-lg border border-fd-border bg-fd-card px-3.5 py-2 text-xs font-semibold text-fd-foreground transition-colors hover:bg-fd-accent"
          >
            <span>📖</span>
            <span>{isVi ? 'Đọc toàn văn chuyên sâu (Deep Dive) →' : 'Read Full Deep Dive →'}</span>
          </button>
        )}
        {onSwitchToPractice && (
          <button
            type="button"
            onClick={onSwitchToPractice}
            className="inline-flex items-center gap-1.5 rounded-lg border border-fd-primary/30 bg-fd-primary/10 px-3.5 py-2 text-xs font-semibold text-fd-primary transition-colors hover:bg-fd-primary/20"
          >
            <span>🎯</span>
            <span>{isVi ? 'Thử thách tình huống thực tế →' : 'Practice Scenarios →'}</span>
          </button>
        )}
      </div>
    </article>
  );
}
