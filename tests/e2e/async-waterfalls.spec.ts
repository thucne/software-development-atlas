import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const lessonPath =
  '/docs/programming/async/avoiding-sequential-async-waterfalls';

test('exposes the async waterfalls lesson in docs navigation', async ({ page }) => {
  await page.goto('/docs');

  await expect(
    page.locator(`a[href="${lessonPath}"]`).first(),
  ).toBeVisible();
});

test('renders the lab with correct default timing', async ({ page }) => {
  await page.goto(lessonPath);

  await expect(
    page.getByRole('heading', { name: 'Async Waterfall Lab' }),
  ).toBeVisible();
  await expect(page.getByTestId('sequential-total')).toHaveText('1500ms');
  await expect(page.getByTestId('concurrent-total')).toHaveText('800ms');
  await expect(page.getByTestId('time-saved')).toHaveText('700ms');
});

test('recalculates totals when a task duration changes and resets', async ({
  page,
}) => {
  await page.goto(lessonPath);

  const taskB = page.getByRole('spinbutton', {
    name: 'Task B duration in milliseconds',
  });

  await taskB.fill('1000');

  await expect(page.getByTestId('sequential-total')).toHaveText('2100ms');
  await expect(page.getByTestId('concurrent-total')).toHaveText('1000ms');
  await expect(page.getByTestId('time-saved')).toHaveText('1100ms');

  await page.getByRole('button', { name: 'Reset' }).click();

  await expect(taskB).toHaveValue('400');
  await expect(page.getByTestId('sequential-total')).toHaveText('1500ms');
  await expect(page.getByTestId('concurrent-total')).toHaveText('800ms');
});

test('play control is keyboard operable', async ({ page }) => {
  await page.goto(lessonPath);

  const play = page.getByRole('button', { name: /play timelines/i });
  await play.focus();
  await page.keyboard.press('Enter');

  await expect(
    page.getByRole('button', { name: /replay timelines/i }),
  ).toBeVisible();
});

test('clean Markdown preserves the essential explanation', async ({ request }) => {
  const response = await request.get(`${lessonPath}.md`);
  const markdown = await response.text();

  expect(response.ok()).toBeTruthy();
  expect(response.headers()['content-type']).toContain('text/markdown');
  expect(markdown).toContain('# Avoiding Sequential Async Waterfalls');
  expect(markdown).toContain('800 + 400 + 300 = 1500ms');
  expect(markdown).toContain('max(800, 400, 300) = 800ms');
  expect(markdown).toContain('Do not introduce unbounded concurrency');
  expect(markdown).toContain('does not automatically cancel');
});

test('edit action targets the canonical lesson source', async ({ page }) => {
  await page.goto(lessonPath);

  const expectedHref =
    'https://github.com/thucne/software-development-atlas/edit/main/' +
    'content/docs/programming/async/avoiding-sequential-async-waterfalls.mdx';

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
