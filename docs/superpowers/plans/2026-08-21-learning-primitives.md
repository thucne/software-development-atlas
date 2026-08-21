# Phase 0.3 Learning Primitives Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract the smallest reusable presentation/accessibility primitives proven across the three completed interactive lessons while preserving every lesson's domain model, behavior, accessible names, and test contracts.

**Architecture:** Add six deliberately boring React presentation primitives under `components/learning/primitives/`. Prove their semantic markup with a server-rendered Vitest contract test, then migrate `EventLoopLab`, `PromiseResolutionLab`, and `AsyncWaterfallLab` as behavior-preserving refactors. The learning models in `lib/learning/*` remain untouched and React-free; no generic state-machine, scenario runner, playback hook, or execution-timeline abstraction is introduced.

**Tech Stack:** Next.js 16.3.0, React 19.2.8, TypeScript 6.0.3, Fumadocs UI 16.14.2, Tailwind CSS 4.3.3, Vitest 4.1.10, Playwright 1.62.1, axe-core Playwright 4.12.1, pnpm 10.15.1.

**Spec:** `docs/superpowers/specs/2026-08-21-learning-primitives-design.md`

## Global Constraints

- Extract structure, not semantics.
- Do not add a generic `ScenarioDefinition` shared across lessons.
- Do not add a generic state-machine/scenario engine.
- Do not add `useScenarioRunner`, `usePlayback`, or any generic autoplay hook.
- Do not add shared transition/state types for Event Loop and Promises.
- Do not extract a generic execution timeline, queue visualization, Promise visualization, code-comparison, quiz/challenge, benchmark, freshness, or source-list framework.
- Do not add Sandpack, WebContainers, arbitrary code execution, a database, hosted state, analytics, or model APIs.
- Do not add runtime or development dependencies.
- `package.json`, `pnpm-lock.yaml`, and `.github/workflows/ci.yml` must remain unchanged.
- Learning primitives must not import from `lib/learning/*`.
- Pure learning models must remain React-free.
- Existing accessible names and stable `data-testid` contracts are normative unless a real accessibility defect requires a justified change.
- Existing lesson MDX/raw Markdown content is not changed in this PR.
- Existing unit tests for `async-schedule`, `browser-event-loop`, and `promise-resolution` remain behaviorally unchanged.
- Permanent CI remains frozen install, lint, typecheck, unit tests, production build, Chromium install, Playwright, and axe serious/critical checks.

---

## File Structure

### New production files

- `components/learning/primitives/lab-shell.tsx` — accessible outer lab section, generated heading id, common intro/card presentation.
- `components/learning/primitives/lab-panel.tsx` — semantic titled bordered panel with internally generated heading id.
- `components/learning/primitives/lab-controls.tsx` — action-row layout plus optional trailing content; no action behavior.
- `components/learning/primitives/scenario-select.tsx` — controlled string-valued select with internal label/select id and visible description.
- `components/learning/primitives/scrollable-code-region.tsx` — named, keyboard-focusable, horizontally scrollable `<pre><code>` source region.
- `components/learning/primitives/live-status.tsx` — `aria-live="polite"` status/result surface with optional visible label.
- `components/learning/primitives/index.ts` — explicit public exports for the six primitives only.

### New test file

- `tests/learning-primitives.test.tsx` — server-rendered semantic contract tests using `react-dom/server`; no jsdom dependency.

### Existing files to refactor

- `components/learning/event-loop-lab.tsx`
- `components/learning/promise-resolution-lab.tsx`
- `components/learning/async-waterfall-lab.tsx`

### Existing acceptance tests kept as normative contracts

- `tests/e2e/browser-event-loop.spec.ts`
- `tests/e2e/promises.spec.ts`
- `tests/e2e/async-waterfalls.spec.ts`

---

### Task 1: Add semantic learning primitives with a real RED/GREEN cycle

**Files:**
- Create: `tests/learning-primitives.test.tsx`
- Create: `components/learning/primitives/lab-shell.tsx`
- Create: `components/learning/primitives/lab-panel.tsx`
- Create: `components/learning/primitives/lab-controls.tsx`
- Create: `components/learning/primitives/scenario-select.tsx`
- Create: `components/learning/primitives/scrollable-code-region.tsx`
- Create: `components/learning/primitives/live-status.tsx`
- Create: `components/learning/primitives/index.ts`

**Interfaces:**

Produces these exact public components:

```ts
export type LabShellProps = {
  title: string;
  description: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export function LabShell(props: LabShellProps): React.ReactElement;
```

```ts
export type LabPanelProps = {
  title: string;
  children: React.ReactNode;
  className?: string;
};

export function LabPanel(props: LabPanelProps): React.ReactElement;
```

```ts
export type LabControlsProps = {
  children: React.ReactNode;
  trailing?: React.ReactNode;
};

export function LabControls(props: LabControlsProps): React.ReactElement;
```

```ts
export type ScenarioOption = {
  value: string;
  label: string;
};

export type ScenarioSelectProps = {
  label: string;
  value: string;
  options: readonly ScenarioOption[];
  description: React.ReactNode;
  onChange: (value: string) => void;
};

export function ScenarioSelect(props: ScenarioSelectProps): React.ReactElement;
```

```ts
export type ScrollableCodeRegionProps = {
  label: string;
  children: React.ReactNode;
};

export function ScrollableCodeRegion(
  props: ScrollableCodeRegionProps,
): React.ReactElement;
```

```ts
export type LiveStatusProps = {
  label?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export function LiveStatus(props: LiveStatusProps): React.ReactElement;
```

The primitives may use `useId()` internally. They must not consume domain-specific types.

- [ ] **Step 1: Write the failing server-rendered primitive contract test**

Create `tests/learning-primitives.test.tsx`:

```tsx
import {
  LabControls,
  LabPanel,
  LabShell,
  LiveStatus,
  ScenarioSelect,
  ScrollableCodeRegion,
} from '@/components/learning/primitives';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, test } from 'vitest';

describe('learning primitives', () => {
  test('LabShell names its semantic section from its visible title', () => {
    const html = renderToStaticMarkup(
      <LabShell title="Example Lab" description="A teaching description">
        <p>Body</p>
      </LabShell>,
    );

    expect(html).toContain('<section');
    expect(html).toMatch(/aria-labelledby="[^"]+"/);
    expect(html).toMatch(/<h3 id="[^"]+"[^>]*>Example Lab<\/h3>/);
    expect(html).toContain('A teaching description');
    expect(html).toContain('<p>Body</p>');
  });

  test('LabPanel is a titled semantic section', () => {
    const html = renderToStaticMarkup(
      <LabPanel title="Output log">
        <p>None</p>
      </LabPanel>,
    );

    expect(html).toContain('<section');
    expect(html).toMatch(/aria-labelledby="[^"]+"/);
    expect(html).toMatch(/<h4 id="[^"]+"[^>]*>Output log<\/h4>/);
  });

  test('ScenarioSelect owns its label association and visible description', () => {
    const html = renderToStaticMarkup(
      <ScenarioSelect
        label="Promise scenario"
        value="one"
        options={[
          { value: 'one', label: 'One' },
          { value: 'two', label: 'Two' },
        ]}
        description="Current scenario description"
        onChange={() => {}}
      />,
    );

    const labelFor = html.match(/<label for="([^"]+)"/)?.[1];
    expect(labelFor).toBeTruthy();
    expect(html).toContain(`id="${labelFor}"`);
    expect(html).toContain('Promise scenario');
    expect(html).toContain('Current scenario description');
    expect(html).toContain('<option value="one" selected="">One</option>');
    expect(html).toContain('<option value="two">Two</option>');
  });

  test('ScrollableCodeRegion is named, focusable, and uses pre/code markup', () => {
    const html = renderToStaticMarkup(
      <ScrollableCodeRegion label="Scenario source">
        {'const value = 1;'}
      </ScrollableCodeRegion>,
    );

    expect(html).toContain('role="region"');
    expect(html).toContain('aria-label="Scenario source"');
    expect(html).toContain('tabindex="0"');
    expect(html).toContain('<pre');
    expect(html).toContain('<code>const value = 1;</code>');
  });

  test('LiveStatus uses polite announcements and preserves domain-owned children', () => {
    const html = renderToStaticMarkup(
      <LiveStatus label="Status">
        <span data-testid="domain-status">Idle</span>
      </LiveStatus>,
    );

    expect(html).toContain('aria-live="polite"');
    expect(html).toContain('<strong>Status:</strong>');
    expect(html).toContain('data-testid="domain-status"');
    expect(html).toContain('Idle');
  });

  test('LabControls lays out caller-owned actions and trailing content', () => {
    const html = renderToStaticMarkup(
      <LabControls trailing={<span>Step 2</span>}>
        <button type="button">Step</button>
      </LabControls>,
    );

    expect(html).toContain('<button type="button">Step</button>');
    expect(html).toContain('Step 2');
  });
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
pnpm exec vitest run tests/learning-primitives.test.tsx
```

Expected result: FAIL during module resolution because `@/components/learning/primitives` does not exist yet. Confirm the failure is the missing production module rather than syntax/configuration errors.

- [ ] **Step 3: Implement `LabShell`**

Create `components/learning/primitives/lab-shell.tsx`:

```tsx
import { useId, type ReactNode } from 'react';

export type LabShellProps = {
  title: string;
  description: ReactNode;
  children: ReactNode;
  className?: string;
};

export function LabShell({
  title,
  description,
  children,
  className = '',
}: LabShellProps) {
  const titleId = useId();

  return (
    <section
      aria-labelledby={titleId}
      className={`my-8 space-y-6 rounded-xl border bg-fd-card p-4 sm:p-6 ${className}`.trim()}
    >
      <div className="space-y-2">
        <h3 id={titleId} className="text-xl font-semibold">
          {title}
        </h3>
        <div className="text-fd-muted-foreground">{description}</div>
      </div>
      {children}
    </section>
  );
}
```

Keep the primitive server-compatible; do not add `'use client'`. `useId()` is valid for server rendering and client consumers.

- [ ] **Step 4: Implement `LabPanel`**

Create `components/learning/primitives/lab-panel.tsx`:

```tsx
import { useId, type ReactNode } from 'react';

export type LabPanelProps = {
  title: string;
  children: ReactNode;
  className?: string;
};

export function LabPanel({ title, children, className = '' }: LabPanelProps) {
  const titleId = useId();

  return (
    <section
      aria-labelledby={titleId}
      className={`rounded-lg border bg-fd-card p-4 ${className}`.trim()}
    >
      <h4 id={titleId} className="mb-3 font-semibold">
        {title}
      </h4>
      {children}
    </section>
  );
}
```

- [ ] **Step 5: Implement `LabControls`**

Create `components/learning/primitives/lab-controls.tsx`:

```tsx
import type { ReactNode } from 'react';

export type LabControlsProps = {
  children: ReactNode;
  trailing?: ReactNode;
};

export function LabControls({ children, trailing }: LabControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {children}
      {trailing ? (
        <div className="ml-auto text-sm text-fd-muted-foreground">{trailing}</div>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 6: Implement `ScenarioSelect`**

Create `components/learning/primitives/scenario-select.tsx`:

```tsx
import { useId, type ReactNode } from 'react';

export type ScenarioOption = {
  value: string;
  label: string;
};

export type ScenarioSelectProps = {
  label: string;
  value: string;
  options: readonly ScenarioOption[];
  description: ReactNode;
  onChange: (value: string) => void;
};

export function ScenarioSelect({
  label,
  value,
  options,
  description,
  onChange,
}: ScenarioSelectProps) {
  const selectId = useId();

  return (
    <div className="grid gap-3">
      <label htmlFor={selectId} className="font-medium">
        {label}
      </label>
      <select
        id={selectId}
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
        className="max-w-xl rounded-md border bg-fd-background px-3 py-2"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="text-sm text-fd-muted-foreground">{description}</div>
    </div>
  );
}
```

- [ ] **Step 7: Implement `ScrollableCodeRegion`**

Create `components/learning/primitives/scrollable-code-region.tsx`:

```tsx
import type { ReactNode } from 'react';

export type ScrollableCodeRegionProps = {
  label: string;
  children: ReactNode;
};

export function ScrollableCodeRegion({
  label,
  children,
}: ScrollableCodeRegionProps) {
  return (
    <div
      role="region"
      aria-label={label}
      tabIndex={0}
      className="overflow-x-auto rounded-lg border bg-fd-muted p-4 focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      <pre className="min-w-max text-sm leading-relaxed">
        <code>{children}</code>
      </pre>
    </div>
  );
}
```

- [ ] **Step 8: Implement `LiveStatus`**

Create `components/learning/primitives/live-status.tsx`:

```tsx
import type { ReactNode } from 'react';

export type LiveStatusProps = {
  label?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function LiveStatus({
  label,
  children,
  className = '',
}: LiveStatusProps) {
  return (
    <div
      aria-live="polite"
      className={`rounded-md bg-fd-muted p-3 text-sm ${className}`.trim()}
    >
      {label ? <strong>{label}:</strong> : null}
      {label ? ' ' : null}
      {children}
    </div>
  );
}
```

- [ ] **Step 9: Add explicit primitive exports**

Create `components/learning/primitives/index.ts`:

```ts
export { LabControls, type LabControlsProps } from './lab-controls';
export { LabPanel, type LabPanelProps } from './lab-panel';
export { LabShell, type LabShellProps } from './lab-shell';
export { LiveStatus, type LiveStatusProps } from './live-status';
export {
  ScenarioSelect,
  type ScenarioOption,
  type ScenarioSelectProps,
} from './scenario-select';
export {
  ScrollableCodeRegion,
  type ScrollableCodeRegionProps,
} from './scrollable-code-region';
```

Do not export generic domain or runner types because none exist.

- [ ] **Step 10: Run focused primitive test and verify GREEN**

Run:

```bash
pnpm exec vitest run tests/learning-primitives.test.tsx
```

Expected: 6 tests PASS.

Then run:

```bash
pnpm typecheck
pnpm lint
```

Expected: both PASS with no repository lint warnings.

- [ ] **Step 11: Commit Task 1**

Commit only the new primitive files and primitive test:

```bash
git add components/learning/primitives tests/learning-primitives.test.tsx
git commit -m "refactor: add shared learning presentation primitives"
```

---

### Task 2: Migrate Event Loop Lab to the presentation primitives

**Files:**
- Modify: `components/learning/event-loop-lab.tsx`
- Acceptance: `tests/e2e/browser-event-loop.spec.ts`

**Interfaces:**
- Consumes the six primitives from Task 1.
- Keeps `EventLoopState`, `ScenarioId`, `TaskSource`, `WorkItem`, `EVENT_LOOP_SCENARIOS`, `createScenarioState`, `stepEventLoop`, and `chooseRunnableTask` unchanged.
- Keeps existing public export `EventLoopLab` unchanged.
- Keeps stable selectors `event-loop-status` and `event-loop-output` unchanged.

This is the REFACTOR phase after Task 1 is green. Do not create a generic runner or move domain behavior into primitives.

- [ ] **Step 1: Establish the current Event Loop characterization baseline**

Run the current browser-event-loop Playwright suite on the green Task 1 commit:

```bash
pnpm exec playwright test tests/e2e/browser-event-loop.spec.ts
```

Expected: existing Event Loop tests PASS. Record the count before refactoring.

- [ ] **Step 2: Replace only the outer shell**

In `components/learning/event-loop-lab.tsx`, import:

```tsx
import {
  LabControls,
  LabPanel,
  LabShell,
  LiveStatus,
  ScenarioSelect,
  ScrollableCodeRegion,
} from '@/components/learning/primitives';
```

Remove the lab-owned `titleId` because `LabShell` owns that relation. Keep `explanationId` only if still required after replacing its section; otherwise remove it.

Replace:

```tsx
<section aria-labelledby={titleId} ...>
  <div className="space-y-2">
    <h3 id={titleId}>Event Loop Lab</h3>
    <p>...</p>
  </div>
  ...
</section>
```

with:

```tsx
<LabShell
  title="Event Loop Lab"
  description={
    <>
      Step through predefined browser scheduling scenarios. The simulator
      models teaching transitions; it does not execute arbitrary JavaScript.
    </>
  }
>
  ...
</LabShell>
```

Do not change any state initialization or transition logic.

- [ ] **Step 3: Replace scenario selector and source region**

Use:

```tsx
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
```

The accessible select label must remain exactly `Event loop scenario` and the source region label exactly `Scenario source` because the browser contract relies on them.

- [ ] **Step 4: Replace action-row layout only**

Wrap the existing Step/Run/Reset native buttons in:

```tsx
<LabControls trailing={<span>Step {state.stepIndex}</span>}>
  {existing native buttons with unchanged labels/disabled rules}
</LabControls>
```

Do not move `handleStep`, `handleRunToggle`, `handleSchedulerChoice`, `canAutoRun`, or disabled logic into a primitive.

- [ ] **Step 5: Replace the status surface**

Use:

```tsx
<LiveStatus label="Status">
  <span data-testid="event-loop-status">{STATUS_LABELS[state.status]}</span>
</LiveStatus>
```

Keep the test id exactly unchanged.

- [ ] **Step 6: Replace generic titled panels only**

Remove local `StatePanel` and replace suitable sections with `LabPanel`:

```tsx
<LabPanel title="Currently running work">...</LabPanel>
<LabPanel title="Microtasks">...</LabPanel>
<LabPanel title="Runnable task-source work">...</LabPanel>
<LabPanel title="Rendering-related work">...</LabPanel>
<LabPanel title="Output log">...</LabPanel>
<LabPanel title="Why this step?">
  <p className="text-sm leading-relaxed" aria-live="polite">
    {state.explanation}
  </p>
</LabPanel>
```

Keep `QueueList`, `TASK_SOURCES`, labels, scheduler-choice section, output list rendering, and all domain-specific copy local.

- [ ] **Step 7: Verify Event Loop behavior is unchanged**

Run:

```bash
pnpm exec playwright test tests/e2e/browser-event-loop.spec.ts
pnpm typecheck
pnpm lint
```

Expected: all Event Loop browser tests PASS; typecheck and lint PASS with no new warnings.

- [ ] **Step 8: Commit Task 2**

```bash
git add components/learning/event-loop-lab.tsx
git commit -m "refactor: migrate event loop lab to learning primitives"
```

---

### Task 3: Migrate Promise Resolution Lab without sharing its state machine

**Files:**
- Modify: `components/learning/promise-resolution-lab.tsx`
- Acceptance: `tests/e2e/promises.spec.ts`

**Interfaces:**
- Consumes presentation primitives from Task 1.
- Keeps all imports from `lib/learning/promise-resolution` unchanged.
- Keeps `PromiseCard`, state/resolution label maps, and `handlerDescription` specialized.
- Keeps stable selectors `promise-lab-status`, `promise-lab-output`, `active-promise-handler`, and `promise-node-*` unchanged.

- [ ] **Step 1: Establish Promise characterization baseline**

Run:

```bash
pnpm exec playwright test tests/e2e/promises.spec.ts
```

Expected: existing Promise browser tests PASS before migration.

- [ ] **Step 2: Migrate outer shell, selector, and source region**

Import the primitives and replace repeated structure with:

```tsx
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
  ...
</LabShell>
```

The select label must remain exactly `Promise scenario` and source region label exactly `Promise scenario source`.

- [ ] **Step 3: Migrate controls and status**

Use `LabControls` while keeping the native Step/Run/Reset buttons and exact disabled rules in the Promise lab.

Use:

```tsx
<LiveStatus label="Status">
  <span data-testid="promise-lab-status">
    {state.complete ? 'Complete' : 'In progress'}
  </span>
</LiveStatus>
```

- [ ] **Step 4: Migrate generic panels but keep Promise cards local**

Use `LabPanel` for `Active handler`, `Outcome log`, and `Why this step?`. Keep the `Promise states` section specialized because its heading/layout differs and `PromiseCard` is domain-specific.

Preserve:

```tsx
data-testid="active-promise-handler"
```

on the content container by passing a nested `<div data-testid="active-promise-handler">...</div>` inside the `LabPanel` rather than teaching `LabPanel` about test ids.

Keep `aria-live="polite"` on the explanation paragraph.

- [ ] **Step 5: Verify Promise semantics and accessibility contracts are unchanged**

Run:

```bash
pnpm exec playwright test tests/e2e/promises.spec.ts
pnpm typecheck
pnpm lint
```

Expected: all Promise browser tests PASS; typecheck and lint PASS.

- [ ] **Step 6: Commit Task 3**

```bash
git add components/learning/promise-resolution-lab.tsx
git commit -m "refactor: migrate promise lab to learning primitives"
```

---

### Task 4: Migrate only the genuinely shared Async Waterfall structure

**Files:**
- Modify: `components/learning/async-waterfall-lab.tsx`
- Acceptance: `tests/e2e/async-waterfalls.spec.ts`

**Interfaces:**
- Uses `LabShell`, `LabControls`, and `LiveStatus`.
- May use `LabPanel` only if it reduces duplication without changing the schedule semantics; default plan is to leave `SchedulePanel` specialized.
- Does not use `ScenarioSelect` or `ScrollableCodeRegion`.
- Keeps `Timeline`, `SchedulePanel`, duration controls, animation, playback timer, schedule calculations, and stable timing selectors unchanged.

- [ ] **Step 1: Establish Async Waterfall characterization baseline**

Run:

```bash
pnpm exec playwright test tests/e2e/async-waterfalls.spec.ts
```

Expected: existing Async Waterfall browser tests PASS before migration.

- [ ] **Step 2: Replace the outer lab section with `LabShell`**

Use:

```tsx
<LabShell
  title="Async Waterfall Lab"
  description={
    <>
      Change the durations to compare sequential waiting with independent
      asynchronous work that starts together. Both timelines use the same
      elapsed-time scale.
    </>
  }
>
  ...
</LabShell>
```

Remove only the now-redundant `titleId`. Keep all timing state and `useEffect` cleanup unchanged.

- [ ] **Step 3: Replace the action-row layout only**

Use:

```tsx
<LabControls>
  {existing Play/Replay and Reset buttons}
</LabControls>
```

Keep the exact labels `Play timelines` / `Replay timelines` and `Reset`, plus playback lifecycle, in the specialized lab.

- [ ] **Step 4: Replace the savings result with `LiveStatus` only if semantics remain equivalent**

Use:

```tsx
<LiveStatus>
  With these durations, starting independent work together saves{' '}
  <strong data-testid="time-saved" className="tabular-nums">
    {savedMs}ms
  </strong>{' '}
  of elapsed time.
</LiveStatus>
```

This keeps the existing polite announcement behavior and `time-saved` selector. Do not force `SchedulePanel` into `LabPanel`; its semantic heading, timeline, table, and total are one specialized unit.

- [ ] **Step 5: Verify timing and keyboard behavior are unchanged**

Run:

```bash
pnpm exec playwright test tests/e2e/async-waterfalls.spec.ts
pnpm typecheck
pnpm lint
```

Expected: all Async Waterfall browser tests PASS; typecheck and lint PASS.

- [ ] **Step 6: Commit Task 4**

```bash
git add components/learning/async-waterfall-lab.tsx
git commit -m "refactor: migrate async waterfall lab shell"
```

---

### Task 5: Strengthen direct accessibility contracts where the extraction now centralizes them

**Files:**
- Modify: `tests/e2e/browser-event-loop.spec.ts`
- Modify: `tests/e2e/promises.spec.ts`
- Modify: `tests/e2e/async-waterfalls.spec.ts`

**Interfaces:**
- Tests user-visible semantics only; never assert primitive class names, file structure, or React component names.
- Existing tests remain intact.

Because these semantics already existed before the extraction, this task is regression-hardening rather than feature development. The new assertions should fail if the shared primitive later drops the semantic/accessibility contract.

- [ ] **Step 1: Add Event Loop semantic-structure assertions**

Extend the Event Loop keyboard/accessibility test with real DOM semantics:

```ts
const labHeading = page.getByRole('heading', {
  name: 'Event Loop Lab',
  exact: true,
});
const labSection = page.locator('section').filter({ has: labHeading }).first();
await expect(labSection).toHaveAttribute('aria-labelledby', await labHeading.getAttribute('id'));

const sourceRegion = page.getByRole('region', { name: 'Scenario source' });
await expect(sourceRegion).toHaveAttribute('tabindex', '0');

const status = page.getByTestId('event-loop-status').locator('..');
await expect(status).toHaveAttribute('aria-live', 'polite');
```

If parent traversal is brittle because React renders whitespace/text nodes differently, select the nearest `[aria-live="polite"]` ancestor with `locator('xpath=ancestor::*[@aria-live="polite"][1]')`. The assertion must target rendered semantics, not implementation classes.

- [ ] **Step 2: Add Promise semantic-structure assertions**

In the Promise keyboard/accessibility test assert:

```ts
const sourceRegion = page.getByRole('region', {
  name: 'Promise scenario source',
});
await expect(sourceRegion).toHaveAttribute('tabindex', '0');

const statusLiveRegion = page
  .getByTestId('promise-lab-status')
  .locator('xpath=ancestor::*[@aria-live="polite"][1]');
await expect(statusLiveRegion).toHaveAttribute('aria-live', 'polite');
```

Also verify the visible `Promise scenario` select remains accessible via `getByLabel('Promise scenario', { exact: true })`.

- [ ] **Step 3: Add Async Waterfall live-result assertion**

Assert the savings result remains inside a polite live region:

```ts
const savingsLiveRegion = page
  .getByTestId('time-saved')
  .locator('xpath=ancestor::*[@aria-live="polite"][1]');
await expect(savingsLiveRegion).toHaveAttribute('aria-live', 'polite');
```

Do not assert that the Waterfall lab has scenario controls because it intentionally does not.

- [ ] **Step 4: Run all three lesson browser suites**

Run:

```bash
pnpm exec playwright test \
  tests/e2e/async-waterfalls.spec.ts \
  tests/e2e/browser-event-loop.spec.ts \
  tests/e2e/promises.spec.ts
```

Expected: all tests PASS. If a new assertion fails, first determine whether the primitive violated the approved accessibility contract or the locator is implementation-specific; fix the product for a real contract violation and fix the test for locator brittleness.

- [ ] **Step 5: Commit Task 5**

```bash
git add tests/e2e/async-waterfalls.spec.ts tests/e2e/browser-event-loop.spec.ts tests/e2e/promises.spec.ts
git commit -m "test: protect shared learning accessibility contracts"
```

---

### Task 6: Full verification and Phase 0.3 branch audit

**Files:**
- Create: `docs/superpowers/plans/2026-08-21-learning-primitives-self-review.md`
- Inspect: all files changed relative to `main`
- Do not change lesson MDX, manifests, lockfile, or CI workflow.

**Interfaces:**
- Final branch must remain based on the PR #7 squash merge line.
- PR #8 remains unmerged until explicit user authorization.
- Do not delete `agent/learning-primitives`.

- [ ] **Step 1: Run focused unit suite**

Run:

```bash
pnpm test
```

Expected: all existing model/schema tests plus the new `learning-primitives.test.tsx` suite PASS with zero failures.

- [ ] **Step 2: Run lint and typecheck**

Run:

```bash
pnpm lint
pnpm typecheck
```

Expected: both PASS with no repository lint warnings introduced by PR #8.

- [ ] **Step 3: Run production build**

Run:

```bash
pnpm build
```

Expected: Next.js production build PASS.

- [ ] **Step 4: Run the full browser/accessibility suite**

Ensure Chromium exists, then run:

```bash
pnpm exec playwright install chromium
pnpm test:e2e
```

Expected: all Playwright tests PASS, including all existing axe serious/critical checks with no excluded rules.

- [ ] **Step 5: Audit the branch diff against `main`**

Verify all of the following:

```text
Expected additions:
- six primitive component files
- one primitive barrel export
- one primitive Vitest contract test
- implementation plan + self-review document

Expected modifications:
- AsyncWaterfallLab
- EventLoopLab
- PromiseResolutionLab
- the three e2e suites only for semantic regression assertions

Forbidden diff:
- lib/learning/async-schedule.ts
- lib/learning/browser-event-loop.ts
- lib/learning/promise-resolution.ts
- lesson MDX files
- package.json
- pnpm-lock.yaml
- .github/workflows/ci.yml
- content schema
```

If any forbidden file differs, investigate and remove the unintended change before completion.

- [ ] **Step 6: Write the self-review document**

Create `docs/superpowers/plans/2026-08-21-learning-primitives-self-review.md` with these explicit sections:

```markdown
# Phase 0.3 Learning Primitives Self-Review

## Spec coverage
- List each approved primitive and where it is used.
- Confirm all domain models remain unchanged.
- Confirm no generic runner/state-machine/timeline abstraction exists.

## Behavior preservation
- Record unit test count and result.
- Record Playwright test count and result.
- Record lint/typecheck/build result.
- Record axe result through the full browser suite.

## Diff audit
- Record ahead/behind counts.
- List changed files.
- Confirm package/lockfile/CI/lesson-MDX/model files are unchanged.

## Abstraction review
- Explain why each extracted primitive is presentation-only.
- Note intentionally deferred candidates for future evidence.

## Known warnings
- Record any upstream/tooling warnings that are not introduced by PR #8.
```

Do not claim completion until the exact final branch head has passed the permanent CI workflow.

- [ ] **Step 7: Commit self-review**

```bash
git add docs/superpowers/plans/2026-08-21-learning-primitives-self-review.md
git commit -m "docs: record Phase 0.3 primitives self-review"
```

- [ ] **Step 8: Verify permanent GitHub Actions on exact head**

Wait for the PR-triggered permanent CI run on the final branch head and verify every step:

- frozen install
- lint
- typecheck
- unit tests
- build
- Chromium install
- browser and accessibility tests

Read the job logs to capture exact unit and Playwright counts. Do not infer counts from an earlier commit.

- [ ] **Step 9: Update PR #8 metadata and mark ready for review**

Only after Step 8 is successful:

- change title to `refactor: extract proven learning primitives`
- replace the draft spec-only body with implementation summary, abstraction boundaries, exact CI evidence, and diff audit
- mark PR #8 ready for review
- do **not** merge
- do **not** delete the branch

---

## Plan Self-Review Checklist

Before execution begins, verify:

- Every approved primitive has an implementation step.
- Every primitive's API is presentation-only and domain-free.
- The initial primitive test is genuinely RED because the production module is absent.
- Event Loop and Promise keep separate state machines and domain types.
- Async Waterfall is not forced into scenario semantics.
- Stable test ids remain owned by specialized labs.
- Accessible names used by existing Playwright locators remain unchanged.
- `aria-live`, focusability, and section-label relationships are directly protected.
- No plan task edits learning-model files, lesson MDX, dependencies, lockfile, or CI.
- Full permanent CI on the exact final head is required before PR handoff.
