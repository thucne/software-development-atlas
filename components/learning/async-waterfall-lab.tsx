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
import { usePathname } from 'next/navigation';
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
  displayLabel,
  schedule,
  comparisonTotalMs,
  testId,
  isPlaying,
  isVi,
}: {
  label: 'Sequential' | 'Concurrent';
  displayLabel: string;
  schedule: Schedule;
  comparisonTotalMs: number;
  testId: 'sequential-total' | 'concurrent-total';
  isPlaying: boolean;
  isVi?: boolean;
}) {
  return (
    <section className="space-y-4" aria-label={`${label} schedule`}>
      <h4 className="font-semibold">{displayLabel}</h4>
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
              <th scope="col" className="py-2 text-left">{isVi ? 'Tác vụ' : 'Task'}</th>
              <th scope="col" className="py-2 text-right">{isVi ? 'Bắt đầu' : 'Start'}</th>
              <th scope="col" className="py-2 text-right">{isVi ? 'Thời lượng' : 'Duration'}</th>
              <th scope="col" className="py-2 text-right">{isVi ? 'Kết thúc' : 'End'}</th>
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
        <strong>{isVi ? (label === 'Sequential' ? 'Tổng thời gian tuần tự:' : 'Tổng thời gian đồng thời:') : `${label} total:`}</strong>{' '}
        <span data-testid={testId} className="tabular-nums">
          {schedule.totalMs}ms
        </span>
      </p>
    </section>
  );
}

export function AsyncWaterfallLab({ locale }: { locale?: 'en' | 'vi' } = {}) {
  const pathname = usePathname() || '';
  const isVi = locale === 'vi' || pathname.includes('/vi/docs') || pathname.endsWith('/vi');
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
        title={isVi ? 'Phòng thực hành Thác nước bất đồng bộ' : 'Async Waterfall Lab'}
        description={
          isVi ? (
            <>
              Thay đổi thời lượng để đối chiếu thời gian chờ tuần tự so với công việc bất đồng bộ độc lập chạy đồng thời. Cả hai đồ thị đều dùng cùng một thang thời gian.
            </>
          ) : (
            <>
              Change the durations to compare sequential waiting with independent
              asynchronous work that starts together. Both timelines use the same
              elapsed-time scale.
            </>
          )
        }
      >
        <fieldset className="grid gap-4 sm:grid-cols-3">
          <legend className="sr-only">{isVi ? 'Thời lượng tác vụ' : 'Task durations'}</legend>
          {TASK_IDS.map((id) => (
            <label key={id} className="grid gap-2 font-medium">
              {isVi ? `Thời lượng Tác vụ ${id}` : `Task ${id} duration`}
              <span className="flex items-center gap-2">
                <input
                  aria-label={isVi ? `Thời lượng Tác vụ ${id} tính bằng mili-giây` : `Task ${id} duration in milliseconds`}
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
            {isPlaying
              ? (isVi ? 'Chạy lại đồ thị' : 'Replay timelines')
              : (isVi ? 'Chạy mô phỏng đồ thị' : 'Play timelines')}
          </button>
          <button
            type="button"
            onClick={reset}
            className="rounded-md border px-3 py-2 font-medium hover:bg-fd-muted focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {isVi ? 'Đặt lại' : 'Reset'}
          </button>
        </LabControls>

        <div key={playbackKey} className="grid gap-8 lg:grid-cols-2">
          <SchedulePanel
            label="Sequential"
            displayLabel={isVi ? 'Xử lý tuần tự (Sequential)' : 'Sequential'}
            schedule={sequential}
            comparisonTotalMs={comparisonTotalMs}
            testId="sequential-total"
            isPlaying={isPlaying}
            isVi={isVi}
          />
          <SchedulePanel
            label="Concurrent"
            displayLabel={isVi ? 'Xử lý đồng thời (Concurrent)' : 'Concurrent'}
            schedule={concurrent}
            comparisonTotalMs={comparisonTotalMs}
            testId="concurrent-total"
            isPlaying={isPlaying}
            isVi={isVi}
          />
        </div>

        <LiveStatus>
          {isVi ? (
            <>
              Với thời lượng này, việc chạy đồng thời các tác vụ độc lập tiết kiệm được{' '}
              <strong data-testid="time-saved" className="tabular-nums">
                {savedMs}ms
              </strong>{' '}
              thời gian chờ tổng thể.
            </>
          ) : (
            <>
              With these durations, starting independent work together saves{' '}
              <strong data-testid="time-saved" className="tabular-nums">
                {savedMs}ms
              </strong>{' '}
              of elapsed time.
            </>
          )}
        </LiveStatus>
      </LabShell>
    </>
  );
}
