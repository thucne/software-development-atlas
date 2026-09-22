import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();
const read = (relativePath: string) => readFileSync(path.join(repoRoot, relativePath), 'utf8');

const lessonPaths = {
  en: 'content/docs/cloud-infrastructure/kubernetes-fundamentals.mdx',
  vi: 'content/docs/cloud-infrastructure/kubernetes-fundamentals.vi.mdx',
} as const;

function readLesson(relativePath: string) {
  const absolutePath = path.join(repoRoot, relativePath);
  expect(existsSync(absolutePath), `${relativePath} should exist`).toBe(true);
  return readFileSync(absolutePath, 'utf8');
}

describe('Kubernetes Fundamentals lesson', () => {
  it('publishes Kubernetes Fundamentals immediately after Secrets Management in both locale sidebars', () => {
    for (const relativePath of [
      'content/docs/cloud-infrastructure/meta.json',
      'content/docs/cloud-infrastructure/meta.vi.json',
    ]) {
      const source = read(relativePath);
      const secrets = source.indexOf('"secrets-management"');
      const kubernetes = source.indexOf('"kubernetes-fundamentals"');

      expect(secrets, relativePath).toBeGreaterThan(-1);
      expect(kubernetes, relativePath).toBeGreaterThan(secrets);
    }
  });

  it('places both locale variants on the canonical concept at reason depth with current freshness', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toContain('category: cloud-infrastructure');
      expect(source, relativePath).toContain('contentType: deep-dive');
      expect(source, relativePath).toContain('learningDepth: reason');
      expect(source, relativePath).toMatch(/concepts:\n  - kubernetes-fundamentals\n---/);
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

  it('teaches Kubernetes as declarative reconciliation across control plane and nodes', () => {
    const en = readLesson(lessonPaths.en);
    const vi = readLesson(lessonPaths.vi);

    for (const [relativePath, source] of [[lessonPaths.en, en], [lessonPaths.vi, vi]] as const) {
      expect(source, relativePath).toMatch(/desired state|desired.*actual|trạng thái mong muốn|trạng thái thực tế/i);
      expect(source, relativePath).toMatch(/reconcil|control loop|vòng điều khiển|đối chiếu.*trạng thái/i);
      expect(source, relativePath).toMatch(/API server|kube-apiserver/i);
      expect(source, relativePath).toMatch(/etcd/i);
      expect(source, relativePath).toMatch(/scheduler|kube-scheduler|bộ lập lịch/i);
      expect(source, relativePath).toMatch(/controller manager|controller|bộ điều khiển/i);
      expect(source, relativePath).toMatch(/kubelet/i);
      expect(source, relativePath).toMatch(/node|worker node|nút/i);
      expect(source, relativePath).toMatch(/control plane|mặt phẳng điều khiển/i);
    }

    expect(en).toContain('**Impact:**');
    expect(en).toContain('**Root cause:**');
    expect(en).toContain('**Correct pattern:**');
    expect(vi).toContain('**Hậu quả:**');
    expect(vi).toContain('**Nguyên nhân cốt lõi:**');
    expect(vi).toContain('**Cách khắc phục chuẩn:**');
  });

  it('builds the workload model from Pods through controllers and Services', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toMatch(/Pod|pod/i);
      expect(source, relativePath).toMatch(/ephemeral|replaceable|disposable|tạm thời|có thể thay thế/i);
      expect(source, relativePath).toMatch(/Deployment/i);
      expect(source, relativePath).toMatch(/ReplicaSet/i);
      expect(source, relativePath).toMatch(/Service/i);
      expect(source, relativePath).toMatch(/EndpointSlice/i);
      expect(source, relativePath).toMatch(/label|selector|nhãn|bộ chọn/i);
      expect(source, relativePath).toMatch(/StatefulSet/i);
      expect(source, relativePath).toMatch(/DaemonSet/i);
      expect(source, relativePath).toMatch(/Job|CronJob/i);
    }
  });

  it('separates placement, runtime health, and traffic eligibility', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toMatch(/Pending|Running|Succeeded|Failed/);
      expect(source, relativePath).toMatch(/readiness/i);
      expect(source, relativePath).toMatch(/liveness/i);
      expect(source, relativePath).toMatch(/startup probe|startupProbe/i);
      expect(source, relativePath).toMatch(/Running.*Ready|Ready.*Running|Running.*không.*Ready|Running.*không.*sẵn sàng/i);
      expect(source, relativePath).toMatch(/restartPolicy|CrashLoopBackOff/i);
      expect(source, relativePath).toMatch(/SIGTERM|terminationGracePeriodSeconds|graceful termination|shutdown mềm|kết thúc mềm/i);
    }
  });

  it('teaches requests and limits as scheduling and runtime contracts rather than usage hints', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toMatch(/resource request|requests|yêu cầu tài nguyên/i);
      expect(source, relativePath).toMatch(/resource limit|limits|giới hạn tài nguyên/i);
      expect(source, relativePath).toMatch(/CPU thrott|throttl.*CPU|giới hạn CPU/i);
      expect(source, relativePath).toMatch(/OOM|out-of-memory|memory limit|giới hạn bộ nhớ/i);
      expect(source, relativePath).toMatch(/Unschedulable|Pending|không schedule|không lập lịch/i);
      expect(source, relativePath).toMatch(/priority|preemption|ưu tiên|preempt/i);
      expect(source, relativePath).toMatch(/capacity|bin pack|sức chứa|dung lượng cụm/i);
    }
  });

  it('covers config, secrets, storage, identity, and namespace boundaries without duplicating deeper lessons', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toMatch(/ConfigMap/i);
      expect(source, relativePath).toMatch(/Secret/i);
      expect(source, relativePath).toContain('secrets-management');
      expect(source, relativePath).toMatch(/PersistentVolume|PersistentVolumeClaim|PVC/i);
      expect(source, relativePath).toMatch(/ServiceAccount|service account/i);
      expect(source, relativePath).toMatch(/namespace|không gian tên/i);
      expect(source, relativePath).toMatch(/NetworkPolicy|network policy/i);
      expect(source, relativePath).toContain('containers');
    }
  });

  it('teaches rollout reasoning and debugging through object status, events, logs, and describe', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toMatch(/RollingUpdate|maxSurge|maxUnavailable|rolling update/i);
      expect(source, relativePath).toMatch(/rollout status|rollout undo|rollback/i);
      expect(source, relativePath).toMatch(/kubectl get|kubectl describe|kubectl logs/i);
      expect(source, relativePath).toMatch(/Events|event|sự kiện/i);
      expect(source, relativePath).toMatch(/status\.conditions|condition|điều kiện trạng thái/i);
      expect(source, relativePath).toMatch(/ownerReferences|owner reference|chủ sở hữu/i);
    }
  });

  it('keeps cluster administration, Infrastructure as Code, and autoscaling as explicit follow-on boundaries', () => {
    for (const relativePath of Object.values(lessonPaths)) {
      const source = readLesson(relativePath);
      expect(source, relativePath).toContain('infrastructure-as-code');
      expect(source, relativePath).toContain('autoscaling');
      expect(source, relativePath).toMatch(/cluster administration|control plane operations|quản trị cluster|vận hành control plane/i);
      expect(source, relativePath).toMatch(/not.*Helm|không.*Helm|not.*Terraform|không.*Terraform/i);
    }
  });

  it('records Kubernetes Fundamentals in the September 18 rolling changelog for both locales', () => {
    const en = read('content/docs/start-here/changelog.mdx');
    const vi = read('content/docs/start-here/changelog.vi.mdx');

    expect(en).toContain('September 18, 2026');
    expect(en).toContain('[Kubernetes Fundamentals](/docs/cloud-infrastructure/kubernetes-fundamentals)');
    expect(en).toMatch(/lastVerified: 2026-09-(?:1[7-9]|2[0-2])/);

    expect(vi).toContain('18 tháng 09 năm 2026');
    expect(vi).toContain('](/vi/docs/cloud-infrastructure/kubernetes-fundamentals)');
    expect(vi).toMatch(/lastVerified: 2026-09-(?:1[7-9]|2[0-2])/);
  });
});
