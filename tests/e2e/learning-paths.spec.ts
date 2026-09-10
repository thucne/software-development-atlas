import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { appUrl } from './app-path';

test('renders Atlas coverage with domain-level gaps', async ({ page }) => {
  await page.goto(appUrl('/docs/start-here/coverage'));

  await expect(
    page.getByRole('heading', { name: 'Atlas Coverage', level: 1 }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Web Platform', level: 3 }),
  ).toBeVisible();
  await expect(page.getByText(/concepts covered/).first()).toBeVisible();
  await expect(page.getByText('Uncovered', { exact: true }).first()).toBeVisible();
});

test('renders an ordered backend learning path with honest uncovered steps', async ({
  page,
}) => {
  await page.goto(appUrl('/docs/learning-paths/backend-systems'));

  await expect(
    page.getByRole('heading', { name: 'Backend Systems', level: 1 }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Backend Request Lifecycle', level: 4 }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'API Design', level: 4 }),
  ).toBeVisible();
  await expect(page.getByText('No Atlas content yet').first()).toBeVisible();
});

test('exposes Learning Paths in documentation navigation', async ({ page }) => {
  await page.goto(appUrl('/docs'));

  await expect(
    page.getByText('Learning Paths', { exact: true }).first(),
  ).toBeVisible();
});

test('learning path page has no serious or critical accessibility violations', async ({
  page,
}) => {
  await page.goto(appUrl('/docs/learning-paths/backend-systems'));

  const results = await new AxeBuilder({ page }).analyze();
  const serious = results.violations.filter((violation) =>
    ['serious', 'critical'].includes(violation.impact ?? ''),
  );

  expect(serious).toEqual([]);
});
