'use client';

import { Fragment, useEffect, useId, useState } from 'react';
import type {
  InteractivePhaseIllustrationMedia,
  LocalizedPhaseText,
  PhaseNodeTone,
} from '@/components/mdx/atlas-interactive-illustrations';

type Locale = 'en' | 'vi';

const toneClass: Record<PhaseNodeTone, string> = {
  accent: 'border-fd-primary/35 bg-fd-primary/10',
  success: 'border-emerald-500/35 bg-emerald-500/10',
  warning: 'border-amber-500/40 bg-amber-500/10',
  danger: 'border-red-500/40 bg-red-500/10',
  muted: 'border-fd-border bg-fd-muted/35',
};

function localized(value: LocalizedPhaseText, locale: Locale) {
  return value[locale];
}

export function AtlasPhaseWalkthrough({
  id,
  definition,
  locale,
}: {
  id: string;
  definition: InteractivePhaseIllustrationMedia;
  locale: Locale;
}) {
  const labelId = useId();
  const summaryId = useId();
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [playing, setPlaying] = useState(true);

  const phase = definition.phases[phaseIndex] ?? definition.phases[0];
  const autoPlayMs = definition.autoPlayMs ?? 2400;

  useEffect(() => {
    if (!playing || definition.phases.length < 2) return;

    const timer = window.setTimeout(() => {
      setPhaseIndex((current) => (current + 1) % definition.phases.length);
    }, autoPlayMs);

    return () => window.clearTimeout(timer);
  }, [playing, phaseIndex, autoPlayMs, definition.phases.length]);

  const goPrev = () => {
    setPlaying(false);
    setPhaseIndex((current) =>
      current === 0 ? definition.phases.length - 1 : current - 1,
    );
  };

  const goNext = () => {
    setPlaying(false);
    setPhaseIndex((current) => (current + 1) % definition.phases.length);
  };

  const backLabel = locale === 'vi' ? 'Trước' : 'Back';
  const nextLabel = locale === 'vi' ? 'Sau' : 'Next';
  const pauseLabel = locale === 'vi' ? 'Tạm dừng' : 'Pause';
  const playLabel = locale === 'vi' ? 'Phát' : 'Play';
  const phaseGroupLabel = locale === 'vi' ? 'Các pha minh họa' : 'Illustration phases';

  return (
    <figure
      data-atlas-illustration={id}
      data-atlas-illustration-medium="interactive-phases"
      aria-labelledby={labelId}
      className="my-7 min-w-0 overflow-hidden rounded-2xl border border-fd-border bg-gradient-to-br from-fd-card to-fd-muted/25 shadow-sm"
    >
      <div className="border-b border-fd-border px-4 py-3 sm:px-5">
        <div id={labelId} className="text-sm font-semibold text-fd-foreground">
          {localized(definition.title, locale)}
        </div>
      </div>

      <div className="space-y-4 p-4 sm:p-5">
        <div
          role="region"
          aria-label={locale === 'vi' ? 'Sơ đồ theo pha' : 'Phased diagram'}
          className="@container min-w-0 rounded-xl border border-fd-border bg-fd-card/40 p-3 sm:p-4"
        >
          <div className="flex min-w-0 flex-col items-stretch gap-1.5 @[36rem]:flex-row @[36rem]:gap-1">
            {definition.nodes.map((node, index) => {
              const active = phase.activeNodeIds.includes(node.id);
              const edge = phase.edgeNotes?.find((note) => note.afterNodeId === node.id);

              return (
                <Fragment key={node.id}>
                  <div
                    className={`min-w-0 flex-1 break-words rounded-lg border px-2.5 py-2 transition-opacity ${toneClass[node.tone ?? 'muted']} ${
                      active ? 'opacity-100 ring-2 ring-fd-primary/35' : 'opacity-40'
                    }`}
                    data-phase-active={active ? 'true' : 'false'}
                  >
                    <div className="text-xs font-semibold leading-snug text-fd-foreground">
                      {localized(node.label, locale)}
                    </div>
                    <div className="mt-0.5 text-[11px] leading-snug text-fd-muted-foreground">
                      {localized(node.detail, locale)}
                    </div>
                  </div>

                  {index < definition.nodes.length - 1 ? (
                    <div className="flex shrink-0 flex-col items-center justify-center gap-0.5 px-0.5">
                      <div
                        aria-hidden="true"
                        className={`text-sm font-semibold select-none ${
                          edge?.broken
                            ? 'text-red-500 line-through decoration-2'
                            : 'text-fd-muted-foreground'
                        }`}
                      >
                        <span className="@[36rem]:hidden">
                          {edge?.broken ? '↛' : '↓'}
                        </span>
                        <span className="hidden @[36rem]:inline">
                          {edge?.broken ? '↛' : '→'}
                        </span>
                      </div>
                      {edge ? (
                        <div
                          className={`max-w-full break-words text-center text-[10px] leading-tight @[36rem]:max-w-24 ${
                            edge.tone === 'danger'
                              ? 'text-red-500'
                              : edge.tone === 'success'
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : edge.tone === 'warning'
                                  ? 'text-amber-600 dark:text-amber-400'
                                  : 'text-fd-muted-foreground'
                          }`}
                        >
                          {localized(edge.label, locale)}
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </Fragment>
              );
            })}
          </div>
        </div>

        <p
          id={summaryId}
          aria-live="polite"
          className="rounded-lg border border-fd-border bg-fd-muted/20 px-3 py-2 text-sm leading-relaxed text-fd-foreground"
        >
          {localized(phase.summary, locale)}
        </p>

        <div
          role="group"
          aria-label={phaseGroupLabel}
          className="flex flex-wrap gap-2"
        >
          {definition.phases.map((item, index) => {
            const selected = index === phaseIndex;
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={selected}
                onClick={() => {
                  setPlaying(false);
                  setPhaseIndex(index);
                }}
                className={`rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  selected
                    ? 'border-fd-primary/50 bg-fd-primary/15 text-fd-foreground'
                    : 'border-fd-border bg-fd-card text-fd-muted-foreground hover:bg-fd-muted/40'
                }`}
              >
                {localized(item.label, locale)}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={goPrev}
            className="rounded-md border border-fd-border bg-fd-card px-3 py-1.5 text-xs font-medium text-fd-foreground hover:bg-fd-muted/40"
          >
            ◀ {backLabel}
          </button>
          <button
            type="button"
            aria-pressed={playing}
            onClick={() => setPlaying((value) => !value)}
            className="rounded-md border border-fd-border bg-fd-card px-3 py-1.5 text-xs font-medium text-fd-foreground hover:bg-fd-muted/40"
          >
            {playing ? pauseLabel : playLabel}
          </button>
          <button
            type="button"
            onClick={goNext}
            className="rounded-md border border-fd-border bg-fd-card px-3 py-1.5 text-xs font-medium text-fd-foreground hover:bg-fd-muted/40"
          >
            {nextLabel} ▶
          </button>
        </div>
      </div>

      <figcaption className="border-t border-fd-border bg-fd-muted/20 px-4 py-3 text-xs leading-relaxed text-fd-muted-foreground sm:px-5">
        {localized(definition.caption, locale)}
      </figcaption>
    </figure>
  );
}
