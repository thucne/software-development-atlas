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
import { useEffect, useMemo, useState } from 'react';

const STATE_LABELS: Record<PromiseNode['state'], string> = {
  pending: 'Pending',
  fulfilled: 'Fulfilled',
  rejected: 'Rejected',
};

const RESOLUTION_LABELS: Record<PromiseNode['resolution'], string> = {
  unresolved: 'Unresolved',
  'fulfilled-value': 'Fulfilled with value',
  'rejected-reason': 'Rejected with reason',
  adopting: 'Adopting another promise',
};

function PromiseCard({ promise }: { promise: PromiseNode }) {
  return (
    <article
      data-testid={`promise-node-${promise.id}`}
      className="space-y-3 rounded-lg border bg-fd-background p-4"
    >
      <div>
        <h4 className="font-semibold">{promise.id}</h4>
        <p className="text-sm text-fd-muted-foreground">{promise.label}</p>
      </div>

      <dl className="grid gap-2 text-sm">
        <div className="flex flex-wrap gap-x-2">
          <dt className="font-medium">State:</dt>
          <dd>{STATE_LABELS[promise.state]}</dd>
        </div>
        <div className="flex flex-wrap gap-x-2">
          <dt className="font-medium">Resolution:</dt>
          <dd>{RESOLUTION_LABELS[promise.resolution]}</dd>
        </div>
        {promise.value !== undefined ? (
          <div className="flex flex-wrap gap-x-2">
            <dt className="font-medium">Value:</dt>
            <dd className="font-mono">{promise.value}</dd>
          </div>
        ) : null}
        {promise.reason !== undefined ? (
          <div className="flex flex-wrap gap-x-2">
            <dt className="font-medium">Reason:</dt>
            <dd className="font-mono">{promise.reason}</dd>
          </div>
        ) : null}
        {promise.adopts !== undefined ? (
          <div className="flex flex-wrap gap-x-2">
            <dt className="font-medium">Adopts:</dt>
            <dd className="font-mono">{promise.adopts}</dd>
          </div>
        ) : null}
      </dl>
    </article>
  );
}

function handlerDescription(state: PromiseResolutionState) {
  if (!state.activeHandler) return 'None';

  const handler = state.activeHandler;
  return `${handler.kind}: ${handler.label} (${handler.sourcePromiseId} → ${handler.resultPromiseId})`;
}

export function PromiseResolutionLab() {
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
      title="Promise Resolution Lab"
      description={
        <>
          Step through predefined Promise-resolution scenarios. The lab models
          language semantics for teaching; it does not execute arbitrary
          JavaScript or inspect hidden native Promise state.
        </>
      }
    >
      <ScenarioSelect
        label="Promise scenario"
        value={scenarioId}
        options={PROMISE_SCENARIOS.map((candidate) => ({
          value: candidate.id,
          label: candidate.title,
        }))}
        description={scenario.description}
        onChange={handleScenarioChange}
      />

      <ScrollableCodeRegion label="Promise scenario source">
        {scenario.source}
      </ScrollableCodeRegion>

      <LabControls trailing={<span>Step {state.stepIndex}</span>}>
        <button
          type="button"
          onClick={handleStep}
          disabled={state.complete}
          className="rounded-md border px-3 py-2 font-medium hover:bg-fd-muted focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Step
        </button>
        <button
          type="button"
          onClick={handleRunToggle}
          disabled={state.complete}
          className="rounded-md border px-3 py-2 font-medium hover:bg-fd-muted focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
        <span data-testid="promise-lab-status">
          {state.complete ? 'Complete' : 'In progress'}
        </span>
      </LiveStatus>

      <section className="space-y-3" aria-label="Promise states">
        <h4 className="font-semibold">Promise states</h4>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {state.promises.map((promise) => (
            <PromiseCard key={promise.id} promise={promise} />
          ))}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section
          data-testid="active-promise-handler"
          className="rounded-lg border bg-fd-card p-4"
          aria-label="Active Promise handler"
        >
          <h4 className="mb-3 font-semibold">Active handler</h4>
          <p className="text-sm leading-relaxed">{handlerDescription(state)}</p>
        </section>

        <LabPanel title="Outcome log">
          {state.output.length === 0 ? (
            <p className="text-sm text-fd-muted-foreground">No output yet</p>
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

      <LabPanel title="Why this step?">
        <p className="text-sm leading-relaxed" aria-live="polite">
          {state.explanation}
        </p>
      </LabPanel>
    </LabShell>
  );
}
