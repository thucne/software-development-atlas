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

test('exposes the GitHub page action', async ({ page }) => {
  await page.goto(appUrl('/docs/start-here/freshness'));

  const expectedPrefix =
    'https://github.com/thucne/software-development-atlas/edit/main/' +
    'content/docs/';

  let githubLink = page.locator(`a[href^="${expectedPrefix}"]`);

  if ((await githubLink.count()) === 0) {
    const optionButton = page.getByRole('button', {
      name: /options|more|open/i,
    }).last();
    await optionButton.click();
    githubLink = page.locator(`a[href^="${expectedPrefix}"]`);
  }

  await expect(githubLink.first()).toBeVisible();
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
