import { expect, test } from '@playwright/test';
import { appUrl } from './app-path';

const lessonPath = appUrl('/docs/programming/async/promises');
const canonicalLessonUrl =
  'https://thucde.dev/learn/docs/programming/async/promises';
const ogImageUrl =
  'https://thucde.dev/learn/og/software-development-atlas.jpg';

test('emits canonical and social preview metadata for lessons', async ({ page }) => {
  await page.goto(lessonPath);

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    canonicalLessonUrl,
  );
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    'content',
    'Promises: Resolution, Chaining, and Failure',
  );
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
    'content',
    canonicalLessonUrl,
  );
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    'content',
    ogImageUrl,
  );
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
    'content',
    'summary_large_image',
  );
  await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute(
    'content',
    ogImageUrl,
  );
});

test('serves the optimized Open Graph image', async ({ request }) => {
  const response = await request.get(
    appUrl('/og/software-development-atlas.jpg'),
  );

  expect(response.ok()).toBeTruthy();
  expect(response.headers()['content-type']).toContain('image/jpeg');
  expect((await response.body()).byteLength).toBeGreaterThan(50_000);
});

test('publishes canonical lesson URLs in the sitemap', async ({ request }) => {
  const response = await request.get(appUrl('/sitemap.xml'));
  const xml = await response.text();

  expect(response.ok()).toBeTruthy();
  expect(response.headers()['content-type']).toContain('application/xml');
  expect(xml).toContain(`<loc>${canonicalLessonUrl}</loc>`);
  expect(xml).not.toContain('<loc>https://thucde.dev/learn</loc>');
});

test('publishes crawl rules with the canonical sitemap URL', async ({ request }) => {
  const response = await request.get(appUrl('/robots.txt'));
  const text = await response.text();

  expect(response.ok()).toBeTruthy();
  expect(text).toContain('User-Agent: *');
  expect(text).toContain('Allow: /');
  expect(text).toContain('Sitemap: https://thucde.dev/learn/sitemap.xml');
});
