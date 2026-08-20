# Async Waterfalls Plan Self-Review Corrections

These corrections are **normative** for implementation of `2026-08-20-async-waterfalls.md`. If this file conflicts with the original plan, this file wins. They were found during the required plan self-review before implementation began.

## 1. Use one shared visual time scale

The initial plan proposed deriving each timeline bar width from that schedule's own total. That would make both the 1500ms sequential schedule and the 800ms concurrent schedule fill the same visual width, which hides the latency difference the lab is supposed to teach.

The visual timelines must instead use one common scale:

```ts
const comparisonTotalMs = Math.max(
  sequential.totalMs,
  concurrent.totalMs,
);

const startPercent =
  (segment.startMs / comparisonTotalMs) * 100;
const widthPercent =
  (segment.durationMs / comparisonTotalMs) * 100;
```

For the default values, the sequential schedule occupies the full comparison width while the concurrent schedule ends at `800 / 1500 ≈ 53.3%` of that same width.

The semantic tables continue to expose exact values, so the bars remain decorative and should use `aria-hidden="true"`.

## 2. Use native number inputs for exact task durations

Replace the planned range sliders with native number inputs. The lesson teaches exact elapsed-time arithmetic, so directly visible/editable numeric values are clearer, more keyboard-friendly, and less brittle to automate.

Each task control should follow this shape:

```tsx
<label className="grid gap-2 font-medium">
  Task {id} duration
  <span className="flex items-center gap-2">
    <input
      aria-label={`Task ${id} duration in milliseconds`}
      type="number"
      inputMode="numeric"
      min={MIN_TASK_DURATION_MS}
      max={MAX_TASK_DURATION_MS}
      step={TASK_DURATION_STEP_MS}
      value={durations[id]}
      onChange={(event) =>
        updateDuration(id, Number(event.currentTarget.value))
      }
      className="w-28 rounded-md border bg-transparent px-3 py-2 tabular-nums"
    />
    <span aria-hidden="true">ms</span>
  </span>
</label>
```

The component should reject transient non-finite values and clamp committed values to the documented 100–2000ms range before passing them to the pure scheduling model. The pure model itself remains deterministic and assumes valid inputs.

Browser tests should target the control with `getByRole('spinbutton', { name: 'Task B duration in milliseconds' })`, then `fill('1000')`.

## 3. Generate unique accessible IDs

Do not hard-code `async-waterfall-lab-title` as the section heading ID. Use React `useId()` so the component remains valid if rendered more than once in a future page:

```tsx
const titleId = useId();

<section aria-labelledby={titleId}>
  <h3 id={titleId}>Async Waterfall Lab</h3>
</section>
```

This does not turn the component into a generic framework; it is simply correct component-level accessibility hygiene.

## 4. Make total assertions semantic rather than text-node fragile

The browser tests should expose totals through stable labelled values, for example:

```tsx
<p>
  <strong>Sequential total:</strong>{' '}
  <span data-testid="sequential-total">{schedule.totalMs}ms</span>
</p>
```

and the equivalent `concurrent-total` value.

Then assert:

```ts
await expect(page.getByTestId('sequential-total')).toHaveText('1500ms');
await expect(page.getByTestId('concurrent-total')).toHaveText('800ms');
```

After changing B to 1000ms:

```ts
await expect(page.getByTestId('sequential-total')).toHaveText('2100ms');
await expect(page.getByTestId('concurrent-total')).toHaveText('1000ms');
```

Use semantic role/name locators for user-facing controls and navigation; `data-testid` is acceptable only for exact derived numeric outputs where it avoids brittle text-node matching.

## 5. Reduced-motion playback remains informative without motion

The play/replay action may restart decorative timeline animation, but the exact schedules and totals must remain visible before, during, and after playback. Under `prefers-reduced-motion: reduce`, animation/transition is disabled while the button remains operable.

Tests continue to verify that the control is keyboard-operable, not animation frame timing.

## Self-review result

With these corrections:

- every approved spec section maps to an implementation task;
- exported model names consistently use `Concurrent`, not `Parallel`;
- no placeholder/TBD implementation steps remain;
- no new dependency is required;
- the visual model now communicates the same latency relationship as the numerical model;
- the interaction contract is deterministic and accessible enough for implementation and browser testing.
