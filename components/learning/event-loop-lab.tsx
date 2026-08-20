'use client';

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
import { useEffect, useId, useMemo, useState } from 'react';

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

function StatePanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border bg-fd-card p-4">
      <h4 className="mb-3 font-semibold">{title}</h4>
      {children}
    </section>
  );
}

export function EventLoopLab() {
  const titleId = useId();
  const explanationId = useId();
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
    <section
      aria-labelledby={titleId}
      className="my-8 space-y-6 rounded-xl border bg-fd-card p-4 sm:p-6"
    >
      <div className="space-y-2">
        <h3 id={titleId} className="text-xl font-semibold">
          Event Loop Lab
        </h3>
        <p className="text-fd-muted-foreground">
          Step through predefined browser scheduling scenarios. The simulator
          models teaching transitions; it does not execute arbitrary JavaScript.
        </p>
      </div>

      <div className="grid gap-3">
        <label htmlFor={`${titleId}-scenario`} className="font-medium">
          Event loop scenario
        </label>
        <select
          id={`${titleId}-scenario`}
          value={scenarioId}
          onChange={(event) => handleScenarioChange(event.currentTarget.value)}
          className="max-w-xl rounded-md border bg-fd-background px-3 py-2"
        >
          {EVENT_LOOP_SCENARIOS.map((candidate) => (
            <option key={candidate.id} value={candidate.id}>
              {candidate.title}
            </option>
          ))}
        </select>
        <p className="text-sm text-fd-muted-foreground">{scenario.description}</p>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-fd-muted p-4 focus-visible:outline-2 focus-visible:outline-offset-2" role="region" aria-label="Scenario source" tabIndex={0}>
        <pre className="min-w-max text-sm leading-relaxed">
          <code>{scenario.source}</code>
        </pre>
      </div>

      <div className="flex flex-wrap items-center gap-2">
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
        <span className="ml-auto text-sm text-fd-muted-foreground">
          Step {state.stepIndex}
        </span>
      </div>

      <div className="rounded-md bg-fd-muted p-3 text-sm" aria-live="polite">
        <strong>Status:</strong>{' '}
        <span data-testid="event-loop-status">{STATUS_LABELS[state.status]}</span>
      </div>

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
        <StatePanel title="Currently running work">
          {state.current ? (
            <p className="rounded-md border bg-fd-background px-3 py-2 text-sm">
              {state.current.label}
            </p>
          ) : (
            <p className="text-sm text-fd-muted-foreground">None</p>
          )}
        </StatePanel>

        <StatePanel title="Microtasks">
          <QueueList items={state.microtasks} />
        </StatePanel>

        <StatePanel title="Runnable task-source work">
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
        </StatePanel>

        <StatePanel title="Rendering-related work">
          <div className="space-y-3">
            <p className="text-sm">
              <strong>Rendering state:</strong> {STATUS_LABELS[state.status]}
            </p>
            <div>
              <h5 className="mb-2 text-sm font-medium">requestAnimationFrame callbacks</h5>
              <QueueList items={state.animationFrameCallbacks} />
            </div>
          </div>
        </StatePanel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <StatePanel title="Output log">
          {state.output.length === 0 ? (
            <p className="text-sm text-fd-muted-foreground">No output yet</p>
          ) : (
            <ol data-testid="event-loop-output" className="list-decimal space-y-1 pl-5 font-mono text-sm">
              {state.output.map((line, index) => (
                <li key={`${index}-${line}`}>{line}</li>
              ))}
            </ol>
          )}
        </StatePanel>

        <section
          aria-labelledby={explanationId}
          className="rounded-lg border bg-fd-card p-4"
        >
          <h4 id={explanationId} className="mb-3 font-semibold">
            Why this step?
          </h4>
          <p className="text-sm leading-relaxed" aria-live="polite">
            {state.explanation}
          </p>
        </section>
      </div>
    </section>
  );
}
