import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('exposes Engineering Judgment in docs navigation', async ({ page }) => {
  await page.goto('/docs');

  await expect(
    page.getByText('Engineering Judgment', { exact: true }).first(),
  ).toBeVisible();
});
