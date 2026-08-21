'use client';

import {
  LabControls,
  LabShell,
  LiveStatus,
} from '@/components/learning/primitives';
import {
  buildConcurrentSchedule,
  buildSequentialSchedule,
  calculateTimeSavedMs,
  DEFAULT_TASK_DURATIONS,
  MAX_TASK_DURATION_MS,
  MIN_TASK_DURATION_MS,
  TASK_DURATION_STEP_MS,
  type Schedule,
  type TaskDurations,
  type TaskId,
} from '@/lib/learning/async-schedule';
import { useEffect, useMemo, useRef, useState } from 'react';

const TASK_IDS: TaskId[] = ['A', 'B', 'C'];

function clampTaskDuration(value: number) {
  return Math.min(
    MAX_TASK_DURATION_MS,
    Math.max(MIN_TASK_DURATION_MS, value),
  );
}

function Timeline({
  schedule,
  comparisonTotalMs,
  isPlaying,
}: {
  schedule: Schedule;
  comparisonTotalMs: number;
  isPlaying: boolean;
}) {
  return (
    <div aria-hidden="true" className="space-y-2">
      {schedule.segments.map((segment) => {
        const startPercent = (segment.startMs / comparisonTotalMs) * 100;
        const widthPercent = (segment.durationMs / comparisonTotalMs) * 100;

        return (
          <div key={segment.id} className="grid grid-cols-[2rem_1fr] items-center gap-2">
            <span className="text-xs font-semibold">{segment.id}</span>
            <div className="relative h-8 overflow-hidden rounded-md bg-fd-muted">
              <div
                className="atlas-timeline-bar absolute inset-y-1 rounded border border-fd-primary/40 bg-fd-primary/20"
                data-playing={isPlaying ? 'true' : 'false'}
                style={
                  {
                    left: `${startPercent}%`,
                    width: `${widthPercent}%`,
                    '--atlas-delay': `${segment.startMs}ms`,
                    '--atlas-duration': `${segment.durationMs}ms`,
                  } as React.CSSProperties
                }
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SchedulePanel({
  label,
  schedule,
  comparisonTotalMs,
  testId,
  isPlaying,
}: {
  label: 'Sequential' | 'Concurrent';
  schedule: Schedule;
  comparisonTotalMs: number;
  testId: 'sequential-total' | 'concurrent-total';
  isPlaying: boolean;
}) {
  return (
    <section className="space-y-4" aria-label={`${label} schedule`}>
      <h4 className="font-semibold">{label}</h4>
      <Timeline
        schedule={schedule}
        comparisonTotalMs={comparisonTotalMs}
        isPlaying={isPlaying}
      />
      <div
        className="overflow-x-auto focus-visible:outline-2 focus-visible:outline-offset-2"
        role="region"
        aria-label={`${label} timing table`}
        tabIndex={0}
      >
        <table className="w-full min-w-80 text-sm">
          <thead>
            <tr className="border-b">
              <th scope="col" className="py-2 text-left">Task</th>
              <th scope="col" className="py-2 text-right">Start</th>
              <th scope="col" className="py-2 text-right">Duration</th>
              <th scope="col" className="py-2 text-right">End</th>
            </tr>
          </thead>
          <tbody>
            {schedule.segments.map((segment) => (
              <tr key={segment.id} className="border-b last:border-b-0">
                <th scope="row" className="py-2 text-left">{segment.id}</th>
                <td className="py-2 text-right tabular-nums">{segment.startMs}ms</td>
                <td className="py-2 text-right tabular-nums">{segment.durationMs}ms</td>
                <td className="py-2 text-right tabular-nums">{segment.endMs}ms</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        <strong>{label} total:</strong>{' '}
        <span data-testid={testId} className="tabular-nums">
          {schedule.totalMs}ms
        </span>
      </p>
    </section>
  );
}

export function AsyncWaterfallLab() {
  const [durations, setDurations] = useState<TaskDurations>(
    DEFAULT_TASK_DURATIONS,
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackKey, setPlaybackKey] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sequential = useMemo(
    () => buildSequentialSchedule(durations),
    [durations],
  );
  const concurrent = useMemo(
    () => buildConcurrentSchedule(durations),
    [durations],
  );
  const comparisonTotalMs = Math.max(sequential.totalMs, concurrent.totalMs);
  const savedMs = calculateTimeSavedMs(sequential, concurrent);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  function updateDuration(id: TaskId, value: number) {
    if (!Number.isFinite(value)) return;

    setDurations((current) => ({
      ...current,
      [id]: clampTaskDuration(value),
    }));
  }

  function stopPlayback() {
    setIsPlaying(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }

  function reset() {
    stopPlayback();
    setDurations(DEFAULT_TASK_DURATIONS);
    setPlaybackKey((key) => key + 1);
  }

  function play() {
    stopPlayback();
    setPlaybackKey((key) => key + 1);
    setIsPlaying(true);
    timeoutRef.current = setTimeout(() => {
      setIsPlaying(false);
      timeoutRef.current = null;
    }, comparisonTotalMs);
  }

  return (
    <>
      <style>{`
        @keyframes atlas-timeline-reveal {
          from { transform: scaleX(0); opacity: 0.45; }
          to { transform: scaleX(1); opacity: 1; }
        }

        @media (prefers-reduced-motion: no-preference) {
          .atlas-timeline-bar[data-playing='true'] {
            transform-origin: left center;
            animation-name: atlas-timeline-reveal;
            animation-duration: var(--atlas-duration);
            animation-delay: var(--atlas-delay);
            animation-timing-function: linear;
            animation-fill-mode: both;
          }
        }
      `}</style>

      <LabShell
        title="Async Waterfall Lab"
        description={
          <>
            Change the durations to compare sequential waiting with independent
            asynchronous work that starts together. Both timelines use the same
            elapsed-time scale.
          </>
        }
      >
        <fieldset className="grid gap-4 sm:grid-cols-3">
          <legend className="sr-only">Task durations</legend>
          {TASK_IDS.map((id) => (
            <label key={id} className="grid gap-2 font-medium">
              Task {id} duration
              <span className="flex items-center gap-2">
                <input
                  aria-label={`Task ${id} duration in milliseconds`}
                  type="number"
                  inputMode="numeric"
                  min={MIN_TASK_DURATION_MS}
                  max={MAX_TASK_DURATION_MS}
                  step={TASK_DURATION_STEP_MS}
                  value={durations[id]}
                  onChange={(event) =>
                    updateDuration(id, event.currentTarget.valueAsNumber)
                  }
                  className="w-28 rounded-md border bg-transparent px-3 py-2 tabular-nums"
                />
                <span aria-hidden="true">ms</span>
              </span>
            </label>
          ))}
        </fieldset>

        <LabControls>
          <button
            type="button"
            onClick={play}
            className="rounded-md border px-3 py-2 font-medium hover:bg-fd-muted focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {isPlaying ? 'Replay' : 'Play'} timelines
          </button>
          <button
            type="button"
            onClick={reset}
            className="rounded-md border px-3 py-2 font-medium hover:bg-fd-muted focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Reset
          </button>
        </LabControls>

        <div key={playbackKey} className="grid gap-8 lg:grid-cols-2">
          <SchedulePanel
            label="Sequential"
            schedule={sequential}
            comparisonTotalMs={comparisonTotalMs}
            testId="sequential-total"
            isPlaying={isPlaying}
          />
          <SchedulePanel
            label="Concurrent"
            schedule={concurrent}
            comparisonTotalMs={comparisonTotalMs}
            testId="concurrent-total"
            isPlaying={isPlaying}
          />
        </div>

        <LiveStatus>
          With these durations, starting independent work together saves{' '}
          <strong data-testid="time-saved" className="tabular-nums">
            {savedMs}ms
          </strong>{' '}
          of elapsed time.
        </LiveStatus>
      </LabShell>
    </>
  );
}
