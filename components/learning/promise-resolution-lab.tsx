'use client';

import {
  LabControls,
  LabPanel,
  LabShell,
  LiveStatus,
  ScenarioSelect,
  ScrollableCodeRegion,
} from '@/components/learning/primitives';
import {
  createPromiseScenarioState,
  PROMISE_SCENARIOS,
  stepPromiseScenario,
  type PromiseNode,
  type PromiseResolutionState,
  type PromiseScenarioId,
} from '@/lib/learning/promise-resolution';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

const STATE_LABELS_EN: Record<PromiseNode['state'], string> = {
  pending: 'Pending',
  fulfilled: 'Fulfilled',
  rejected: 'Rejected',
};

const STATE_LABELS_VI: Record<PromiseNode['state'], string> = {
  pending: 'Đang chờ (Pending)',
  fulfilled: 'Thành công (Fulfilled)',
  rejected: 'Bị từ chối (Rejected)',
};

const RESOLUTION_LABELS_EN: Record<PromiseNode['resolution'], string> = {
  unresolved: 'Unresolved',
  'fulfilled-value': 'Fulfilled with value',
  'rejected-reason': 'Rejected with reason',
  adopting: 'Adopting another promise',
};

const RESOLUTION_LABELS_VI: Record<PromiseNode['resolution'], string> = {
  unresolved: 'Chưa phân giải',
  'fulfilled-value': 'Hoàn thành với giá trị',
  'rejected-reason': 'Bị từ chối với lý do',
  adopting: 'Đang nhận nuôi Promise khác',
};

function PromiseCard({ promise, isVi }: { promise: PromiseNode; isVi?: boolean }) {
  const stateLabels = isVi ? STATE_LABELS_VI : STATE_LABELS_EN;
  const resLabels = isVi ? RESOLUTION_LABELS_VI : RESOLUTION_LABELS_EN;

  return (
    <article
      data-testid={`promise-node-${promise.id}`}
      className="space-y-3 rounded-lg border bg-fd-background p-4"
    >
      <div>
        <h4 className="font-semibold">{promise.id}</h4>
        <p className="text-sm text-fd-muted-foreground">{promise.label}</p>
      </div>

      <dl className="grid grid-cols-[max-content_minmax(0,1fr)] gap-x-4 gap-y-2 text-sm">
        <dt className="font-medium">{isVi ? 'Trạng thái:' : 'State:'}</dt>
        <dd>{stateLabels[promise.state]}</dd>

        <dt className="font-medium">{isVi ? 'Phân giải:' : 'Resolution:'}</dt>
        <dd>{resLabels[promise.resolution]}</dd>

        {promise.value !== undefined ? (
          <>
            <dt className="font-medium">{isVi ? 'Giá trị:' : 'Value:'}</dt>
            <dd className="font-mono">{promise.value}</dd>
          </>
        ) : null}
        {promise.reason !== undefined ? (
          <>
            <dt className="font-medium">{isVi ? 'Lý do:' : 'Reason:'}</dt>
            <dd className="font-mono">{promise.reason}</dd>
          </>
        ) : null}
        {promise.adopts !== undefined ? (
          <>
            <dt className="font-medium">{isVi ? 'Nhận nuôi:' : 'Adopts:'}</dt>
            <dd className="font-mono">{promise.adopts}</dd>
          </>
        ) : null}
      </dl>
    </article>
  );
}

function handlerDescription(state: PromiseResolutionState, isVi?: boolean) {
  if (!state.activeHandler) return isVi ? 'Không có' : 'None';

  const handler = state.activeHandler;
  return `${handler.kind}: ${handler.label} (${handler.sourcePromiseId} → ${handler.resultPromiseId})`;
}

export function PromiseResolutionLab({ locale }: { locale?: 'en' | 'vi' } = {}) {
  const pathname = usePathname() || '';
  const isVi = locale === 'vi' || pathname.includes('/vi/docs') || pathname.endsWith('/vi');
  const [scenarioId, setScenarioId] =
    useState<PromiseScenarioId>('return-value');
  const [state, setState] = useState(() =>
    createPromiseScenarioState('return-value'),
  );
  const [isRunning, setIsRunning] = useState(false);

  const scenario = useMemo(
    () =>
      PROMISE_SCENARIOS.find((candidate) => candidate.id === scenarioId) ??
      PROMISE_SCENARIOS[0],
    [scenarioId],
  );

  const canAutoRun = isRunning && !state.complete;

  useEffect(() => {
    if (!canAutoRun) return;

    const timeout = window.setTimeout(() => {
      setState((current) => stepPromiseScenario(current));
    }, 550);

    return () => window.clearTimeout(timeout);
  }, [canAutoRun, state]);

  function reset(nextScenarioId = scenarioId) {
    setIsRunning(false);
    setScenarioId(nextScenarioId);
    setState(createPromiseScenarioState(nextScenarioId));
  }

  function handleScenarioChange(value: string) {
    reset(value as PromiseScenarioId);
  }

  function handleStep() {
    setIsRunning(false);
    setState((current) => stepPromiseScenario(current));
  }

  function handleRunToggle() {
    if (state.complete) return;
    setIsRunning((current) => !current);
  }

  return (
    <LabShell
      title={isVi ? 'Phòng thực hành phân giải Promise' : 'Promise Resolution Lab'}
      description={
        isVi ? (
          <>
            Từng bước khám phá các kịch bản phân giải Promise. Mô phỏng ngữ nghĩa ngôn ngữ phục vụ học tập, không chạy mã JavaScript tùy tiện hay can thiệp trạng thái ẩn của native engine.
          </>
        ) : (
          <>
            Step through predefined Promise-resolution scenarios. The lab models
            language semantics for teaching; it does not execute arbitrary
            JavaScript or inspect hidden native Promise state.
          </>
        )
      }
    >
      <ScenarioSelect
        label={isVi ? 'Kịch bản Promise' : 'Promise scenario'}
        value={scenarioId}
        options={PROMISE_SCENARIOS.map((candidate) => ({
          value: candidate.id,
          label: candidate.title,
        }))}
        description={scenario.description}
        onChange={handleScenarioChange}
      />

      <ScrollableCodeRegion label={isVi ? 'Mã nguồn kịch bản' : 'Promise scenario source'}>
        {scenario.source}
      </ScrollableCodeRegion>

      <LabControls trailing={<span>{isVi ? `Bước ${state.stepIndex}` : `Step ${state.stepIndex}`}</span>}>
        <button
          type="button"
          onClick={handleStep}
          disabled={state.complete}
          className="rounded-md border px-3 py-2 font-medium hover:bg-fd-muted focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isVi ? 'Bước tiếp' : 'Step'}
        </button>
        <button
          type="button"
          onClick={handleRunToggle}
          disabled={state.complete}
          className="rounded-md border px-3 py-2 font-medium hover:bg-fd-muted focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {canAutoRun ? (isVi ? 'Tạm dừng' : 'Pause') : (isVi ? 'Chạy tự động' : 'Run')}
        </button>
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-md border px-3 py-2 font-medium hover:bg-fd-muted focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          {isVi ? 'Đặt lại' : 'Reset'}
        </button>
      </LabControls>

      <LiveStatus label={isVi ? 'Trạng thái' : 'Status'}>
        <span data-testid="promise-lab-status">
          {state.complete ? (isVi ? 'Hoàn tất' : 'Complete') : (isVi ? 'Đang xử lý' : 'In progress')}
        </span>
      </LiveStatus>

      <section className="space-y-3" aria-label={isVi ? 'Trạng thái các Promise' : 'Promise states'}>
        <h4 className="font-semibold">{isVi ? 'Trạng thái các Promise' : 'Promise states'}</h4>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {state.promises.map((promise) => (
            <PromiseCard key={promise.id} promise={promise} isVi={isVi} />
          ))}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section
          data-testid="active-promise-handler"
          className="rounded-lg border bg-fd-card p-4"
          aria-label={isVi ? 'Handler đang thực thi' : 'Active Promise handler'}
        >
          <h4 className="mb-3 font-semibold">{isVi ? 'Handler đang thực thi' : 'Active handler'}</h4>
          <p className="text-sm leading-relaxed">{handlerDescription(state, isVi)}</p>
        </section>

        <LabPanel title={isVi ? 'Nhật ký kết quả' : 'Outcome log'}>
          {state.output.length === 0 ? (
            <p className="text-sm text-fd-muted-foreground">{isVi ? 'Chưa có kết quả' : 'No output yet'}</p>
          ) : (
            <ol
              data-testid="promise-lab-output"
              className="list-decimal space-y-1 pl-5 font-mono text-sm"
            >
              {state.output.map((line, index) => (
                <li key={`${index}-${line}`}>{line}</li>
              ))}
            </ol>
          )}
        </LabPanel>
      </div>

      <LabPanel title={isVi ? 'Giải thích bước này' : 'Why this step?'}>
        <p className="text-sm leading-relaxed" aria-live="polite">
          {state.explanation}
        </p>
      </LabPanel>
    </LabShell>
  );
}
