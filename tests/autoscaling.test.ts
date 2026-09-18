import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();
const read = (relativePath: string) => readFileSync(path.join(repoRoot, relativePath), 'utf8');

const lessonPaths = {
  en: 'content/docs/cloud-infrastructure/autoscaling.mdx',
  vi: 'content/docs/cloud-infrastructure/autoscaling.vi.mdx',
} as const;

function readLesson(relativePath: string) {
  const absolutePath = path.join(repoRoot, relativePath);
  expect(existsSync(absolutePath), `${relativePath} should exist`).toBe(true);
  return readFileSync(absolutePath, 'utf8');
}

describe('Autoscaling lesson', () => {
  it('publishes Autoscaling immediately after Infrastructure as Code in both locale sidebars', () => {
    for (const relativePath of [
      'content/docs/cloud-infrastructure/meta.json',
      'content/docs/cloud-infrastructure/meta.vi.json',
    ]) {
      const source = read(relativePath);
      const iac = source.indexOf('"infrastructure-as-code"');
      const autoscaling = source.indexOf('"autoscaling"');

      expect(iac, relativePath).toBeGreaterThan(-1);
      expect(autoscaling, relativePath).toBeGreaterThan(iac);
    }
  });

  it('places both locale variants on the canonical concept at reason depth with current freshness', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toContain('category: cloud-infrastructure');
      expect(source, relativePath).toContain('contentType: deep-dive');
      expect(source, relativePath).toContain('learningDepth: reason');
      expect(source, relativePath).toMatch(/concepts:\n  - autoscaling\n---/);
      expect(source, relativePath).toContain('lastVerified: 2026-09-18');

      const termBoxes = (source.match(/<TermBox/g) ?? []).length;
      expect(termBoxes, relativePath).toBeGreaterThanOrEqual(2);
      expect(termBoxes, relativePath).toBeLessThanOrEqual(3);
      expect((source.match(/```mermaid/g) ?? []).length, relativePath).toBeGreaterThanOrEqual(3);
      expect(source, relativePath).toContain('<details>');
      expect(source, relativePath).toContain('- [ ]');
      expect(source, relativePath).toMatch(/> 💡 \*\*(Rule of thumb|Quy tắc bỏ túi):\*\*/);
      expect(source, relativePath).toMatch(/Fatal pitfall|Cạm bẫy chết người|Sai lầm chí mạng/i);
    }
  });

  it('teaches autoscaling as a delayed feedback-control loop rather than a magic capacity switch', () => {
    const en = readLesson(lessonPaths.en);
    const vi = readLesson(lessonPaths.vi);

    for (const [relativePath, source] of [[lessonPaths.en, en], [lessonPaths.vi, vi]] as const) {
      expect(source, relativePath).toMatch(/feedback loop|control loop|vòng phản hồi|vòng điều khiển/i);
      expect(source, relativePath).toMatch(/signal|metric|tín hiệu|chỉ số/i);
      expect(source, relativePath).toMatch(/target|threshold|mục tiêu|ngưỡng/i);
      expect(source, relativePath).toMatch(/desired capacity|desired replicas|capacity mong muốn|replica mong muốn/i);
      expect(source, relativePath).toMatch(/actual capacity|serving capacity|capacity thực tế|capacity phục vụ/i);
      expect(source, relativePath).toMatch(/delay|lag|warmup|initialization|độ trễ|khởi tạo/i);
      expect(source, relativePath).toMatch(/min.*max|max.*min|minimum.*maximum|tối thiểu.*tối đa/i);
    }

    expect(en).toContain('**Impact:**');
    expect(en).toContain('**Root cause:**');
    expect(en).toContain('**Correct pattern:**');
    expect(vi).toContain('**Hậu quả:**');
    expect(vi).toContain('**Nguyên nhân cốt lõi:**');
    expect(vi).toContain('**Cách khắc phục chuẩn:**');
  });

  it('teaches metric selection through utilization, throughput, concurrency, backlog, and queue age', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toMatch(/CPU utilization|CPU/i);
      expect(source, relativePath).toMatch(/request.*per.*instance|request.*per.*target|throughput|requests per/i);
      expect(source, relativePath).toMatch(/concurrency|concurrent/i);
      expect(source, relativePath).toMatch(/queue.*backlog|backlog.*queue|queue length|độ dài hàng đợi|backlog/i);
      expect(source, relativePath).toMatch(/queue age|oldest message|message age|tuổi.*message|thời gian chờ/i);
      expect(source, relativePath).toMatch(/per-instance|per target|per worker|mỗi instance|mỗi worker/i);
      expect(source, relativePath).toMatch(/metric.*proportional|proportional.*metric|tỉ lệ.*capacity|tỷ lệ.*capacity/i);
    }
  });

  it('explains warmup, cooldown, stabilization, hysteresis, tolerance, and flapping', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toMatch(/warmup|initialization period|khởi tạo/i);
      expect(source, relativePath).toMatch(/cooldown|cool-down/i);
      expect(source, relativePath).toMatch(/stabilization|ổn định hóa|ổn định/i);
      expect(source, relativePath).toMatch(/hysteresis|deadband|tolerance|vùng chết|dung sai/i);
      expect(source, relativePath).toMatch(/flapping|oscillation|dao động/i);
      expect(source, relativePath).toMatch(/scale.?in.*conservative|conservative.*scale.?in|scale.?in.*chậm|thu hẹp.*thận trọng/i);
    }
  });

  it('separates requested capacity from ready serving capacity and teaches provisioning bottlenecks', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toMatch(/requested capacity|desired capacity|capacity yêu cầu|capacity mong muốn/i);
      expect(source, relativePath).toMatch(/ready capacity|serving capacity|healthy capacity|capacity sẵn sàng|capacity phục vụ/i);
      expect(source, relativePath).toMatch(/quota|limit|hạn ngạch|giới hạn/i);
      expect(source, relativePath).toMatch(/image pull|bootstrap|startup|provision|khởi động|cấp phát/i);
      expect(source, relativePath).toMatch(/load balancer|readiness|health check|cân bằng tải|kiểm tra sức khỏe/i);
      expect(source, relativePath).toMatch(/failed.*launch|launch.*failure|provision.*fail|cấp phát.*fail|khởi tạo.*fail/i);
    }
  });

  it('teaches downstream saturation and why scaling one tier can amplify another bottleneck', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toMatch(/downstream|database|dependency|phụ thuộc/i);
      expect(source, relativePath).toMatch(/connection pool|pool kết nối/i);
      expect(source, relativePath).toMatch(/backpressure|load shedding|giảm tải|áp lực ngược/i);
      expect(source, relativePath).toMatch(/scale.*front|front.*scale|scale.*worker|mở rộng.*frontend|mở rộng.*worker/i);
      expect(source, relativePath).toMatch(/bottleneck|nút thắt/i);
    }
  });

  it('covers reactive, scheduled, and predictive scaling plus scale-to-zero trade-offs', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toMatch(/reactive|phản ứng/i);
      expect(source, relativePath).toMatch(/scheduled|schedule|lịch/i);
      expect(source, relativePath).toMatch(/predictive|forecast|dự đoán/i);
      expect(source, relativePath).toMatch(/scale.?to.?zero|zero replicas|về 0|replica 0/i);
      expect(source, relativePath).toMatch(/cold start|startup latency|độ trễ khởi động/i);
    }
  });

  it('distinguishes workload autoscaling from infrastructure autoscaling in Kubernetes', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toMatch(/HorizontalPodAutoscaler|HPA/i);
      expect(source, relativePath).toMatch(/Cluster Autoscaler|node autoscal|node pool|autoscale node/i);
      expect(source, relativePath).toMatch(/Pending Pod|Pending Pods|Pod.*Pending/i);
      expect(source, relativePath).toContain('kubernetes-fundamentals');
      expect(source, relativePath).toMatch(/Vertical Pod Autoscaler|VPA|vertical scaling/i);
    }
  });

  it('keeps provider-specific semantics scoped across AWS, Google Cloud, Azure, and Kubernetes', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toMatch(/AWS.*target tracking|target tracking.*AWS|EC2 Auto Scaling/i);
      expect(source, relativePath).toMatch(/Google Cloud.*autoscaler|Compute Engine autoscaler/i);
      expect(source, relativePath).toMatch(/Azure.*autoscale|Azure Monitor Autoscale/i);
      expect(source, relativePath).toMatch(/Kubernetes.*HPA|HorizontalPodAutoscaler/i);
      expect(source, relativePath).toMatch(/provider-specific|platform-specific|nhà cung cấp|từng nền tảng|khác nhau/i);
    }
  });

  it('records Autoscaling in the September 18 rolling changelog for both locales', () => {
    const en = read('content/docs/start-here/changelog.mdx');
    const vi = read('content/docs/start-here/changelog.vi.mdx');

    expect(en).toContain('September 18, 2026');
    expect(en).toContain('[Autoscaling](/docs/cloud-infrastructure/autoscaling)');
    expect(en).toContain('lastVerified: 2026-09-18');

    expect(vi).toContain('18 tháng 09 năm 2026');
    expect(vi).toContain('](/vi/docs/cloud-infrastructure/autoscaling)');
    expect(vi).toContain('lastVerified: 2026-09-18');
  });
});
