export type FreshnessState = 'current' | 'due-soon' | 'overdue';

export type FreshnessResult = {
  state: FreshnessState;
  daysUntilReview: number;
};

const DAY_MS = 24 * 60 * 60 * 1000;

function parseIsoDate(date: string) {
  const [year, month, day] = date.split('-').map(Number);
  return Date.UTC(year, month - 1, day);
}

function utcDateStart(date: Date) {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

export function getFreshnessState(
  lastVerified: string,
  reviewAfterDays: number,
  now = new Date(),
): FreshnessResult {
  const elapsedDays = Math.floor(
    (utcDateStart(now) - parseIsoDate(lastVerified)) / DAY_MS,
  );
  const daysUntilReview = reviewAfterDays - elapsedDays;

  if (daysUntilReview < 0) {
    return { state: 'overdue', daysUntilReview };
  }

  const dueSoonWindow = Math.max(1, Math.ceil(reviewAfterDays * 0.2));

  if (daysUntilReview <= dueSoonWindow) {
    return { state: 'due-soon', daysUntilReview };
  }

  return { state: 'current', daysUntilReview };
}
