import { expect, test } from '@playwright/test';

function appUrl(path: string) {
  return `/learn${path}`;
}

test.describe('Announcement banner, changelog, and status badges', () => {
  test('renders top release announcement banner on docs pages', async ({ page }) => {
    await page.goto(appUrl('/docs'));

    const banner = page.locator('#atlas-release-2026-09-10');
    await expect(banner).toBeVisible();
    await expect(banner.getByText('New', { exact: true })).toBeVisible();
    await expect(
      banner.getByRole('link', { name: "Explore What's New →" }),
    ).toBeVisible();
  });

  test('renders Vietnamese localized banner on /vi/docs pages', async ({ page }) => {
    await page.goto(appUrl('/vi/docs'));

    const banner = page.locator('#atlas-release-2026-09-10');
    await expect(banner).toBeVisible();
    await expect(banner.getByText('Mới', { exact: true })).toBeVisible();
    await expect(
      banner.getByRole('link', { name: 'Xem nhật ký cập nhật →' }),
    ).toBeVisible();
  });

  test('banner links directly to What\'s New & Changelog page', async ({ page }) => {
    await page.goto(appUrl('/docs'));

    const banner = page.locator('#atlas-release-2026-09-10');
    await banner.getByRole('link', { name: "Explore What's New →" }).click();

    await expect(page).toHaveURL(/\/docs\/start-here\/changelog/);
    await expect(
      page.getByRole('heading', { name: "What's New & Changelog", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /September 10, 2026/ }),
    ).toBeVisible();
  });

  test('renders Vietnamese changelog at /vi/docs/start-here/changelog', async ({ page }) => {
    await page.goto(appUrl('/vi/docs/start-here/changelog'));

    await expect(
      page.getByRole('heading', { name: 'Cập nhật mới & Nhật ký thay đổi', exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /Ngày 10 tháng 09 năm 2026/ }),
    ).toBeVisible();
  });

  test('exposes What\'s New link in navbar header', async ({ page }) => {
    await page.goto(appUrl('/docs'));

    const navLink = page.getByRole('link', { name: "What's New", exact: true });
    await expect(navLink).toBeVisible();
    await expect(navLink).toHaveAttribute('href', appUrl('/docs/start-here/changelog'));
  });

  test('displays status badges on sidebar for newly released lessons', async ({ page }) => {
    await page.goto(appUrl('/docs'));

    // Open Backend Engineering section in sidebar if needed
    const backendSection = page.getByRole('button', { name: 'Backend Engineering' });
    if (await backendSection.isVisible()) {
      await backendSection.click();
    }

    // Check that recent lessons display a status badge
    const newBadges = page.locator('[data-status="new"]');
    await expect(newBadges.first()).toBeVisible();
  });

  test('persists banner dismissal in localStorage', async ({ page }) => {
    await page.goto(appUrl('/docs'));

    const banner = page.locator('#atlas-release-2026-09-10');
    await expect(banner).toBeVisible();

    const closeButton = banner.getByRole('button', { name: /close banner/i });
    await closeButton.click();

    await expect(banner).not.toBeVisible();

    // Reload page and verify banner remains hidden
    await page.reload();
    await expect(banner).not.toBeVisible();
  });
});
