'use client';

import {
  LabControls,
  LabPanel,
  LabShell,
  LiveStatus,
  ScenarioSelect,
} from '@/components/learning/primitives';
import {
  getRequestPathScenario,
  HTTP_REQUEST_PATH_SCENARIOS,
  type RequestPathScenarioId,
  type RequestStageState,
} from '@/lib/learning/http-request-path';
import { usePathname } from 'next/navigation';
import { useMemo, useState } from 'react';

const STATE_LABELS_EN: Record<RequestStageState, string> = {
  performed: 'Performed',
  skipped: 'Skipped',
  conditional: 'Conditional',
};

const STATE_LABELS_VI: Record<RequestStageState, string> = {
  performed: 'Được thực thi',
  skipped: 'Bỏ qua',
  conditional: 'Có điều kiện',
};

export function HttpRequestPathExplorer({ locale }: { locale?: 'en' | 'vi' } = {}) {
  const pathname = usePathname() || '';
  const isVi = locale === 'vi' || pathname.includes('/vi/docs') || pathname.endsWith('/vi');
  const stateLabels = isVi ? STATE_LABELS_VI : STATE_LABELS_EN;
  const [scenarioId, setScenarioId] =
    useState<RequestPathScenarioId>('cold-request');

  const scenario = useMemo(
    () => getRequestPathScenario(scenarioId),
    [scenarioId],
  );

  function handleScenarioChange(value: string) {
    setScenarioId(value as RequestPathScenarioId);
  }

  function reset() {
    setScenarioId('cold-request');
  }

  return (
    <LabShell
      title={isVi ? 'Trình khám phá luồng Request HTTP' : 'Request Path Explorer'}
      description={
        isVi ? (
          <>
            So sánh các luồng đi của request HTTP. Mỗi chặng xác định rõ nó diễn ra trong kịch bản đã chọn, bị bỏ qua, hay phụ thuộc vào điều kiện môi trường triển khai thực tế.
          </>
        ) : (
          <>
            Compare deterministic HTTP request paths without inventing network
            timings. Each stage states whether it occurs in the selected scenario,
            is skipped, or depends on deployment/runtime conditions.
          </>
        )
      }
    >
      <ScenarioSelect
        label={isVi ? 'Kịch bản Request HTTP' : 'HTTP request scenario'}
        value={scenarioId}
        options={HTTP_REQUEST_PATH_SCENARIOS.map((candidate) => ({
          value: candidate.id,
          label: candidate.title,
        }))}
        description={scenario.summary}
        onChange={handleScenarioChange}
      />

      <LabControls>
        <button
          type="button"
          onClick={reset}
          className="rounded-md border px-3 py-2 font-medium hover:bg-fd-muted focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          {isVi ? 'Đặt lại' : 'Reset'}
        </button>
      </LabControls>

      <LiveStatus label={isVi ? 'Luồng Request đã chọn' : 'Selected request path'}>
        <span data-testid="http-path-scenario">
          {scenario.title}: {scenario.summary}
        </span>
      </LiveStatus>

      <LabPanel title={isVi ? 'Các chặng trong luồng Request' : 'Request path stages'}>
        <ol className="space-y-3">
          {scenario.stages.map((stage, index) => (
            <li
              key={stage.id}
              data-stage-id={stage.id}
              data-stage-state={stage.state}
              className="rounded-lg border bg-fd-background p-3"
            >
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span className="text-xs font-medium text-fd-muted-foreground">
                  {isVi ? `Chặng ${index + 1}` : `Stage ${index + 1}`}
                </span>
                <strong>{stage.label}</strong>
                <span className="rounded-md border px-2 py-0.5 text-xs font-medium">
                  {stateLabels[stage.state]}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-fd-muted-foreground">
                {stage.explanation}
              </p>
            </li>
          ))}
        </ol>
      </LabPanel>

      <p className="text-xs text-fd-muted-foreground">
        {isVi
          ? 'Được thực thi/Bỏ qua áp dụng cho kịch bản cố định này. "Có điều kiện" nghĩa là chặng này phụ thuộc vào trạng thái kết nối, bộ nhớ cache, topo mạng hoặc giao thức lựa chọn thay vì luôn xảy ra ở mọi request.'
          : 'Performed/skipped describes this predefined scenario. Conditional means the stage depends on connection state, cache state, deployment topology, protocol choice, or another condition rather than being guaranteed for every HTTP request.'}
      </p>
    </LabShell>
  );
}
