import { describe, expect, it } from 'vitest';
import {
  buildConcurrentSchedule,
  buildSequentialSchedule,
  calculateTimeSavedMs,
  DEFAULT_TASK_DURATIONS,
  MAX_TASK_DURATION_MS,
  MIN_TASK_DURATION_MS,
} from '@/lib/learning/async-schedule';

describe('buildSequentialSchedule', () => {
  it('starts each task when the previous task ends', () => {
    expect(buildSequentialSchedule({ A: 800, B: 400, C: 300 })).toEqual({
      segments: [
        { id: 'A', startMs: 0, durationMs: 800, endMs: 800 },
        { id: 'B', startMs: 800, durationMs: 400, endMs: 1200 },
        { id: 'C', startMs: 1200, durationMs: 300, endMs: 1500 },
      ],
      totalMs: 1500,
    });
  });

  it('handles the allowed minimum duration', () => {
    expect(
      buildSequentialSchedule({
        A: MIN_TASK_DURATION_MS,
        B: MIN_TASK_DURATION_MS,
        C: MIN_TASK_DURATION_MS,
      }).totalMs,
    ).toBe(MIN_TASK_DURATION_MS * 3);
  });
});

describe('buildConcurrentSchedule', () => {
  it('starts all independent tasks at zero and uses the longest task as total', () => {
    expect(buildConcurrentSchedule({ A: 800, B: 400, C: 300 })).toEqual({
      segments: [
        { id: 'A', startMs: 0, durationMs: 800, endMs: 800 },
        { id: 'B', startMs: 0, durationMs: 400, endMs: 400 },
        { id: 'C', startMs: 0, durationMs: 300, endMs: 300 },
      ],
      totalMs: 800,
    });
  });

  it('handles the allowed maximum duration', () => {
    expect(
      buildConcurrentSchedule({
        A: MAX_TASK_DURATION_MS,
        B: MAX_TASK_DURATION_MS,
        C: MAX_TASK_DURATION_MS,
      }).totalMs,
    ).toBe(MAX_TASK_DURATION_MS);
  });
});

describe('calculateTimeSavedMs', () => {
  it('returns the difference between sequential and concurrent totals', () => {
    const sequential = buildSequentialSchedule(DEFAULT_TASK_DURATIONS);
    const concurrent = buildConcurrentSchedule(DEFAULT_TASK_DURATIONS);

    expect(calculateTimeSavedMs(sequential, concurrent)).toBe(700);
  });
});
