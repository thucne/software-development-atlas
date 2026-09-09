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
import { useMemo, useState } from 'react';

const STATE_LABELS: Record<RequestStageState, string> = {
  performed: 'Performed',
  skipped: 'Skipped',
  conditional: 'Conditional',
};

export function HttpRequestPathExplorer() {
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
      title="Request Path Explorer"
      description={
        <>
          Compare deterministic HTTP request paths without inventing network
          timings. Each stage states whether it occurs in the selected scenario,
          is skipped, or depends on deployment/runtime conditions.
        </>
      }
    >
      <ScenarioSelect
        label="HTTP request scenario"
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
          Reset
        </button>
      </LabControls>

      <LiveStatus label="Selected request path">
        <span data-testid="http-path-scenario">
          {scenario.title}: {scenario.summary}
        </span>
      </LiveStatus>

      <LabPanel title="Request path stages">
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
                  Stage {index + 1}
                </span>
                <strong>{stage.label}</strong>
                <span className="rounded-md border px-2 py-0.5 text-xs font-medium">
                  {STATE_LABELS[stage.state]}
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
        Performed/skipped describes this predefined scenario. Conditional means
        the stage depends on connection state, cache state, deployment topology,
        protocol choice, or another condition rather than being guaranteed for
        every HTTP request.
      </p>
    </LabShell>
  );
}
