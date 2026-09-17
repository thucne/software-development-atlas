'use client';

import { useState } from 'react';
import type { LessonDiagram } from '@/lib/content/extract-lesson-modes';
import { Mermaid } from '@/components/mdx/mermaid';
import { AtlasIllustration } from '@/components/mdx/atlas-illustration-runtime';
import type { AtlasIllustrationId } from '@/components/mdx/atlas-illustration';

interface VisualShowcaseProps {
  diagrams: LessonDiagram[];
  locale?: string;
  onSwitchToDeepDive?: () => void;
}

export function VisualShowcase({
  diagrams,
  locale = 'en',
  onSwitchToDeepDive,
}: VisualShowcaseProps) {
  const isVi = locale === 'vi';
  const [fullscreenDiagram, setFullscreenDiagram] = useState<LessonDiagram | null>(null);

  return (
    <section
      aria-label={isVi ? 'Bộ sưu tập mô hình trực quan' : 'Visual Showcase Gallery'}
      className="space-y-6"
    >
      {/* Intro Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-fd-card/70 p-4">
        <div className="space-y-0.5">
          <h2 className="text-base font-bold text-fd-foreground">
            {isVi ? '🗺️ Bản Đồ & Sơ Đồ Kiến Trúc Trực Quan' : '🗺️ Visual Architecture & Diagram Map'}
          </h2>
          <p className="text-xs text-fd-muted-foreground">
            {isVi
              ? `Tổng hợp ${diagrams.length} sơ đồ luồng dữ liệu, ranh giới hệ thống và minh họa kiến trúc`
              : `Curated collection of ${diagrams.length} system boundary flowcharts and architecture diagrams`}
          </p>
        </div>
        {onSwitchToDeepDive && (
          <button
            type="button"
            onClick={onSwitchToDeepDive}
            className="rounded-lg border px-3 py-1.5 text-xs font-semibold text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-foreground"
          >
            {isVi ? 'Xem phân tích chi tiết →' : 'Read Deep Dive →'}
          </button>
        )}
      </div>

      {/* Diagrams List */}
      {diagrams.length > 0 ? (
        <div className="grid gap-6">
          {diagrams.map((diagram, idx) => (
            <div
              key={diagram.id || idx}
              className="overflow-hidden rounded-2xl border border-fd-border/80 bg-fd-card shadow-sm transition-all"
            >
              {/* Diagram Card Header */}
              <div className="flex items-center justify-between border-b border-fd-border/60 bg-fd-muted/30 px-4 py-3 sm:px-5">
                <div className="flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-full bg-fd-primary/10 text-xs font-bold text-fd-primary">
                    {idx + 1}
                  </span>
                  <h3 className="text-sm font-semibold text-fd-foreground">
                    {diagram.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setFullscreenDiagram(diagram)}
                  aria-label={isVi ? 'Xem toàn màn hình' : 'View Fullscreen'}
                  title={isVi ? 'Xem toàn màn hình' : 'View Fullscreen'}
                  className="rounded-md p-1.5 text-xs font-medium text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-foreground"
                >
                  <span aria-hidden="true">⛶</span> {isVi ? 'Phóng to' : 'Zoom'}
                </button>
              </div>

              {/* Diagram Content */}
              <div className="p-4 sm:p-6">
                {diagram.type === 'mermaid' && diagram.code && (
                  <div className="flex justify-center overflow-x-auto">
                    <Mermaid chart={diagram.code} />
                  </div>
                )}
                {diagram.type === 'illustration' && diagram.illustrationId && (
                  <div className="flex justify-center">
                    <AtlasIllustration id={diagram.illustrationId as AtlasIllustrationId} locale={locale} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-fd-border p-8 text-center text-fd-muted-foreground">
          <p className="text-sm">
            {isVi
              ? 'Bài học này không có sơ đồ Mermaid riêng biệt. Bạn có thể xem mô hình tư duy trong Thẻ Tóm Tắt hoặc quay lại bài viết Chuyên Sâu.'
              : 'This lesson focuses on code mechanics without separate diagrams. Check the Flash Brief or return to the Deep Dive.'}
          </p>
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {fullscreenDiagram && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setFullscreenDiagram(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-5xl overflow-auto rounded-2xl border border-fd-border bg-fd-background p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-fd-foreground">
                {fullscreenDiagram.title}
              </h3>
              <button
                type="button"
                onClick={() => setFullscreenDiagram(null)}
                aria-label={isVi ? 'Đóng phóng to' : 'Close Zoom'}
                className="rounded-md p-1.5 text-sm font-bold text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-foreground"
              >
                ✕
              </button>
            </div>
            <div className="flex justify-center overflow-auto p-2">
              {fullscreenDiagram.type === 'mermaid' && fullscreenDiagram.code && (
                <Mermaid chart={fullscreenDiagram.code} />
              )}
              {fullscreenDiagram.type === 'illustration' && fullscreenDiagram.illustrationId && (
                <AtlasIllustration id={fullscreenDiagram.illustrationId as AtlasIllustrationId} locale={locale} />
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
