'use client';

import { useState } from 'react';
import type { PracticeChallenge, LessonModeData } from '@/lib/content/extract-lesson-modes';
import { EventLoopLab } from '@/components/learning/event-loop-lab';
import { PromiseResolutionLab } from '@/components/learning/promise-resolution-lab';
import { AsyncWaterfallLab } from '@/components/learning/async-waterfall-lab';
import { HttpRequestPathExplorer } from '@/components/learning/http-request-path-explorer';

interface PracticeChallengesProps {
  challenges: PracticeChallenge[];
  interactiveLab?: LessonModeData['interactiveLab'];
  locale?: string;
  onSwitchToDeepDive?: () => void;
}

export function PracticeChallenges({
  challenges,
  interactiveLab,
  locale = 'en',
  onSwitchToDeepDive,
}: PracticeChallengesProps) {
  const isVi = locale === 'vi';
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [mastery, setMastery] = useState<Record<string, 'mastered' | 'review'>>({});

  const toggleReveal = (id: string) => {
    setRevealed((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const setChallengeMastery = (id: string, status: 'mastered' | 'review') => {
    setMastery((prev) => ({ ...prev, [id]: status }));
  };

  const masteredCount = Object.values(mastery).filter((s) => s === 'mastered').length;
  const totalCount = challenges.length;

  const renderLab = () => {
    const labLocale = isVi ? 'vi' : 'en';
    switch (interactiveLab) {
      case 'EventLoopLab':
        return <EventLoopLab locale={labLocale} />;
      case 'PromiseResolutionLab':
        return <PromiseResolutionLab locale={labLocale} />;
      case 'AsyncWaterfallLab':
        return <AsyncWaterfallLab locale={labLocale} />;
      case 'HttpRequestPathExplorer':
        return <HttpRequestPathExplorer locale={labLocale} />;
      default:
        return null;
    }
  };

  return (
    <section
      aria-label={isVi ? 'Thử thách tư duy & Thực hành' : 'Practice Challenges & Hands-on Labs'}
      className="space-y-8"
    >
      {/* Header & Progress */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-fd-border/80 bg-gradient-to-r from-fd-card to-fd-card/50 p-5 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full border border-indigo-500/40 bg-indigo-500/10 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              🎯 {isVi ? 'Thử Thách & Luyện Tập' : 'Practice & Active Recall'}
            </span>
            {interactiveLab && (
              <span className="inline-flex items-center rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                🔬 {isVi ? 'Có Lab Tương Tác' : 'Interactive Lab'}
              </span>
            )}
          </div>
          <p className="text-xs text-fd-muted-foreground sm:text-sm">
            {isVi
              ? 'Luyện tập tư duy phản xạ qua sự cố hệ thống thực tế và câu hỏi tự đánh giá kiến thức.'
              : 'Sharpen your engineering instincts with production outage drills and active mental-model checks.'}
          </p>
        </div>

        {totalCount > 0 && (
          <div className="flex items-center gap-3 rounded-xl border border-fd-border/70 bg-fd-card px-3.5 py-2 text-xs">
            <span className="font-semibold text-fd-muted-foreground">
              {isVi ? 'Tiến độ nắm vững:' : 'Mastery progress:'}
            </span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
              {masteredCount}/{totalCount}
            </span>
          </div>
        )}
      </div>

      {/* Featured Interactive Lab (if present) */}
      {interactiveLab && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-lg" aria-hidden="true">🔬</span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-fd-foreground">
              {isVi ? 'Phòng Thí Nghiệm Trực Quan Tương Tác' : 'Interactive Hands-On Lab'}
            </h2>
          </div>
          <div className="overflow-hidden rounded-2xl border border-fd-border shadow-sm">
            {renderLab()}
          </div>
        </div>
      )}

      {/* Challenge Cards */}
      {challenges.length > 0 ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-fd-muted-foreground">
              {isVi ? `⚡ Danh Sách Thử Thách (${challenges.length})` : `⚡ Scenario Drills (${challenges.length})`}
            </h2>
            {onSwitchToDeepDive && (
              <button
                type="button"
                onClick={onSwitchToDeepDive}
                className="text-xs font-semibold text-indigo-600 transition-colors hover:underline dark:text-indigo-400"
              >
                {isVi ? 'Đọc lý thuyết chuyên sâu →' : 'Read full deep-dive lesson →'}
              </button>
            )}
          </div>

          <div className="grid gap-5">
            {challenges.map((challenge, idx) => {
              const isRevealed = !!revealed[challenge.id];
              const userStatus = mastery[challenge.id];
              const isMicroScenario = challenge.type === 'micro-scenario';

              return (
                <div
                  key={challenge.id || idx}
                  className={`overflow-hidden rounded-2xl border transition-all ${
                    userStatus === 'mastered'
                      ? 'border-emerald-500/50 bg-emerald-500/[0.03] shadow-sm'
                      : userStatus === 'review'
                        ? 'border-amber-500/50 bg-amber-500/[0.03]'
                        : 'border-fd-border/80 bg-fd-card'
                  }`}
                >
                  {/* Challenge Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-fd-border/60 bg-fd-muted/30 px-4 py-3 sm:px-5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                          isMicroScenario
                            ? 'border border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-400'
                            : 'border border-indigo-500/40 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                        }`}
                      >
                        {isMicroScenario
                          ? isVi ? '🚨 Sự cố thực tế' : '🚨 Production Outage'
                          : isVi ? '🎯 Tư duy cốt lõi' : '🎯 Mental Model'}
                      </span>
                      <h3 className="text-sm font-semibold text-fd-foreground">
                        {challenge.title}
                      </h3>
                    </div>

                    {userStatus && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          userStatus === 'mastered'
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                            : 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                        }`}
                      >
                        {userStatus === 'mastered'
                          ? isVi ? '✓ Đã nắm vững' : '✓ Mastered'
                          : isVi ? '↺ Cần ôn tập' : '↺ Review needed'}
                      </span>
                    )}
                  </div>

                  {/* Challenge Body */}
                  <div className="space-y-4 p-4 sm:p-5">
                    {/* Scenario */}
                    <div className="space-y-2 text-sm leading-relaxed text-fd-foreground">
                      {challenge.scenario.split('\n\n').map((para, pIdx) => (
                        <p key={pIdx} className="whitespace-pre-line">
                          {para}
                        </p>
                      ))}
                    </div>

                    {/* Toggle Reveal Button */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => toggleReveal(challenge.id)}
                        className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                          isRevealed
                            ? 'border border-fd-border bg-fd-muted text-fd-muted-foreground hover:bg-fd-accent'
                            : 'border border-indigo-500/40 bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 dark:text-indigo-400'
                        }`}
                      >
                        <span>{isRevealed ? '🙈' : '💡'}</span>
                        <span>
                          {isRevealed
                            ? isVi ? 'Ẩn phân tích giải pháp' : 'Hide explanation'
                            : isVi ? 'Suy nghĩ kỹ & Lật mở phân tích chuẩn' : 'Think first & Reveal reasoning'}
                        </span>
                      </button>
                    </div>

                    {/* Revealed Reasoning & Self-Assessment */}
                    {isRevealed && (
                      <div className="animate-in fade-in-50 space-y-4 rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-4 duration-200">
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                            {isVi ? 'Phân Tích Kiến Trúc & Cách Khắc Phục Chuẩn:' : 'Architectural Analysis & Correct Pattern:'}
                          </h4>
                          <div className="space-y-2 text-sm leading-relaxed text-fd-foreground">
                            {challenge.reasoning.split('\n\n').map((para, rIdx) => (
                              <p key={rIdx} className="whitespace-pre-line">
                                {para}
                              </p>
                            ))}
                          </div>
                        </div>

                        {/* Self Assessment Rating */}
                        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-indigo-500/20 pt-3 text-xs">
                          <span className="font-semibold text-fd-muted-foreground">
                            {isVi ? 'Tự đánh giá phản xạ của bạn:' : 'Self-assess your intuition:'}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setChallengeMastery(challenge.id, 'mastered')}
                              className={`rounded-lg border px-3 py-1.5 font-semibold transition-all ${
                                userStatus === 'mastered'
                                  ? 'border-emerald-500 bg-emerald-500 text-white'
                                  : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400'
                              }`}
                            >
                              ✓ {isVi ? 'Đã hiểu rõ bản chất' : 'I understood this'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setChallengeMastery(challenge.id, 'review')}
                              className={`rounded-lg border px-3 py-1.5 font-semibold transition-all ${
                                userStatus === 'review'
                                  ? 'border-amber-500 bg-amber-500 text-white'
                                  : 'border-amber-500/40 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 dark:text-amber-400'
                              }`}
                            >
                              ↺ {isVi ? 'Cần đọc lại Deep Dive' : 'Need to review'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : !interactiveLab ? (
        <div className="rounded-2xl border border-dashed border-fd-border p-8 text-center">
          <span className="text-3xl" aria-hidden="true">💡</span>
          <h3 className="mt-2 text-base font-bold text-fd-foreground">
            {isVi ? 'Tất cả thử thách đang được tích hợp vào bài chuyên sâu' : 'Challenges are woven into the Deep Dive'}
          </h3>
          <p className="mt-1 text-xs text-fd-muted-foreground">
            {isVi
              ? 'Bài học này tập trung vào lý thuyết nền tảng và ranh giới thiết kế hệ thống.'
              : 'This lesson focuses on foundational theory and system design trade-offs.'}
          </p>
          {onSwitchToDeepDive && (
            <button
              type="button"
              onClick={onSwitchToDeepDive}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-fd-primary px-4 py-2 text-xs font-semibold text-fd-primary-foreground hover:opacity-90"
            >
              {isVi ? 'Chuyển sang chế độ Chuyên Sâu' : 'Switch to Deep Dive Mode'}
            </button>
          )}
        </div>
      ) : null}
    </section>
  );
}
