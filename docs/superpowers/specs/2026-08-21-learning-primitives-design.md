# Phase 0.3 Learning Primitives Design

**Date:** 2026-08-21  
**Status:** Approved in chat; written-spec review pending  
**Branch:** `agent/learning-primitives`  
**Base:** `main` at `21709b9c658370ec3afe4e9770aebb7377df6ac0`

## Summary

Phase 0.3 extracts the smallest reusable learning UI primitives proven across three gold-standard lessons:

1. `AsyncWaterfallLab`
2. `EventLoopLab`
3. `PromiseResolutionLab`

The goal is not a generic lesson framework. The goal is to remove repeated presentation and accessibility structure while keeping each lesson's teaching model, state transitions, types, and specialized visualization independently understandable.

The governing rule is:

> **Extract structure, not semantics.**

A shared primitive is justified only when a lesson can use it without reshaping domain data or behavior to fit the abstraction.

## Evidence from the three labs

### Async Waterfall Lab

The waterfall lab is a numeric timing comparison. Its state is task-duration input plus two derived schedules. Its Play control drives decorative timeline animation rather than a semantic state-machine walkthrough.

Repeated presentation evidence:

- named outer learning-lab section
- title and explanatory description
- action-row layout
- titled bordered sections
- polite live result surface

Must remain specialized:

- duration inputs and clamping
- sequential/concurrent schedule computation
- shared elapsed-time scale
- timeline rendering and reduced-motion animation
- playback timer lifecycle
- timing tables and savings calculation

### Event Loop Lab

The event-loop lab is a deterministic browser-scheduling simulator with predefined scenarios plus one explicit scheduler-choice state.

Repeated presentation evidence:

- named outer learning-lab section
- controlled scenario selector with description
- named keyboard-focusable horizontally scrollable source region
- Step / Run / Reset row with trailing step indicator
- polite live status surface
- titled bordered panels
- explanatory live region

Must remain specialized:

- browser event-loop domain state
- task-source/work-item types
- queue rendering
- scheduler-choice behavior
- rendering-opportunity state
- starvation-warning semantics
- transition algorithms

### Promise Resolution Lab

The Promise lab is a deterministic language-semantics simulator with predefined scenarios and Promise-state nodes.

Repeated presentation evidence:

- named outer learning-lab section
- controlled scenario selector with description
- named keyboard-focusable source region
- Step / Run / Reset row with trailing step indicator
- polite live status surface
- titled bordered panels
- explanatory live region

Must remain specialized:

- Promise state/resolution/adoption types
- Promise-node rendering
- active-handler semantics
- fulfillment/rejection/adoption transitions
- branching semantics
- transition algorithms

## Proposed primitive boundary

New primitives live under:

`components/learning/primitives/`

The initial set is intentionally small and presentation-only.

### 1. `LabShell`

Purpose: provide the consistent accessible container and introduction for an interactive learning lab.

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

- call `useId()` internally for its heading id
- render `<section aria-labelledby={headingId}>`
- render the common outer border/card/padding/spacing
- render the visible `<h3>` title and muted description
- render arbitrary children after the introduction

Non-responsibilities:

- no scenario state
- no playback state
- no timers
- no domain-model imports
- no `data-testid` ownership
- no render props or context

Consumers do not pass or coordinate the heading id.

### 2. `LabPanel`

Purpose: provide the repeated titled bordered section used for queues, handlers, output, explanations, and other domain-specific content.

Conceptual API:

```tsx
<LabPanel title="Output log">
  {children}
</LabPanel>
```

Responsibilities:

- call `useId()` internally for the panel heading
- render a semantic section named by its visible heading
- provide consistent border/background/padding
- render arbitrary children

Non-responsibilities:

- no assumptions about child data
- no output-list rendering
- no queue rendering
- no Promise-card rendering
- no domain status logic

### 3. `LabControls`

Purpose: provide layout for lab actions and optional trailing information.

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
- optional trailing-content placement

Non-responsibilities:

- does not render buttons on behalf of consumers
- does not own Step/Run/Reset labels
- does not own enabled/disabled logic
- does not own keyboard handlers
- does not own autoplay or timers

Native buttons remain in each lab so accessible names and domain-specific rules remain explicit. Shared button styling is not extracted in this PR unless implementation shows a simple style constant/component can be introduced without hiding button semantics; the default expectation is to leave the buttons local.

### 4. `ScenarioSelect`

Purpose: standardize controlled scenario-selection presentation shared by Event Loop and Promise.

Conceptual API:

```tsx
<ScenarioSelect
  label="Promise scenario"
  value={scenarioId}
  options={PROMISE_SCENARIOS.map(({ id, title }) => ({
    value: id,
    label: title,
  }))}
  description={scenario.description}
  onChange={handleScenarioChange}
/>
```

Responsibilities:

- call `useId()` internally for the label/select relationship
- render a visible `<label>`
- render a controlled string-valued `<select>`
- render string-valued options
- render the visible scenario description
- emit the selected string through `onChange`
- common layout/styling

Non-responsibilities:

- no shared `ScenarioDefinition` domain type
- no scenario lookup
- no reset behavior
- no lesson-specific parsing/casting
- no source-code rendering

The consuming lab translates the emitted string into its own scenario-id type.

### 5. `ScrollableCodeRegion`

Purpose: standardize the accessible source-code surface used by deterministic teaching labs.

Conceptual API:

```tsx
<ScrollableCodeRegion label="Promise scenario source">
  {scenario.source}
</ScrollableCodeRegion>
```

Responsibilities:

- render `role="region"`
- apply the supplied explicit accessible label
- render `tabIndex={0}` so overflow is keyboard reachable
- provide visible focus treatment
- provide horizontal scrolling
- render `<pre><code>` for short simulator-owned source strings

Non-responsibilities:

- no syntax-highlighting engine
- no arbitrary code execution
- no copy/run toolbar
- no replacement for MDX/Shiki code blocks

### 6. `LiveStatus`

Purpose: standardize the compact result/status surface that announces meaningful state changes.

Conceptual API:

```tsx
<LiveStatus label="Status">
  <span data-testid="event-loop-status">Idle</span>
</LiveStatus>
```

Responsibilities:

- common muted status/result styling
- `aria-live="polite"`
- optional visible label
- arbitrary child content

Non-responsibilities:

- no status enum
- no completion logic
- no test-id ownership
- no domain formatting

Stable domain selectors remain on consumer-owned children.

## Explicit non-goals

PR #8 must not introduce:

- a shared `ScenarioDefinition` type across lessons
- generic scenario/state-machine engines
- `useScenarioRunner`, `usePlayback`, or another generic autoplay hook
- shared transition/state types for Event Loop and Promise
- generic execution timelines
- generic queue visualizations
- generic Promise/node visualizations
- `CodeComparison`
- quiz/challenge frameworks
- benchmark frameworks
- freshness-badge extraction
- source-list extraction
- Sandpack
- WebContainers
- arbitrary code execution
- new runtime dependencies
- databases, hosted state, analytics, or model APIs

Those remain candidates only when future lessons supply concrete evidence.

## Dependency direction

The required dependency direction is one-way:

```text
lesson MDX
   ↓
specialized lab component
   ├──→ learning primitives (presentation only)
   └──→ pure lesson model (domain semantics only)
```

Rules:

1. Primitives must not import anything from `lib/learning/*`.
2. Pure models must remain React-free and must not import primitives.
3. Primitives must not import specialized labs.
4. Specialized labs retain their domain types and model orchestration.
5. No context provider is introduced for lab state.

## Migration design

### `AsyncWaterfallLab`

Adopt only what fits naturally:

- `LabShell`
- `LabControls`
- `LiveStatus` for the elapsed-time savings result only if the rendered semantics remain equivalent
- `LabPanel` only where it reduces real structural duplication without obscuring schedule semantics

Do not force `ScenarioSelect`, `ScrollableCodeRegion`, Step/Run semantics, or scenario types into this lab.

### `EventLoopLab`

Adopt:

- `LabShell`
- `ScenarioSelect`
- `ScrollableCodeRegion`
- `LabControls`
- `LiveStatus`
- `LabPanel`

Keep local:

- all event-loop types/constants
- state creation and transition functions
- autoplay eligibility rules
- scheduler-choice interaction
- queue/work-item rendering
- user-facing domain labels

### `PromiseResolutionLab`

Adopt:

- `LabShell`
- `ScenarioSelect`
- `ScrollableCodeRegion`
- `LabControls`
- `LiveStatus`
- `LabPanel`

Keep local:

- all Promise-state types/constants
- state creation and transition functions
- autoplay eligibility rules
- Promise-card rendering
- handler rendering
- user-facing domain labels

## API rules

The APIs should remain intentionally boring.

1. Prefer `children` and small scalar props over render-prop frameworks.
2. Do not introduce context providers.
3. Avoid generic type parameters unless required for a simple controlled component.
4. Do not normalize lesson data into shared schemas.
5. Consumer code retains domain action labels and accessible names.
6. Consumer code retains stable `data-testid` values.
7. Accessibility ids that exist only to wire a primitive's own markup are generated internally by that primitive.
8. A primitive should be understandable without reading any lesson model.
9. A lab should be understandable without reading primitive internals.

## Accessibility contract

Extraction must preserve or improve the current baseline.

Required invariants:

- every lab remains a named semantic section
- scenario selects remain visibly labeled
- source regions remain explicitly named and keyboard-focusable
- horizontal overflow remains keyboard reachable
- Step/Run/Reset remain native buttons
- disabled states remain native `disabled` where applicable
- status/explanation announcements remain `aria-live="polite"` where currently present
- no interaction relies on color alone
- visible keyboard focus remains present
- axe serious/critical checks remain enabled with no exclusions or disabled rules

The extraction must not change user-facing accessible names relied on by current Playwright tests unless required to fix an accessibility defect. Such a change requires an explicit test and rationale.

## Behavioral compatibility contract

PR #8 is primarily a refactor. Existing behavior is normative.

### Async Waterfall

Must preserve:

- default 1500ms sequential / 800ms concurrent / 700ms saved
- duration editing and clamping
- reset
- Play/Replay
- reduced-motion-safe visualization
- `sequential-total`, `concurrent-total`, and `time-saved` selectors

### Event Loop

Must preserve:

- all six scenario definitions
- deterministic transition ordering
- both valid scheduler-choice branches
- bounded starvation behavior
- rendering-opportunity semantics
- Step/Run/Reset behavior
- existing status/output selectors

### Promises

Must preserve:

- all six scenario definitions
- pending + adopting intermediate state
- return/throw/adopt semantics
- catch recovery
- finally transparency scenario
- independent branching
- Step/Run/Reset behavior
- existing promise/status/output selectors

Canonical lesson MDX and raw Markdown output are not expected to change.

## Testing strategy

### Existing pure-model tests

The current unit tests for `async-schedule`, `browser-event-loop`, and `promise-resolution` remain the domain correctness contracts. They should not change merely because React presentation is extracted.

### Existing browser/accessibility tests

The existing lesson Playwright suites remain the primary integration contracts. They already protect:

- navigation
- core interactive behavior
- keyboard operation
- stable semantic names/selectors
- raw Markdown completeness
- Edit-on-GitHub targets
- axe serious/critical accessibility

### Primitive-specific coverage

Add focused direct coverage only for contracts that are otherwise hard to see after migration. Candidates include:

- `ScenarioSelect` visible label/value/change behavior
- `ScrollableCodeRegion` region name and keyboard focusability
- `LabShell` section/heading relationship
- `LiveStatus` live-region semantics

Do not add tests for Tailwind class strings or duplicate behaviors already strongly protected by the three lesson suites.

The permanent CI gate remains unchanged:

- `pnpm install --frozen-lockfile`
- lint
- typecheck
- unit tests
- production build
- Chromium install
- full Playwright suite
- axe serious/critical accessibility checks

## Expected files

Likely additions:

- `components/learning/primitives/lab-shell.tsx`
- `components/learning/primitives/lab-panel.tsx`
- `components/learning/primitives/lab-controls.tsx`
- `components/learning/primitives/scenario-select.tsx`
- `components/learning/primitives/scrollable-code-region.tsx`
- `components/learning/primitives/live-status.tsx`

An `index.ts` barrel is optional and should be added only if it improves imports without hiding ownership.

Likely modifications:

- `components/learning/async-waterfall-lab.tsx`
- `components/learning/event-loop-lab.tsx`
- `components/learning/promise-resolution-lab.tsx`
- tests only where necessary to protect new primitive contracts

No lesson MDX, content schema, package manifest, lockfile, or CI workflow change is expected.

## Success criteria

PR #8 succeeds when:

1. all three labs preserve behavior and accessibility;
2. Event Loop and Promise no longer duplicate scenario/source/control/status/panel presentation structure;
3. Async Waterfall adopts only genuinely applicable shared structure;
4. all three pure models remain independent and React-free;
5. primitives have no lesson-domain knowledge;
6. no generic scenario runner/state machine is introduced;
7. no new dependency or hosted service is introduced;
8. existing browser and unit contracts remain green;
9. a future interactive lesson can reuse accessible lab structure without reshaping its domain model;
10. the primitive layer stays small enough to understand as a handful of focused presentation components.

## Phase 0.3 exit decision

After PR #8 is implemented and verified, Phase 0.3 is complete only for the patterns actually proven by these three lessons. It does not require implementing every candidate named in the roadmap.

The next project phase should be Phase 0.4 lesson production. Future primitives such as `CodeComparison`, quizzes/challenges, benchmarks, freshness badges, source lists, or execution timelines should follow the same evidence rule: a real lesson need, preferably repeated use, and a clear reduction in authoring or accessibility risk.
