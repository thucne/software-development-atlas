# Phase 0.3 Learning Primitives Design

**Date:** 2026-08-21  
**Status:** Approved in chat; written-spec review pending  
**Branch:** `agent/learning-primitives`  
**Base:** `main` at `21709b9c658370ec3afe4e9770aebb7377df6ac0`

## Summary

Phase 0.3 extracts the smallest reusable learning UI primitives that have now been proven across three gold-standard lessons:

1. `AsyncWaterfallLab`
2. `EventLoopLab`
3. `PromiseResolutionLab`

The purpose is not to build a generic lesson framework. The purpose is to remove repeated presentation and accessibility structure while keeping each lesson's teaching model, state transitions, data types, and specialized visualization independently understandable.

The design follows the roadmap rule: extract only repeated teaching patterns that are already useful, and avoid speculative abstractions.

## Evidence from the three completed labs

### Async Waterfall Lab

The async-waterfall lesson is fundamentally a numeric timing comparison. Its core state is task duration input plus two derived schedules. Its playback is decorative timeline animation, not a semantic step-through state machine.

Reusable evidence:

- accessible outer lab card with generated heading id
- title and explanatory description
- shared action-row/button styling
- bordered titled sections/panels
- accessible live result surface

Specialized behavior that must remain local:

- task-duration controls
- sequential/concurrent schedule computation
- shared elapsed-time scale
- timeline rendering and reduced-motion animation
- playback timer lifecycle
- timing tables and savings calculation

### Event Loop Lab

The event-loop lesson is a deterministic browser-scheduling simulator with predefined scenarios and an explicit scheduler-choice state.

Reusable evidence:

- accessible outer lab card
- controlled scenario selector with title/description
- named, keyboard-focusable, horizontally scrollable source region
- Step / Run / Reset action row with trailing step indicator
- live status surface
- repeated bordered titled panels
- explanatory live region

Specialized behavior that must remain local:

- browser event-loop domain state
- task sources and work-item types
- microtask queue rendering
- scheduler-choice interaction
- rendering-opportunity state
- starvation warning semantics
- all transition algorithms

### Promise Resolution Lab

The Promise lesson is a deterministic language-semantics simulator with predefined scenarios and promise-state nodes.

Reusable evidence:

- accessible outer lab card
- controlled scenario selector with title/description
- named, keyboard-focusable source region
- Step / Run / Reset action row with trailing step indicator
- live status surface
- repeated bordered titled panels
- explanatory live region

Specialized behavior that must remain local:

- Promise resolution/adoption state
- promise-node rendering and labels
- active handler semantics
- fulfillment/rejection/adoption transitions
- branching semantics
- all transition algorithms

## Design principle

**Extract structure, not semantics.**

A shared primitive is justified only when consumers can use it without translating their domain into a generic abstraction first.

If a proposed component requires Event Loop and Promise to rename or reshape their domain state to fit a shared model, it is too high-level for Phase 0.3.

## Proposed primitives

All new primitives live under:

`components/learning/primitives/`

The initial set is intentionally small.

### 1. `LabShell`

Purpose: provide the consistent accessible container and heading/description structure for an interactive learning lab.

Conceptual API:

```tsx
<LabShell
  title="Event Loop Lab"
  description="Step through predefined browser scheduling scenarios..."
>
  {children}
</LabShell>
```

Responsibilities:

- generate or own the heading id
- render a semantic `<section aria-labelledby=...>`
- render the common outer border/card/padding/spacing
- render `<h3>` title and muted description
- render arbitrary children below the introduction

Non-responsibilities:

- no scenario state
- no playback state
- no timers
- no data-model knowledge
- no test ids

The title and description remain visible text, not metadata hidden behind props.

### 2. `LabPanel`

Purpose: provide the repeated titled bordered panel used for queues, handlers, output, explanations, or other domain-specific content.

Conceptual API:

```tsx
<LabPanel title="Output log">
  {children}
</LabPanel>
```

Responsibilities:

- semantic section container
- consistent border/background/padding
- visible heading
- optional accessible naming hook when consumers need a stable relation

Non-responsibilities:

- no assumptions about child data
- no output-list rendering
- no queue rendering
- no Promise-card rendering

### 3. `LabControls`

Purpose: provide layout for lab actions and an optional trailing indicator.

Conceptual API:

```tsx
<LabControls trailing={<span>Step {state.stepIndex}</span>}>
  <button>Step</button>
  <button>Run</button>
  <button>Reset</button>
</LabControls>
```

Responsibilities:

- flex/wrap/alignment/spacing
- optional trailing content placement

Non-responsibilities:

- does not render semantic action buttons on behalf of consumers
- does not own Step/Run/Reset labels
- does not own disabled logic
- does not own keyboard handlers
- does not own autoplay or timers

Buttons remain in each lab so accessible names and domain-specific enabled/disabled rules stay explicit.

### 4. `ScenarioSelect`

Purpose: standardize the controlled scenario-selector presentation shared by Event Loop and Promise labs.

Conceptual API:

```tsx
<ScenarioSelect
  label="Promise scenario"
  value={scenarioId}
  options={PROMISE_SCENARIOS.map(({ id, title }) => ({ value: id, label: title }))}
  description={scenario.description}
  onChange={handleScenarioChange}
/>
```

Responsibilities:

- accessible label/select association
- controlled `value`
- string-valued options
- visible description
- common styling

Non-responsibilities:

- no generic `ScenarioDefinition` domain type
- no scenario lookup
- no state reset
- no parsing/casting to lesson-specific scenario ids
- no scenario source rendering

The component emits the selected string value and the consumer translates it into its own domain type.

### 5. `ScrollableCodeRegion`

Purpose: standardize the accessible source-code surface used by deterministic labs.

Conceptual API:

```tsx
<ScrollableCodeRegion label="Promise scenario source">
  {scenario.source}
</ScrollableCodeRegion>
```

Responsibilities:

- `role="region"`
- explicit accessible label
- `tabIndex={0}` so horizontal overflow can be keyboard reached
- visible focus treatment
- horizontal scrolling
- `<pre><code>` presentation suitable for short simulator source strings

Non-responsibilities:

- no syntax highlighting engine
- no arbitrary code execution
- no copy/execution controls

This primitive is for lab-owned source snippets, not a replacement for the site's MDX/Shiki code-block rendering.

### 6. `LiveStatus`

Purpose: standardize the small status/result surface that announces important state changes.

Conceptual API:

```tsx
<LiveStatus label="Status">
  <span data-testid="event-loop-status">Idle</span>
</LiveStatus>
```

Responsibilities:

- common muted status surface styling
- `aria-live="polite"`
- optional visible label
- arbitrary child content

Non-responsibilities:

- no status enum
- no completion logic
- no test-id ownership

Stable test ids remain on domain-specific children.

## Explicit non-goals

PR #8 must not introduce any of the following:

- generic `ScenarioDefinition` shared across lessons
- generic scenario/state-machine engine
- `useScenarioRunner`, `usePlayback`, or generic autoplay hook
- common transition/state types for Event Loop and Promise
- generic execution timeline
- generic queue visualization
- generic Promise/node visualization
- `CodeComparison`
- quiz/challenge framework
- benchmark framework
- freshness component extraction
- source-list component extraction
- Sandpack
- WebContainers
- arbitrary code execution
- new runtime dependency
- database, hosted state, analytics, or model API

Those ideas remain candidates only when future lessons provide concrete repeated implementations.

## Migration plan at the design level

### `AsyncWaterfallLab`

Adopt only primitives that fit without changing its timing model:

- `LabShell`
- `LabControls`
- `LiveStatus` for the elapsed-time savings result if the resulting semantics remain equivalent
- `LabPanel` only where it reduces real duplication without obscuring the existing schedule sections

Do not force `ScenarioSelect`, `ScrollableCodeRegion`, or a step-run model into this lab.

### `EventLoopLab`

Adopt:

- `LabShell`
- `ScenarioSelect`
- `ScrollableCodeRegion`
- `LabControls`
- `LiveStatus`
- `LabPanel`

Keep all event-loop types, constants, choices, transition functions, and queue rendering local.

### `PromiseResolutionLab`

Adopt:

- `LabShell`
- `ScenarioSelect`
- `ScrollableCodeRegion`
- `LabControls`
- `LiveStatus`
- `LabPanel`

Keep all Promise-state types, cards, handler rendering, transition functions, and domain labels local.

## API constraints

The primitives should have intentionally boring React APIs.

Rules:

1. Prefer `children` and small scalar props over render-prop frameworks.
2. Do not introduce context providers.
3. Do not introduce generic type parameters unless TypeScript requires them for a simple controlled component.
4. Do not normalize lesson data into shared schemas.
5. Consumers retain control of accessible names for domain actions and regions.
6. Consumers retain stable `data-testid` values.
7. Primitives must not import anything from `lib/learning/*`.
8. Pure domain models must not import primitives or React.

These rules keep the dependency direction one-way:

```text
lesson MDX
   ↓
specialized lab component
   ├──→ learning primitives (presentation only)
   └──→ pure lesson model (domain semantics only)
```

There must be no dependency from primitives back into specialized labs or pure models.

## Accessibility contract

Extraction must preserve or improve the existing accessibility baseline.

Required invariants:

- every lab remains a named semantic section
- scenario selects remain visibly labeled
- source regions remain keyboard-focusable and explicitly named
- horizontal overflow remains keyboard reachable
- Step/Run/Reset remain native buttons
- disabled states remain native `disabled` where applicable
- status/explanation announcements remain `aria-live="polite"` where currently present
- no interaction relies on color alone
- visible keyboard focus remains present
- existing axe checks remain enabled with no exclusions or disabled rules

The extraction must not change user-facing accessible names relied on by the current Playwright tests unless a change is necessary to correct an accessibility defect. Any such change requires a new explicit test and rationale.

## Behavioral compatibility contract

PR #8 is primarily a refactor. Existing lesson behavior is normative.

The following must remain unchanged:

### Async Waterfall

- default 1500ms sequential / 800ms concurrent / 700ms saved
- duration editing and clamping behavior
- reset behavior
- play/replay behavior
- reduced-motion-safe visualization
- stable `sequential-total`, `concurrent-total`, and `time-saved` selectors

### Event Loop

- all six scenario definitions
- deterministic transition ordering
- both valid scheduler-choice branches
- bounded starvation behavior
- rendering-opportunity semantics
- Step/Run/Reset rules
- stable status/output selectors

### Promises

- all six scenario definitions
- pending + adopting intermediate state
- return/throw/adopt semantics
- catch recovery
- finally transparency scenario
- independent branching
- Step/Run/Reset rules
- stable promise/status/output selectors

Raw Markdown output and canonical lesson copy are not expected to change in PR #8.

## Testing strategy

### Primitive-level tests

Add focused component/browser coverage only where it protects contracts not already covered by the lesson tests. Avoid building a large unit-test suite for class names.

Useful direct coverage may include:

- `ScenarioSelect` label/value/change behavior
- `ScrollableCodeRegion` semantic name and keyboard focusability
- `LabShell` title/section relationship
- `LiveStatus` live-region semantics

If existing end-to-end tests fully cover a primitive's behavior after migration, do not duplicate them merely to increase test counts.

### Existing lesson tests

All current unit tests for the three pure models must stay unchanged unless an assertion is demonstrably implementation-specific rather than behavioral.

All current Playwright lesson suites remain the primary acceptance contracts.

The permanent CI gate remains:

- frozen pnpm install
- lint
- typecheck
- unit tests
- production build
- Chromium install
- full Playwright suite
- axe serious/critical accessibility checks

## Success criteria

Phase 0.3 PR #8 succeeds when:

1. all three existing labs preserve behavior and accessibility;
2. Event Loop and Promise no longer duplicate the common scenario/source/control/status/panel presentation structure;
3. Async Waterfall uses only genuinely applicable shared structure;
4. all three pure learning models remain independent and React-free;
5. the primitives have no knowledge of lesson domain types;
6. no generic scenario runner or state-machine abstraction is introduced;
7. no new dependency or hosted service is added;
8. authoring the next interactive lesson can reuse consistent accessible structure without reshaping its domain model;
9. the resulting abstraction layer remains small enough to understand in one file or a handful of focused files.

## Expected files

Likely additions:

- `components/learning/primitives/lab-shell.tsx`
- `components/learning/primitives/lab-panel.tsx`
- `components/learning/primitives/lab-controls.tsx`
- `components/learning/primitives/scenario-select.tsx`
- `components/learning/primitives/scrollable-code-region.tsx`
- `components/learning/primitives/live-status.tsx`
- optional `components/learning/primitives/index.ts` only if it improves imports without hiding ownership

Likely modifications:

- `components/learning/async-waterfall-lab.tsx`
- `components/learning/event-loop-lab.tsx`
- `components/learning/promise-resolution-lab.tsx`
- tests only where necessary to protect primitive contracts or accessibility

No lesson MDX, content schema, package manifest, lockfile, or CI workflow change is expected.

## Exit decision for Phase 0.3

After PR #8 is implemented and verified, Phase 0.3 should be considered complete only for the primitives proven by these lessons. It does not mean every candidate in the roadmap is now required.

The project should then proceed to Phase 0.4 lesson production. New primitives such as `CodeComparison`, quiz/challenge, benchmarks, freshness badges, or execution timelines should be introduced later through the same evidence rule: at least one real lesson need, preferably repeated use, and a clear reduction in authoring or accessibility risk.
