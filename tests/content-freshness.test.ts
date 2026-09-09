import { describe, expect, it } from 'vitest';
import { getFreshnessState } from '@/lib/content/freshness';

const now = new Date('2026-09-09T12:00:00Z');

describe('content freshness', () => {
  it('keeps content current when it is comfortably inside the review window', () => {
    expect(getFreshnessState('2026-09-01', 180, now)).toMatchObject({
      state: 'current',
      daysUntilReview: 172,
    });
  });

  it('marks content due soon during the final 20 percent of its review window', () => {
    expect(getFreshnessState('2026-04-01', 180, now)).toMatchObject({
      state: 'due-soon',
      daysUntilReview: 19,
    });
  });

  it('marks content overdue after its review window passes', () => {
    expect(getFreshnessState('2026-01-01', 180, now)).toMatchObject({
      state: 'overdue',
      daysUntilReview: -71,
    });
  });
});
