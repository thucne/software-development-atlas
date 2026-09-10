import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { appUrl } from './app-path';

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
  await expect(page.getByRole('link', { name: 'About this Atlas' })).toHaveAttribute(
    'href',
    appUrl('/docs/start-here/about'),
  );
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

test('renders page freshness and Atlas maintenance metadata', async ({ page }) => {
  await page.goto(appUrl('/docs/start-here/freshness'));

  const freshness = page.getByRole('region', { name: 'Content freshness' });
  await expect(freshness.getByText('Evergreen', { exact: true })).toBeVisible();
  await expect(freshness.getByText('Verified Aug 19, 2026')).toBeVisible();
  await expect(freshness.getByText('Review target: 365 days')).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Tran Trong Thuc' }),
  ).toHaveAttribute('href', 'https://github.com/thucne');
  await expect(page.getByText(/Atlas last updated Sep 10, 2026/)).toBeVisible();
});

test('renders an About page for the Atlas maintainer', async ({ page }) => {
  await page.goto(appUrl('/docs/start-here/about'));

  await expect(
    page.getByRole('heading', { name: 'About This Atlas' }),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: '@thucne' })).toHaveAttribute(
    'href',
    'https://github.com/thucne',
  );
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

  await figure.getByRole('button', { name: 'Reset zoom' }).click();

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

test('exposes Edit on GitHub as a visible page action', async ({ page }) => {
  await page.goto(appUrl('/docs/start-here/freshness'));

  const githubLink = page.getByRole('link', { name: 'Edit on GitHub' });

  await expect(githubLink).toHaveAttribute(
    'href',
    'https://github.com/thucne/software-development-atlas/edit/main/content/docs/start-here/freshness.mdx',
  );
  await expect(githubLink.locator('svg')).toBeVisible();
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
