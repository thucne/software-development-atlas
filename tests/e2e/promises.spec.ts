import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const lessonPath = '/docs/programming/async/promises';

async function step(page: Page, count: number) {
  for (let index = 0; index < count; index += 1) {
    await page.getByRole('button', { name: 'Step', exact: true }).click();
  }
}

test('exposes the promises lesson in docs navigation', async ({ page }) => {
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
      name: 'Promises: Resolution, Chaining, and Failure',
    }),
  ).toBeVisible();
});

test('fulfills the downstream promise when the default handler returns a value', async ({
  page,
}) => {
  await page.goto(lessonPath);

  await expect(
    page.getByRole('heading', { name: 'Promise Resolution Lab', exact: true }),
  ).toBeVisible();

  await step(page, 4);

  const downstream = page.getByTestId('promise-node-P1');
  await expect(page.getByTestId('promise-lab-status')).toHaveText('Complete');
  await expect(downstream).toContainText('State:Fulfilled');
  await expect(downstream).toContainText('Value:20');
});

test('shows resolved-but-pending adoption before the adopted promise settles', async ({
  page,
}) => {
  await page.goto(lessonPath);

  await page.getByLabel('Promise scenario').selectOption('adopt-pending');
  await step(page, 3);

  const downstream = page.getByTestId('promise-node-P1');
  await expect(downstream).toContainText('State:Pending');
  await expect(downstream).toContainText('Resolution:Adopting another promise');
  await expect(downstream).toContainText('Adopts:P2');
  await expect(
    page.getByText(/Resolved does not necessarily mean fulfilled/i),
  ).toBeVisible();

  await step(page, 3);
  await expect(page.getByTestId('promise-lab-status')).toHaveText('Complete');
  await expect(downstream).toContainText('State:Fulfilled');
  await expect(downstream).toContainText('Value:42');
});

test('shows catch recovery returning the downstream chain to fulfillment', async ({
  page,
}) => {
  await page.goto(lessonPath);

  await page.getByLabel('Promise scenario').selectOption('catch-recovery');
  await step(page, 4);

  const downstream = page.getByTestId('promise-node-P1');
  await expect(page.getByTestId('promise-lab-status')).toHaveText('Complete');
  await expect(downstream).toContainText('State:Fulfilled');
  await expect(downstream).toContainText('Value:Guest');
});

test('shows two independent downstream branches from one source promise', async ({
  page,
}) => {
  await page.goto(lessonPath);

  await page.getByLabel('Promise scenario').selectOption('branching');
  await step(page, 6);

  await expect(page.getByTestId('promise-node-P1')).toContainText('Value:11');
  await expect(page.getByTestId('promise-node-P2')).toContainText('Value:20');
  await expect(page.getByText(/independent downstream promises/i)).toBeVisible();
  await expect(page.getByTestId('promise-lab-status')).toHaveText('Complete');
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
  await expect(page.getByTestId('promise-lab-status')).toHaveText('In progress');
  await expect(page.getByTestId('promise-node-P0')).toContainText('Value:10');
});

test('clean Markdown preserves the essential Promise semantics', async ({
  request,
}) => {
  const response = await request.get(`${lessonPath}.md`);
  const markdown = await response.text();

  expect(response.ok()).toBeTruthy();
  expect(response.headers()['content-type']).toContain('text/markdown');
  expect(markdown).toContain('# Promises: Resolution, Chaining, and Failure');
  expect(markdown).toContain('Resolved does not necessarily mean fulfilled');
  expect(markdown).toContain('returns a still-pending Promise/thenable');
  expect(markdown).toContain('Promise.allSettled');
  expect(markdown).toContain('Promise.any([])');
  expect(markdown).toContain('Promise.race([])');
  expect(markdown).toContain('Promise.withResolvers()');
  expect(markdown).toContain('Promise.try()');
  expect(markdown).toContain('not timing-equivalent');
  expect(markdown).toContain('A Promise models an eventual result');
  expect(markdown).toContain('Treat every `then`, `catch`, and `finally`');
});

test('edit action targets the canonical promises source', async ({ page }) => {
  await page.goto(lessonPath);

  const expectedHref =
    'https://github.com/thucne/software-development-atlas/edit/main/' +
    'content/docs/programming/async/promises.mdx';

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
