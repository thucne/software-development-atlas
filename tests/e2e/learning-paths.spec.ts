import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('renders Atlas coverage with domain-level gaps', async ({ page }) => {
  await page.goto('/docs/start-here/coverage');

  await expect(
    page.getByRole('heading', { name: 'Atlas Coverage', level: 1 }),
  ).toBeVisible();
  await expect(page.getByText('Web Platform', { exact: true })).toBeVisible();
  await expect(page.getByText(/concepts covered/).first()).toBeVisible();
  await expect(page.getByText('Uncovered', { exact: true }).first()).toBeVisible();
});

test('renders an ordered backend learning path with honest uncovered steps', async ({
  page,
}) => {
  await page.goto('/docs/learning-paths/backend-systems');

  await expect(
    page.getByRole('heading', { name: 'Backend Systems', level: 1 }),
  ).toBeVisible();
  await expect(page.getByText('Backend Request Lifecycle', { exact: true })).toBeVisible();
  await expect(page.getByText('API Design', { exact: true })).toBeVisible();
  await expect(page.getByText('No Atlas content yet').first()).toBeVisible();
});

test('exposes Learning Paths in documentation navigation', async ({ page }) => {
  await page.goto('/docs');

  await expect(
    page.locator('a[href="/docs/learning-paths"]').first(),
  ).toBeVisible();
});

test('learning path page has no serious or critical accessibility violations', async ({
  page,
}) => {
  await page.goto('/docs/learning-paths/backend-systems');

  const results = await new AxeBuilder({ page }).analyze();
  const serious = results.violations.filter((violation) =>
    ['serious', 'critical'].includes(violation.impact ?? ''),
  );

  expect(serious).toEqual([]);
});
