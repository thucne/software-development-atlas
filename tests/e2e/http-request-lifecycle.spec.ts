import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { appUrl } from './app-path';

const lessonPath = appUrl('/docs/web-platform/http-request-lifecycle');

test('exposes the HTTP request lifecycle lesson in Web Platform navigation', async ({
  page,
}) => {
  await page.goto(appUrl('/docs'));

  await page
    .getByRole('button', { name: 'Web Platform', exact: true })
    .first()
    .click();

  const lessonLink = page.locator(`a[href="${lessonPath}"]`).first();
  await expect(lessonLink).toBeVisible();
  await lessonLink.click();

  await expect(page).toHaveURL(lessonPath);
  await expect(
    page.getByRole('heading', {
      name: 'HTTP Request Lifecycle: From URL to Response',
      exact: true,
    }),
  ).toBeVisible();
});

test('shows the cold request path by default', async ({ page }) => {
  await page.goto(lessonPath);

  await expect(
    page.getByRole('heading', { name: 'Request Path Explorer', exact: true }),
  ).toBeVisible();
  await expect(page.getByTestId('http-path-scenario')).toContainText(
    'Cold HTTPS request',
  );
  await expect(page.locator('[data-stage-id="transport-connect"]')).toHaveAttribute(
    'data-stage-state',
    'performed',
  );
});

test('fresh cache hit skips network setup, send, and origin work', async ({
  page,
}) => {
  await page.goto(lessonPath);

  await page
    .getByLabel('HTTP request scenario')
    .selectOption('fresh-cache-hit');

  await expect(page.getByTestId('http-path-scenario')).toContainText(
    'Fresh cache hit',
  );

  for (const stageId of [
    'dns',
    'transport-connect',
    'tls',
    'send-http',
    'intermediary',
    'origin',
  ]) {
    await expect(page.locator(`[data-stage-id="${stageId}"]`)).toHaveAttribute(
      'data-stage-state',
      'skipped',
    );
  }
});

test('warm connection skips new setup but still sends the HTTP request', async ({
  page,
}) => {
  await page.goto(lessonPath);

  await page
    .getByLabel('HTTP request scenario')
    .selectOption('warm-connection');

  await expect(page.locator('[data-stage-id="dns"]')).toHaveAttribute(
    'data-stage-state',
    'skipped',
  );
  await expect(page.locator('[data-stage-id="transport-connect"]')).toHaveAttribute(
    'data-stage-state',
    'skipped',
  );
  await expect(page.locator('[data-stage-id="tls"]')).toHaveAttribute(
    'data-stage-state',
    'skipped',
  );
  await expect(page.locator('[data-stage-id="send-http"]')).toHaveAttribute(
    'data-stage-state',
    'performed',
  );
});

test('reset and shared accessibility semantics work from the keyboard', async ({
  page,
}) => {
  await page.goto(lessonPath);

  const labHeading = page.getByRole('heading', {
    name: 'Request Path Explorer',
    exact: true,
  });
  const labHeadingId = await labHeading.getAttribute('id');
  expect(labHeadingId).not.toBeNull();
  await expect(labHeading.locator('xpath=ancestor::section[1]')).toHaveAttribute(
    'aria-labelledby',
    labHeadingId!,
  );

  const statusLiveRegion = page
    .getByTestId('http-path-scenario')
    .locator('xpath=ancestor::*[@aria-live="polite"][1]');
  await expect(statusLiveRegion).toHaveAttribute('aria-live', 'polite');

  await page
    .getByLabel('HTTP request scenario')
    .selectOption('intermediary-cache-hit');
  await expect(page.getByTestId('http-path-scenario')).toContainText(
    'Intermediary cache hit',
  );

  const resetButton = page.getByRole('button', { name: 'Reset', exact: true });
  await resetButton.focus();
  await page.keyboard.press('Enter');

  await expect(page.getByTestId('http-path-scenario')).toContainText(
    'Cold HTTPS request',
  );
});

test('clean Markdown preserves the essential HTTP tracing model', async ({
  request,
}) => {
  const response = await request.get(`${lessonPath}.md`);
  const markdown = await response.text();

  expect(response.ok()).toBeTruthy();
  expect(response.headers()['content-type']).toContain('text/markdown');
  expect(markdown).toContain('# HTTP Request Lifecycle: From URL to Response');
  expect(markdown).toContain('not necessarily a new network connection');
  expect(markdown).toContain(
    'Do **not** assume that every request repeats DNS resolution',
  );
  expect(markdown).toContain('A cached response is **fresh**');
  expect(markdown).toContain('A stored response is **stale**');
  expect(markdown).toContain('**Revalidation**');
  expect(markdown).toContain('HTTP/2 preserves HTTP semantics');
  expect(markdown).toContain('HTTP/3 maps HTTP semantics over QUIC');
  expect(markdown).toContain('idempotency');

  for (const source of [
    'https://www.rfc-editor.org/rfc/rfc9110.html',
    'https://www.rfc-editor.org/rfc/rfc9111.html',
    'https://www.rfc-editor.org/rfc/rfc9113.html',
    'https://www.rfc-editor.org/rfc/rfc9114.html',
    'https://fetch.spec.whatwg.org/',
  ]) {
    expect(markdown).toContain(source);
  }
});

test('edit action targets the canonical HTTP request lifecycle source', async ({
  page,
}) => {
  await page.goto(lessonPath);

  const expectedHref =
    'https://github.com/thucne/software-development-atlas/edit/main/' +
    'content/docs/web-platform/http-request-lifecycle.mdx';

  let githubLink = page.locator(`a[href="${expectedHref}"]`);

  if ((await githubLink.count()) === 0) {
    await page
      .getByRole('button', { name: /options|more|open/i })
      .last()
      .click();
    githubLink = page.locator(`a[href="${expectedHref}"]`);
  }

  await expect(githubLink.first()).toBeVisible();
});

test('has no automatically detectable serious accessibility violations', async ({
  page,
}) => {
  await page.goto(lessonPath);

  const results = await new AxeBuilder({ page }).analyze();
  const serious = results.violations.filter((violation) =>
    ['serious', 'critical'].includes(violation.impact ?? ''),
  );

  expect(serious).toEqual([]);
});
