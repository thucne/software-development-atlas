import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('exposes Engineering Judgment in docs navigation', async ({ page }) => {
  await page.goto('/docs');

  await expect(
    page.getByText('Engineering Judgment', { exact: true }).first(),
  ).toBeVisible();
});

test('renders a decision guide with an explicit comparison and conditional guidance', async ({
  page,
}) => {
  await page.goto(
    '/docs/engineering-judgment/decision-guides/csr-vs-ssr-vs-ssg',
  );

  await expect(
    page.getByRole('heading', { name: 'CSR vs SSR vs SSG', level: 1 }),
  ).toBeVisible();
  await expect(
    page.getByRole('table', { name: 'CSR vs SSR vs SSG decision matrix' }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Practical heuristic' }),
  ).toBeVisible();
});

test('representative decision guide has no serious or critical accessibility violations', async ({
  page,
}) => {
  await page.goto(
    '/docs/engineering-judgment/decision-guides/csr-vs-ssr-vs-ssg',
  );

  const results = await new AxeBuilder({ page }).analyze();
  const serious = results.violations.filter((violation) =>
    ['serious', 'critical'].includes(violation.impact ?? ''),
  );

  expect(serious).toEqual([]);
});

test('renders the reliable checkout walkthrough across failure and observability boundaries', async ({
  page,
}) => {
  await page.goto(
    '/docs/engineering-judgment/architecture-walkthroughs/reliable-checkout',
  );

  await expect(
    page.getByRole('heading', { name: 'Reliable Checkout Walkthrough', level: 1 }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Failure modes' }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Observability' }),
  ).toBeVisible();
  await expect(page.getByText('transactional outbox', { exact: false }).first()).toBeVisible();
});

test('reliable checkout walkthrough has no serious or critical accessibility violations', async ({
  page,
}) => {
  await page.goto(
    '/docs/engineering-judgment/architecture-walkthroughs/reliable-checkout',
  );

  const results = await new AxeBuilder({ page }).analyze();
  const serious = results.violations.filter((violation) =>
    ['serious', 'critical'].includes(violation.impact ?? ''),
  );

  expect(serious).toEqual([]);
});
