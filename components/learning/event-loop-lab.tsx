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
  chooseRunnableTask,
  createScenarioState,
  EVENT_LOOP_SCENARIOS,
  stepEventLoop,
  type EventLoopState,
  type ScenarioId,
  type TaskSource,
  type WorkItem,
} from '@/lib/learning/browser-event-loop';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

const TASK_SOURCES: TaskSource[] = [
  'script',
  'timer',
  'user-interaction',
  'networking',
  'rendering',
];

const SOURCE_LABELS_EN: Record<TaskSource, string> = {
  script: 'Script',
  timer: 'Timer',
  'user-interaction': 'User interaction',
  networking: 'Networking',
  rendering: 'Rendering',
};

const SOURCE_LABELS_VI: Record<TaskSource, string> = {
  script: 'Mã kịch bản (Script)',
  timer: 'Bộ đếm giờ (Timer)',
  'user-interaction': 'Tương tác người dùng',
  networking: 'Mạng (Networking)',
  rendering: 'Dựng hình (Rendering)',
};

const STATUS_LABELS_EN: Record<EventLoopState['status'], string> = {
  'running-work': 'Running selected work',
  'microtask-checkpoint': 'Microtask checkpoint',
  'scheduler-choice': 'Scheduler choice',
  'rendering-opportunity': 'Rendering opportunity',
  'rendering-update': 'Rendering update',
  idle: 'Idle',
  'starvation-warning': 'Starvation warning',
};

const STATUS_LABELS_VI: Record<EventLoopState['status'], string> = {
  'running-work': 'Đang thực thi tác vụ',
  'microtask-checkpoint': 'Điểm kiểm tra Microtask (Microtask checkpoint)',
  'scheduler-choice': 'Lựa chọn bộ điều phối (Scheduler choice)',
  'rendering-opportunity': 'Cơ hội dựng hình (Rendering opportunity)',
  'rendering-update': 'Cập nhật giao diện (Rendering update)',
  idle: 'Nghỉ (Idle)',
  'starvation-warning': 'Cảnh báo tắc nghẽn (Starvation warning)',
};

function QueueList({ items, emptyLabel = 'Empty' }: { items: WorkItem[]; emptyLabel?: string }) {
  if (items.length === 0) {
    return <p className="text-sm text-fd-muted-foreground">{emptyLabel}</p>;
  }

  return (
    <ol className="space-y-2">
      {items.map((item) => (
        <li key={item.id} className="rounded-md border bg-fd-background px-3 py-2 text-sm">
          {item.label}
        </li>
      ))}
    </ol>
  );
}

export function EventLoopLab({ locale }: { locale?: 'en' | 'vi' } = {}) {
  const pathname = usePathname() || '';
  const isVi = locale === 'vi' || pathname.includes('/vi/docs') || pathname.endsWith('/vi');
  const sourceLabels = isVi ? SOURCE_LABELS_VI : SOURCE_LABELS_EN;
  const statusLabels = isVi ? STATUS_LABELS_VI : STATUS_LABELS_EN;
  const [scenarioId, setScenarioId] = useState<ScenarioId>('promise-vs-timer');
  const [state, setState] = useState(() =>
    createScenarioState('promise-vs-timer'),
  );
  const [isRunning, setIsRunning] = useState(false);

  const scenario = useMemo(
    () =>
      EVENT_LOOP_SCENARIOS.find((candidate) => candidate.id === scenarioId) ??
      EVENT_LOOP_SCENARIOS[0],
    [scenarioId],
  );

  const canAutoRun =
    isRunning &&
    !state.complete &&
    state.status !== 'scheduler-choice' &&
    state.status !== 'starvation-warning';

  useEffect(() => {
    if (!canAutoRun) return;

    const timeout = window.setTimeout(() => {
      setState((current) => stepEventLoop(current));
    }, 550);

    return () => window.clearTimeout(timeout);
  }, [canAutoRun, state]);

  function reset(nextScenarioId = scenarioId) {
    setIsRunning(false);
    setScenarioId(nextScenarioId);
    setState(createScenarioState(nextScenarioId));
  }

  function handleScenarioChange(value: string) {
    reset(value as ScenarioId);
  }

  function handleStep() {
    setIsRunning(false);
    setState((current) => stepEventLoop(current));
  }

  function handleRunToggle() {
    if (
      state.complete ||
      state.status === 'scheduler-choice' ||
      state.status === 'starvation-warning'
    ) {
      return;
    }

    setIsRunning((current) => !current);
  }

  function handleSchedulerChoice(choiceId: string) {
    setIsRunning(false);
    setState((current) => chooseRunnableTask(current, choiceId));
  }

  return (
    <LabShell
      title={isVi ? 'Phòng thực hành Event Loop' : 'Event Loop Lab'}
      description={
        isVi ? (
          <>
            Từng bước khám phá các kịch bản lập lịch tác vụ của trình duyệt. Trình mô phỏng mô hình hóa chuyển đổi trạng thái phục vụ học tập, không chạy mã JavaScript tùy ý.
          </>
        ) : (
          <>
            Step through predefined browser scheduling scenarios. The simulator
            models teaching transitions; it does not execute arbitrary JavaScript.
          </>
        )
      }
    >
      <ScenarioSelect
        label={isVi ? 'Kịch bản Event Loop' : 'Event loop scenario'}
        value={scenarioId}
        options={EVENT_LOOP_SCENARIOS.map((candidate) => ({
          value: candidate.id,
          label: candidate.title,
        }))}
        description={scenario.description}
        onChange={handleScenarioChange}
      />

      <ScrollableCodeRegion label={isVi ? 'Mã nguồn kịch bản' : 'Scenario source'}>
        {scenario.source}
      </ScrollableCodeRegion>

      <LabControls trailing={<span>{isVi ? `Bước ${state.stepIndex}` : `Step ${state.stepIndex}`}</span>}>
        <button
          type="button"
          onClick={handleStep}
          disabled={state.complete || state.status === 'scheduler-choice'}
          className="rounded-md border px-3 py-2 font-medium disabled:cursor-not-allowed disabled:opacity-50 hover:bg-fd-muted focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          {isVi ? 'Bước tiếp' : 'Step'}
        </button>
        <button
          type="button"
          onClick={handleRunToggle}
          disabled={
            state.complete ||
            state.status === 'scheduler-choice' ||
            state.status === 'starvation-warning'
          }
          className="rounded-md border px-3 py-2 font-medium disabled:cursor-not-allowed disabled:opacity-50 hover:bg-fd-muted focus-visible:outline-2 focus-visible:outline-offset-2"
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
        <span data-testid="event-loop-status">{statusLabels[state.status]}</span>
      </LiveStatus>

      {state.status === 'scheduler-choice' && state.choices.length > 0 ? (
        <section className="space-y-3 rounded-lg border p-4" aria-label={isVi ? 'Lựa chọn hợp lệ của bộ điều phối' : 'Valid scheduler choices'}>
          <h4 className="font-semibold">{isVi ? 'Chọn một nguồn tác vụ hợp lệ' : 'Choose one valid runnable source'}</h4>
          <p className="text-sm text-fd-muted-foreground">
            {isVi
              ? 'Cả hai lựa chọn đều hợp lệ trong kịch bản đơn giản hóa này. Trình duyệt không cam kết thứ tự FIFO tuyệt đối giữa các nguồn khác nhau.'
              : 'Both choices are valid in this simplified scenario. The browser platform does not promise one universal cross-source FIFO order.'}
          </p>
          <div className="flex flex-wrap gap-2">
            {state.choices.map((choice) => (
              <button
                key={choice.id}
                type="button"
                onClick={() => handleSchedulerChoice(choice.id)}
                className="rounded-md border px-3 py-2 font-medium hover:bg-fd-muted focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                {choice.label}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <LabPanel title={isVi ? 'Tác vụ đang thực thi' : 'Currently running work'}>
          {state.current ? (
            <p className="rounded-md border bg-fd-background px-3 py-2 text-sm">
              {state.current.label}
            </p>
          ) : (
            <p className="text-sm text-fd-muted-foreground">{isVi ? 'Không có' : 'None'}</p>
          )}
        </LabPanel>

        <LabPanel title={isVi ? 'Hàng đợi Microtasks' : 'Microtasks'}>
          <QueueList items={state.microtasks} emptyLabel={isVi ? 'Trống' : 'Empty'} />
        </LabPanel>

        <LabPanel title={isVi ? 'Tác vụ sẵn sàng theo nguồn' : 'Runnable task-source work'}>
          <div className="space-y-4">
            {TASK_SOURCES.map((source) => (
              <div key={source} className="space-y-2">
                <h5 className="text-sm font-medium">{sourceLabels[source]}</h5>
                <QueueList items={state.runnableTasksBySource[source] ?? []} emptyLabel={isVi ? 'Trống' : 'Empty'} />
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-fd-muted-foreground">
            {isVi
              ? 'Các luồng này gom nhóm công việc theo nguồn tác vụ phục vụ giải thích. Điều này không có nghĩa là mỗi nguồn tác vụ tương ứng 1-1 với một hàng đợi tác vụ của trình duyệt.'
              : 'These lanes group runnable work by task source for teaching. They do not imply that every task source maps one-to-one to a browser task queue; user agents may coalesce task sources into task queues.'}
          </p>
        </LabPanel>

        <LabPanel title={isVi ? 'Công việc liên quan đến dựng hình' : 'Rendering-related work'}>
          <div className="space-y-3">
            <p className="text-sm">
              <strong>{isVi ? 'Trạng thái dựng hình:' : 'Rendering state:'}</strong> {statusLabels[state.status]}
            </p>
            <div>
              <h5 className="mb-2 text-sm font-medium">{isVi ? 'Các hàm gọi lại requestAnimationFrame' : 'requestAnimationFrame callbacks'}</h5>
              <QueueList items={state.animationFrameCallbacks} emptyLabel={isVi ? 'Trống' : 'Empty'} />
            </div>
          </div>
        </LabPanel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <LabPanel title={isVi ? 'Nhật ký kết quả' : 'Output log'}>
          {state.output.length === 0 ? (
            <p className="text-sm text-fd-muted-foreground">{isVi ? 'Chưa có kết quả' : 'No output yet'}</p>
          ) : (
            <ol data-testid="event-loop-output" className="list-decimal space-y-1 pl-5 font-mono text-sm">
              {state.output.map((line, index) => (
                <li key={`${index}-${line}`}>{line}</li>
              ))}
            </ol>
          )}
        </LabPanel>

        <LabPanel title={isVi ? 'Giải thích bước này' : 'Why this step?'}>
          <p className="text-sm leading-relaxed" aria-live="polite">
            {state.explanation}
          </p>
        </LabPanel>
      </div>
    </LabShell>
  );
}
