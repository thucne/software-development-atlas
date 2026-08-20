import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const lessonPath = '/docs/programming/async/how-the-browser-event-loop-works';

async function step(page: Parameters<typeof test>[0] extends never ? never : any, count: number) {
  for (let index = 0; index < count; index += 1) {
    await page.getByRole('button', { name: 'Step', exact: true }).click();
  }
}

test('exposes the browser event loop lesson in docs navigation', async ({
  page,
}) => {
  await page.goto('/docs');

  await page
    .getByRole('button', { name: 'Programming', exact: true })
    .first()
    .click();
  await page
    .getByRole('button', { name: 'Asynchronous Programming', exact: true })
    .first()
    .click();

  const lessonLink = page.locator(`a[href="${lessonPath}"]`).first();
  await expect(lessonLink).toBeVisible();
  await lessonLink.click();

  await expect(page).toHaveURL(lessonPath);
  await expect(
    page.getByRole('heading', {
      name: 'How the Browser Event Loop Actually Works',
    }),
  ).toBeVisible();
});

test('steps through Promise reaction versus timer in guaranteed order', async ({
  page,
}) => {
  await page.goto(lessonPath);

  await expect(
    page.getByRole('heading', { name: 'Event Loop Lab', exact: true }),
  ).toBeVisible();

  await step(page, 9);

  await expect(page.getByTestId('event-loop-status')).toHaveText('Idle');
  await expect(
    page.getByTestId('event-loop-output').locator('li'),
  ).toHaveText(['A', 'B', 'promise', 'timer']);
});

test('drains a nested microtask in the same checkpoint', async ({ page }) => {
  await page.goto(lessonPath);

  await page.getByLabel('Event loop scenario').selectOption('nested-microtasks');
  await step(page, 6);

  await expect(page.getByTestId('event-loop-status')).toHaveText('Idle');
  await expect(
    page.getByTestId('event-loop-output').locator('li'),
  ).toHaveText(['script', 'microtask A', 'microtask B']);
});

test('accepts both valid scheduler choices for unrelated task sources', async ({
  page,
}) => {
  await page.goto(lessonPath);
  const scenario = page.getByLabel('Event loop scenario');

  await scenario.selectOption('multiple-task-sources');
  await step(page, 3);

  await expect(
    page.getByRole('button', { name: 'Run timer task', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', {
      name: 'Run user-interaction task',
      exact: true,
    }),
  ).toBeVisible();

  await page
    .getByRole('button', { name: 'Run timer task', exact: true })
    .click();
  await expect(page.getByText(/one valid scheduling choice/i)).toBeVisible();
  await step(page, 2);
  await expect(page.getByTestId('event-loop-status')).toHaveText('Idle');
  await expect(
    page.getByTestId('event-loop-output').locator('li'),
  ).toHaveText(['timer task', 'user-interaction task']);

  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await step(page, 3);
  await page
    .getByRole('button', {
      name: 'Run user-interaction task',
      exact: true,
    })
    .click();
  await expect(page.getByText(/one valid scheduling choice/i)).toBeVisible();
  await step(page, 2);
  await expect(page.getByTestId('event-loop-status')).toHaveText('Idle');
  await expect(
    page.getByTestId('event-loop-output').locator('li'),
  ).toHaveText(['user-interaction task', 'timer task']);
});

test('places animation-frame work inside a rendering opportunity', async ({
  page,
}) => {
  await page.goto(lessonPath);

  await page
    .getByLabel('Event loop scenario')
    .selectOption('rendering-opportunity');

  await step(page, 4);
  await expect(page.getByTestId('event-loop-status')).toHaveText(
    'Rendering opportunity',
  );

  await step(page, 3);
  await expect(page.getByTestId('event-loop-status')).toHaveText('Idle');
  await expect(page.getByTestId('event-loop-output')).toContainText(
    'animation frame',
  );
});

test('bounds the starvation demonstration instead of freezing the page', async ({
  page,
}) => {
  await page.goto(lessonPath);

  await page
    .getByLabel('Event loop scenario')
    .selectOption('microtask-starvation');
  await step(page, 8);

  await expect(page.getByTestId('event-loop-status')).toHaveText(
    'Starvation warning',
  );
  await expect(page.getByTestId('event-loop-output').locator('li')).toHaveCount(
    6,
  );
  await expect(page.getByText(/Later tasks and rendering cannot make progress/)).toBeVisible();
});

test('step and reset controls are keyboard operable', async ({ page }) => {
  await page.goto(lessonPath);

  const stepButton = page.getByRole('button', { name: 'Step', exact: true });
  await stepButton.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByText('Step 1', { exact: true })).toBeVisible();

  const resetButton = page.getByRole('button', { name: 'Reset', exact: true });
  await resetButton.focus();
  await page.keyboard.press('Space');

  await expect(page.getByText('Step 0', { exact: true })).toBeVisible();
  await expect(page.getByText('No output yet', { exact: true })).toBeVisible();
});

test('clean Markdown preserves the essential event-loop model', async ({
  request,
}) => {
  const response = await request.get(`${lessonPath}.md`);
  const markdown = await response.text();

  expect(response.ok()).toBeTruthy();
  expect(response.headers()['content-type']).toContain('text/markdown');
  expect(markdown).toContain('# How the Browser Event Loop Actually Works');
  expect(markdown).toContain('one universal FIFO');
  expect(markdown).toContain('A timer delay is not an execution deadline.');
  expect(markdown).toContain('rendering opportunity');
  expect(markdown).toContain('queueMicrotask()');
  expect(markdown).toContain('Node.js');
  expect(markdown).toContain('both initial choice');
});

test('edit action targets the canonical event-loop source', async ({ page }) => {
  await page.goto(lessonPath);

  const expectedHref =
    'https://github.com/thucne/software-development-atlas/edit/main/' +
    'content/docs/programming/async/how-the-browser-event-loop-works.mdx';

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
