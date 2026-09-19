import { expect, test } from '@playwright/test';

function appUrl(path: string) {
  return `/learn${path}`;
}

test.describe('Announcement banner, changelog, and status badges', () => {
  test('renders top release announcement banner on docs pages', async ({ page }) => {
    await page.goto(appUrl('/docs'));

    const banner = page.locator('#atlas-release-2026-09-19');
    await expect(banner).toBeVisible();
    await expect(banner.getByText('New', { exact: true })).toBeVisible();
    await expect(
      banner.getByText('38 new lessons added since Sep 10!', { exact: true }),
    ).toBeVisible();
    await expect(
      banner.getByText(
        "Following the Sep 10 milestone's 33 new system architecture lessons.",
        { exact: true },
      ),
    ).toBeVisible();
    await expect(
      banner.getByRole('link', { name: "Explore What's New →" }),
    ).toBeVisible();
  });

  for (const width of [390, 360]) {
    test(`keeps the New badge visible and shortens copy on ${width}px mobile viewport`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(appUrl('/docs'));

      const banner = page.locator('#atlas-release-2026-09-19');
      const badge = banner.getByText('New', { exact: true });
      const primaryCopy = banner.getByText('38 new lessons added since Sep 10!', {
        exact: true,
      });
      const secondaryCopy = banner.getByText(
        "Following the Sep 10 milestone's 33 new system architecture lessons.",
        { exact: true },
      );

      await expect(banner).toBeVisible();
      await expect(badge).toBeVisible();
      await expect(primaryCopy).toBeVisible();
      await expect(secondaryCopy).toBeHidden();
      await expect(
        banner.getByRole('link', { name: "Explore What's New →" }),
      ).toBeVisible();

      const bannerBox = await banner.boundingBox();
      const badgeBox = await badge.boundingBox();
      expect(bannerBox).not.toBeNull();
      expect(badgeBox).not.toBeNull();
      expect(badgeBox!.x).toBeGreaterThanOrEqual(bannerBox!.x);
      expect(badgeBox!.x + badgeBox!.width).toBeLessThanOrEqual(
        bannerBox!.x + bannerBox!.width,
      );
      const link = banner.getByRole('link', { name: "Explore What's New →" });
      const linkBox = await link.boundingBox();
      expect(linkBox).not.toBeNull();
      expect(badgeBox!.y).toBeGreaterThanOrEqual(bannerBox!.y);
      expect(badgeBox!.y + badgeBox!.height).toBeLessThanOrEqual(
        bannerBox!.y + bannerBox!.height,
      );
      expect(linkBox!.y + linkBox!.height).toBeLessThanOrEqual(
        bannerBox!.y + bannerBox!.height,
      );
    });
  }

  test('renders Vietnamese localized banner on /vi/docs pages', async ({ page }) => {
    await page.goto(appUrl('/vi/docs'));

    const banner = page.locator('#atlas-release-2026-09-19');
    await expect(banner).toBeVisible();
    await expect(banner.getByText('Mới', { exact: true })).toBeVisible();
    await expect(
      banner.getByText('38 bài học mới được bổ sung từ 10/09!', { exact: true }),
    ).toBeVisible();
    await expect(
      banner.getByText('Tiếp nối mốc 33 bài học kiến trúc hệ thống ngày 10/09.', {
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      banner.getByRole('link', { name: 'Xem nhật ký cập nhật →' }),
    ).toBeVisible();
  });

  for (const width of [390, 360]) {
    test(`keeps the Mới badge visible and shortens Vietnamese copy on ${width}px mobile viewport`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(appUrl('/vi/docs'));

      const banner = page.locator('#atlas-release-2026-09-19');
      const badge = banner.getByText('Mới', { exact: true });
      const primaryCopy = banner.getByText(
        '38 bài học mới được bổ sung từ 10/09!',
        { exact: true },
      );
      const secondaryCopy = banner.getByText(
        'Tiếp nối mốc 33 bài học kiến trúc hệ thống ngày 10/09.',
        { exact: true },
      );

      await expect(banner).toBeVisible();
      await expect(badge).toBeVisible();
      await expect(primaryCopy).toBeVisible();
      await expect(secondaryCopy).toBeHidden();
      await expect(
        banner.getByRole('link', { name: 'Xem nhật ký cập nhật →' }),
      ).toBeVisible();

      const bannerBox = await banner.boundingBox();
      const badgeBox = await badge.boundingBox();
      expect(bannerBox).not.toBeNull();
      expect(badgeBox).not.toBeNull();
      expect(badgeBox!.x).toBeGreaterThanOrEqual(bannerBox!.x);
      expect(badgeBox!.x + badgeBox!.width).toBeLessThanOrEqual(
        bannerBox!.x + bannerBox!.width,
      );
      const link = banner.getByRole('link', { name: 'Xem nhật ký cập nhật →' });
      const linkBox = await link.boundingBox();
      expect(linkBox).not.toBeNull();
      expect(badgeBox!.y).toBeGreaterThanOrEqual(bannerBox!.y);
      expect(badgeBox!.y + badgeBox!.height).toBeLessThanOrEqual(
        bannerBox!.y + bannerBox!.height,
      );
      expect(linkBox!.y + linkBox!.height).toBeLessThanOrEqual(
        bannerBox!.y + bannerBox!.height,
      );
    });
  }

  test('banner links directly to What\'s New & Changelog page', async ({ page }) => {
    await page.goto(appUrl('/docs'));

    const banner = page.locator('#atlas-release-2026-09-19');
    await banner.getByRole('link', { name: "Explore What's New →" }).click();

    await expect(page).toHaveURL(/\/docs\/start-here\/changelog/);
    await expect(
      page.getByRole('heading', { name: "What's New & Changelog", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /September 16, 2026/ }),
    ).toBeVisible();
  });

  test('renders Vietnamese changelog at /vi/docs/start-here/changelog', async ({ page }) => {
    await page.goto(appUrl('/vi/docs/start-here/changelog'));

    await expect(
      page.getByRole('heading', { name: 'Cập nhật mới & Nhật ký thay đổi', exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /Ngày 16 tháng 09 năm 2026/ }),
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

    const banner = page.locator('#atlas-release-2026-09-19');
    await expect(banner).toBeVisible();

    const closeButton = banner.getByRole('button', { name: /close banner/i });
    await closeButton.click();

    await expect(banner).not.toBeVisible();

    // Reload page and verify banner remains hidden
    await page.reload();
    await expect(banner).not.toBeVisible();
  });
});
