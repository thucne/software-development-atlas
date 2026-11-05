import { expect } from 'vitest';

/**
 * A release can remain in the rolling changelog after its verification date moves
 * forward. Verify the date is valid and at least as recent as that release, rather
 * than requiring an exact month that will break when the article is re-verified.
 */
export function expectVerifiedAtOrAfter(source: string, earliest: string) {
  const date = source.match(/^lastVerified:\s*(\d{4}-\d{2}-\d{2})$/m)?.[1];
  expect(date, 'changelog must declare a lastVerified date').toBeDefined();
  const parsed = Date.parse(`${date}T00:00:00.000Z`);
  expect(Number.isFinite(parsed), 'lastVerified must be a valid date').toBe(true);
  expect(new Date(parsed).toISOString().slice(0, 10)).toBe(date);
  expect(date! >= earliest, `lastVerified must be on or after ${earliest}`).toBe(true);
}

export function expectFooterTracksChangelog(
  metadataSource: string,
  changelogSource: string,
  docsShellSpec: string,
) {
  const footerDate = metadataSource.match(/atlasLastUpdated = '(\d{4}-\d{2}-\d{2})'/)?.[1];
  const changelogDate = changelogSource.match(/^lastVerified:\s*(\d{4}-\d{2}-\d{2})$/m)?.[1];
  expect(footerDate, 'site footer needs an ISO date').toBeDefined();
  expect(footerDate).toBe(changelogDate);

  const [year, month, day] = footerDate!.split('-').map(Number);
  const label = new Date(Date.UTC(year, month - 1, day)).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
  expect(docsShellSpec).toContain(`Atlas last updated ${label}`);
}
