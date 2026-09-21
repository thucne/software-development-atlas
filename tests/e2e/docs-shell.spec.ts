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
  await expect(page.getByText(/Atlas last updated Sep 21, 2026/)).toBeVisible();
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

test('constrains small Mermaid diagrams to their natural width instead of blowing up to full width', async ({
  page,
}) => {
  await page.goto(
    appUrl('/docs/security/threat-modeling-and-least-privilege'),
  );

  const figures = page.getByRole('figure', { name: 'Mermaid diagram' });
  await expect(figures.first()).toBeVisible();

  // The 3rd diagram is the small 4-node Deny-by-default diagram
  const denyByDefaultFigure = figures.nth(2);
  await expect(denyByDefaultFigure).toBeVisible();

  const viewport = denyByDefaultFigure.locator('[data-diagram-viewport]');
  const viewportWidth = await viewport.evaluate(
    (el) => el.getBoundingClientRect().width,
  );

  const svg = denyByDefaultFigure.locator('svg');
  const svgWidth = await svg.evaluate((el) => el.getBoundingClientRect().width);

  // The compact diagram should be comfortably smaller than the article viewport width
  expect(svgWidth).toBeLessThan(viewportWidth * 0.85);
});

test('serves clean Markdown for a docs page', async ({ request }) => {
  const response = await request.get(appUrl('/docs/start-here/freshness.md'));

  expect(response.ok()).toBeTruthy();
  expect(response.headers()['content-type']).toContain('text/markdown');
  expect(await response.text()).toContain('# Content Freshness');
});

test('uses canonical /learn URLs and localized prompts in AI page actions', async ({
  page,
}) => {
  await page.goto(appUrl('/docs/backend-engineering/oauth-and-oidc'));

  await page.locator('summary').filter({ hasText: /^Open$/ }).click();

  const englishChatGpt = page.getByRole('link', { name: 'Open in ChatGPT' });
  const englishHref = await englishChatGpt.getAttribute('href');
  expect(englishHref).not.toBeNull();

  const englishPrompt = new URL(englishHref!).searchParams.get('prompt');
  expect(englishPrompt).toBe(
    'Read https://thucde.dev/learn/docs/backend-engineering/oauth-and-oidc. I want to ask questions about its content.',
  );

  await page.goto(appUrl('/vi/docs/backend-engineering/oauth-and-oidc'));

  await page.locator('summary').filter({ hasText: /^Mở$/ }).click();

  const vietnameseChatGpt = page.getByRole('link', { name: 'Mở trong ChatGPT' });
  const vietnameseHref = await vietnameseChatGpt.getAttribute('href');
  expect(vietnameseHref).not.toBeNull();

  const vietnamesePrompt = new URL(vietnameseHref!).searchParams.get('prompt');
  expect(vietnamesePrompt).toBe(
    'Đọc https://thucde.dev/learn/vi/docs/backend-engineering/oauth-and-oidc và giúp tôi trả lời các câu hỏi về nội dung này.',
  );
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
