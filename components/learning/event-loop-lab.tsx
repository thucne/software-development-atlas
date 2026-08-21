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
import { useEffect, useMemo, useState } from 'react';

const TASK_SOURCES: TaskSource[] = [
  'script',
  'timer',
  'user-interaction',
  'networking',
  'rendering',
];

const SOURCE_LABELS: Record<TaskSource, string> = {
  script: 'Script',
  timer: 'Timer',
  'user-interaction': 'User interaction',
  networking: 'Networking',
  rendering: 'Rendering',
};

const STATUS_LABELS: Record<EventLoopState['status'], string> = {
  'running-work': 'Running selected work',
  'microtask-checkpoint': 'Microtask checkpoint',
  'scheduler-choice': 'Scheduler choice',
  'rendering-opportunity': 'Rendering opportunity',
  'rendering-update': 'Rendering update',
  idle: 'Idle',
  'starvation-warning': 'Starvation warning',
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

export function EventLoopLab() {
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
      title="Event Loop Lab"
      description={
        <>
          Step through predefined browser scheduling scenarios. The simulator
          models teaching transitions; it does not execute arbitrary JavaScript.
        </>
      }
    >
      <ScenarioSelect
        label="Event loop scenario"
        value={scenarioId}
        options={EVENT_LOOP_SCENARIOS.map((candidate) => ({
          value: candidate.id,
          label: candidate.title,
        }))}
        description={scenario.description}
        onChange={handleScenarioChange}
      />

      <ScrollableCodeRegion label="Scenario source">
        {scenario.source}
      </ScrollableCodeRegion>

      <LabControls trailing={<span>Step {state.stepIndex}</span>}>
        <button
          type="button"
          onClick={handleStep}
          disabled={state.complete || state.status === 'scheduler-choice'}
          className="rounded-md border px-3 py-2 font-medium disabled:cursor-not-allowed disabled:opacity-50 hover:bg-fd-muted focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Step
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
          {canAutoRun ? 'Pause' : 'Run'}
        </button>
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-md border px-3 py-2 font-medium hover:bg-fd-muted focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Reset
        </button>
      </LabControls>

      <LiveStatus label="Status">
        <span data-testid="event-loop-status">{STATUS_LABELS[state.status]}</span>
      </LiveStatus>

      {state.status === 'scheduler-choice' && state.choices.length > 0 ? (
        <section className="space-y-3 rounded-lg border p-4" aria-label="Valid scheduler choices">
          <h4 className="font-semibold">Choose one valid runnable source</h4>
          <p className="text-sm text-fd-muted-foreground">
            Both choices are valid in this simplified scenario. The browser
            platform does not promise one universal cross-source FIFO order.
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
        <LabPanel title="Currently running work">
          {state.current ? (
            <p className="rounded-md border bg-fd-background px-3 py-2 text-sm">
              {state.current.label}
            </p>
          ) : (
            <p className="text-sm text-fd-muted-foreground">None</p>
          )}
        </LabPanel>

        <LabPanel title="Microtasks">
          <QueueList items={state.microtasks} />
        </LabPanel>

        <LabPanel title="Runnable task-source work">
          <div className="space-y-4">
            {TASK_SOURCES.map((source) => (
              <div key={source} className="space-y-2">
                <h5 className="text-sm font-medium">{SOURCE_LABELS[source]}</h5>
                <QueueList items={state.runnableTasksBySource[source] ?? []} />
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-fd-muted-foreground">
            These lanes group runnable work by task source for teaching. They do
            not imply that every task source maps one-to-one to a browser task
            queue; user agents may coalesce task sources into task queues.
          </p>
        </LabPanel>

        <LabPanel title="Rendering-related work">
          <div className="space-y-3">
            <p className="text-sm">
              <strong>Rendering state:</strong> {STATUS_LABELS[state.status]}
            </p>
            <div>
              <h5 className="mb-2 text-sm font-medium">requestAnimationFrame callbacks</h5>
              <QueueList items={state.animationFrameCallbacks} />
            </div>
          </div>
        </LabPanel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <LabPanel title="Output log">
          {state.output.length === 0 ? (
            <p className="text-sm text-fd-muted-foreground">No output yet</p>
          ) : (
            <ol data-testid="event-loop-output" className="list-decimal space-y-1 pl-5 font-mono text-sm">
              {state.output.map((line, index) => (
                <li key={`${index}-${line}`}>{line}</li>
              ))}
            </ol>
          )}
        </LabPanel>

        <LabPanel title="Why this step?">
          <p className="text-sm leading-relaxed" aria-live="polite">
            {state.explanation}
          </p>
        </LabPanel>
      </div>
    </LabShell>
  );
}
