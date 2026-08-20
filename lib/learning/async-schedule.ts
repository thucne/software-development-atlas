export type TaskId = 'A' | 'B' | 'C';

export type TaskDurations = Record<TaskId, number>;

export type TimelineSegment = {
  id: TaskId;
  startMs: number;
  durationMs: number;
  endMs: number;
};

export type Schedule = {
  segments: TimelineSegment[];
  totalMs: number;
};

export const MIN_TASK_DURATION_MS = 100;
export const MAX_TASK_DURATION_MS = 2000;
export const TASK_DURATION_STEP_MS = 100;

export const DEFAULT_TASK_DURATIONS: TaskDurations = {
  A: 800,
  B: 400,
  C: 300,
};

const TASK_IDS: TaskId[] = ['A', 'B', 'C'];

export function buildSequentialSchedule(
  durations: TaskDurations,
): Schedule {
  let cursorMs = 0;

  const segments = TASK_IDS.map((id) => {
    const durationMs = durations[id];
    const startMs = cursorMs;
    const endMs = startMs + durationMs;
    cursorMs = endMs;

    return { id, startMs, durationMs, endMs };
  });

  return { segments, totalMs: cursorMs };
}

export function buildConcurrentSchedule(
  durations: TaskDurations,
): Schedule {
  const segments = TASK_IDS.map((id) => ({
    id,
    startMs: 0,
    durationMs: durations[id],
    endMs: durations[id],
  }));

  return {
    segments,
    totalMs: Math.max(...segments.map((segment) => segment.endMs)),
  };
}

export function calculateTimeSavedMs(
  sequential: Schedule,
  concurrent: Schedule,
): number {
  return Math.max(0, sequential.totalMs - concurrent.totalMs);
}
