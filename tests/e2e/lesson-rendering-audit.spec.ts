import { readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { expect, test } from '@playwright/test';
import { appUrl } from './app-path';

const docsRoot = path.join(process.cwd(), 'content', 'docs');

function collectMdxFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const fullPath = path.join(directory, entry);
    return statSync(fullPath).isDirectory()
      ? collectMdxFiles(fullPath)
      : entry.endsWith('.mdx')
        ? [fullPath]
        : [];
  });
}

function routeForFile(filePath: string): string {
  const relative = path
    .relative(docsRoot, filePath)
    .replaceAll(path.sep, '/')
    .replace(/\.mdx$/, '');
  const normalized = relative === 'index' ? '' : relative.replace(/\/index$/, '');
  return appUrl(normalized ? `/docs/${normalized}` : '/docs');
}

const authoredRoutes = collectMdxFiles(docsRoot).map(routeForFile).sort();

test('lab source code is rendered as one undecorated block', async ({ page }) => {
  await page.goto(appUrl('/docs/programming/async/promises'));

  const code = page
    .getByRole('region', { name: 'Promise scenario source' })
    .locator('code');

  await expect(code).toBeVisible();

  const styles = await code.evaluate((element) => {
    const computed = getComputedStyle(element);
    return {
      display: computed.display,
      borderTopWidth: computed.borderTopWidth,
      borderRightWidth: computed.borderRightWidth,
      borderBottomWidth: computed.borderBottomWidth,
      borderLeftWidth: computed.borderLeftWidth,
      paddingTop: computed.paddingTop,
      paddingRight: computed.paddingRight,
      paddingBottom: computed.paddingBottom,
      paddingLeft: computed.paddingLeft,
    };
  });

  expect(styles).toEqual({
    display: 'block',
    borderTopWidth: '0px',
    borderRightWidth: '0px',
    borderBottomWidth: '0px',
    borderLeftWidth: '0px',
    paddingTop: '0px',
    paddingRight: '0px',
    paddingBottom: '0px',
    paddingLeft: '0px',
  });
});

test('promise state values share one aligned value column', async ({ page }) => {
  await page.goto(appUrl('/docs/programming/async/promises'));

  for (let index = 0; index < 4; index += 1) {
    await page.getByRole('button', { name: 'Step', exact: true }).click();
  }

  const values = page.getByTestId('promise-node-P0').locator('dd');
  await expect(values).toHaveCount(3);

  const xPositions = await values.evaluateAll((elements) =>
    elements.map((element) => element.getBoundingClientRect().x),
  );

  expect(Math.max(...xPositions) - Math.min(...xPositions)).toBeLessThanOrEqual(1);
});

test('all authored docs routes render without document-level horizontal overflow', async ({
  page,
}) => {
  const failures: string[] = [];

  for (const route of authoredRoutes) {
    const response = await page.goto(route);
    if (!response?.ok()) {
      failures.push(`${route}: HTTP ${response?.status() ?? 'no response'}`);
      continue;
    }

    const heading = page.locator('h1').first();
    if (!(await heading.isVisible())) {
      failures.push(`${route}: missing visible h1`);
    }

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    if (overflow > 1) {
      failures.push(`${route}: document overflows horizontally by ${overflow}px`);
    }
  }

  expect(failures).toEqual([]);
});
