import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { appUrl } from './app-path';

async function fixBrowserClock(page: Page, iso: string) {
  const fixedNow = Date.parse(iso);

  await page.addInitScript((timestamp) => {
    Date.now = () => timestamp;
  }, fixedNow);
}

test('renders the docs shell and Start Here navigation', async ({ page }) => {
  await page.goto(appUrl('/docs'));

  await expect(
    page.getByRole('heading', { name: 'Software Development Atlas' }),
  ).toBeVisible();
  await expect(
    page
      .locator(`a[href="${appUrl('/docs/start-here/how-to-use-the-atlas')}"]`)
      .first(),
  ).toBeVisible();
  await expect(
    page.locator(`a[href="${appUrl('/docs/start-here/freshness')}"]`).first(),
  ).toBeVisible();
  await expect(
    page.locator(`a[href="${appUrl('/docs/start-here/about')}"]`).first(),
  ).toBeVisible();
});

test('finds a lesson through local documentation search', async ({ page }) => {
  await page.goto(appUrl('/docs'));

  const searchTrigger = page.getByRole('button', { name: /search/i }).first();
  await searchTrigger.click();
  await page.getByRole('textbox').fill('freshness');
  await expect(
    page.getByText('Content Freshness', { exact: true }),
  ).toBeVisible();
});

test('renders a Mermaid diagram on the usage guide', async ({ page }) => {
  await page.goto(appUrl('/docs/start-here/how-to-use-the-atlas'));

  await expect(
    page.getByRole('figure', { name: 'Mermaid diagram' }),
  ).toBeVisible();
});

test('lets readers zoom dense Mermaid diagrams and reset the view', async ({
  page,
}) => {
  await page.goto(appUrl('/docs/start-here/software-engineering-map'));

  const figure = page.getByRole('figure', { name: 'Mermaid diagram' });
  const svg = figure.locator('svg');

  await expect(svg).toBeVisible();
  await expect(figure.getByRole('button', { name: 'Zoom in' })).toBeVisible();
  await expect(figure.getByRole('button', { name: 'Zoom out' })).toBeVisible();
  await expect(figure.getByRole('button', { name: 'Reset zoom' })).toBeVisible();

  const widthBefore = await svg.evaluate((element) =>
    element.getBoundingClientRect().width,
  );

  await figure.getByRole('button', { name: 'Zoom in' }).click();

  await expect
    .poll(() =>
      svg.evaluate((element) => element.getBoundingClientRect().width),
    )
    .toBeGreaterThan(widthBefore);

  await figure.getByRole('button', { name: 'Reset zoom' })).click();

  await expect
    .poll(() =>
      svg.evaluate((element) => element.getBoundingClientRect().width),
    )
    .toBeCloseTo(widthBefore, 0);
});

test('serves clean Markdown for a docs page', async ({ request }) => {
  const response = await request.get(appUrl('/docs/start-here/freshness.md'));

  expect(response.ok()).toBeTruthy();
  expect(response.headers()['content-type']).toContain('text/markdown');
  expect(await response.text()).toContain('# Content Freshness');
});

test('shows a visible GitHub edit action for the canonical MDX file', async ({
  page,
}) => {
  await page.goto(appUrl('/docs/start-here/freshness'));

  await expect(
    page.getByRole('link', { name: 'Edit on GitHub' }),
  ).toHaveAttribute(
    'href',
    'https://github.com/thucne/software-development-atlas/edit/main/' +
      'content/docs/start-here/freshness.mdx',
  );
});

test('shows lesson freshness, Atlas verification, and maintainer attribution', async ({
  page,
}) => {
  await fixBrowserClock(page, '2026-09-09T12:00:00.000Z');
  await page.goto(appUrl('/docs/start-here/freshness'));

  const freshness = page.getByLabel('Lesson freshness');

  await expect(freshness).toContainText('Evergreen');
  await expect(freshness).toContainText('Verified Aug 19, 2026');
  await expect(freshness).toContainText('Review target 365 days');
  await expect(freshness).toContainText('Current');
  await expect(page.getByText('Atlas latest verification Sep 9, 2026')).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Tran Trong Thuc (@thucne)' }),
  ).toHaveAttribute('href', 'https://github.com/thucne');
});

test('warns when a lesson is approaching its review target', async ({ page }) => {
  await fixBrowserClock(page, '2027-08-01T12:00:00.000Z');
  await page.goto(appUrl('/docs/start-here/freshness'));

  await expect(page.getByLabel('Lesson freshness')).toContainText(
    'Review due soon',
  );
});

test('warns when lesson verification is overdue', async ({ page }) => {
  await fixBrowserClock(page, '2027-08-20T12:00:00.000Z');
  await page.goto(appUrl('/docs/start-here/freshness'));

  await expect(page.getByLabel('Lesson freshness')).toContainText(
    'Verification overdue',
  );
});

test('has no automatically detectable serious accessibility violations', async ({
  page,
}) => {
  await page.goto(appUrl('/docs/start-here/how-to-use-the-atlas'));

  const results = await new AxeBuilder({ page }).analyze();
  const serious = results.violations.filter((violation) =>
    ['serious', 'critical'].includes(violation.impact ?? ''),
  );

  expect(serious).toEqual([]);
});
