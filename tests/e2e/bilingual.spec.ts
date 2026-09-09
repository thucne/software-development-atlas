import { expect, test } from '@playwright/test';
import { appUrl } from './app-path';

test.describe('Bilingual Documentation Experience', () => {
  test('renders the Vietnamese Promises lesson with localized metadata and content', async ({
    page,
  }) => {
    const viPromisesPath = appUrl('/vi/docs/programming/async/promises');
    await page.goto(viPromisesPath);

    await expect(
      page.getByRole('heading', {
        name: 'Promises: Giải quyết trạng thái, Nối chuỗi và Xử lý lỗi',
      }),
    ).toBeVisible();

    await expect(
      page.getByRole('region', { name: 'Độ tin cậy nội dung' }),
    ).toBeVisible();

    await expect(
      page.getByRole('heading', { name: 'Ba trạng thái của Promise' }),
    ).toBeVisible();
  });

  test('renders the Vietnamese Event Loop lesson with localized content', async ({
    page,
  }) => {
    const viEventLoopPath = appUrl('/vi/docs/programming/async/how-the-browser-event-loop-works');
    await page.goto(viEventLoopPath);

    await expect(
      page.getByRole('heading', {
        name: 'Cơ chế hoạt động của Event Loop trong Trình duyệt',
      }),
    ).toBeVisible();

    await expect(
      page.getByRole('heading', { name: 'Chu trình làm việc của Microtask Checkpoint' }),
    ).toBeVisible();
  });

  test('renders the Vietnamese Containers vs Serverless guide with decision matrix', async ({
    page,
  }) => {
    const viGuidePath = appUrl('/vi/docs/engineering-judgment/decision-guides/containers-vs-serverless');
    await page.goto(viGuidePath);

    await expect(
      page.getByRole('heading', {
        name: 'Containers vs Serverless: Hướng dẫn ra quyết định kiến trúc',
      }),
    ).toBeVisible();

    await expect(
      page.getByText('Ma trận so sánh Containers và Serverless'),
    ).toBeVisible();
  });
  test('renders the Vietnamese sidebar with localized folder titles', async ({
    page,
  }) => {
    const viHome = appUrl('/vi/docs');
    await page.goto(viHome);

    await expect(
      page.getByRole('button', { name: 'Bắt đầu tại đây' }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Lộ trình học tập' }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Đánh giá kỹ thuật' }),
    ).toBeVisible();
  });

  test('renders the Vietnamese Learning Path view with localized labels and items', async ({
    page,
  }) => {
    const viPath = appUrl('/vi/docs/learning-paths/modern-web-systems');
    await page.goto(viPath);

    await expect(
      page.getByRole('heading', { name: 'Hệ thống Web hiện đại', level: 1 }),
    ).toBeVisible();

    await expect(page.getByText('Mức độ tiếp cận mục tiêu')).toBeVisible();
    await expect(page.getByText('Mục tiêu đạt được')).toBeVisible();
    await expect(page.getByText('Các bước trong lộ trình')).toBeVisible();
  });

  test('renders the Vietnamese Reliable Checkout architecture walkthrough', async ({
    page,
  }) => {
    const viCheckoutPath = appUrl(
      '/vi/docs/engineering-judgment/architecture-walkthroughs/reliable-checkout',
    );
    await page.goto(viCheckoutPath);

    await expect(
      page.getByRole('heading', {
        name: 'Phân tích Kiến trúc Thanh toán Đáng tin cậy (Reliable Checkout)',
        level: 1,
      }),
    ).toBeVisible();

    await expect(
      page.getByRole('heading', { name: 'Sơ đồ kiến trúc tổng thể' }),
    ).toBeVisible();
  });
});
