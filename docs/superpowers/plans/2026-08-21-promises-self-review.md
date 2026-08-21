# Promises Lesson Plan Self-Review Corrections

Date: 2026-08-21  
Branch: `agent/promises`

This file is **normative on conflict** with `docs/superpowers/plans/2026-08-21-promises.md`.

## Frontmatter title must be quoted

The lesson title contains a colon followed by a space, so the implementation must use:

```yaml
title: "Promises: Resolution, Chaining, and Failure"
```

Do **not** use the unquoted form shown in Task 2 of the original plan.

The approved design spec has been corrected to match.

## Source verification note

Implementation-time source verification must use the current ECMAScript Promise algorithms plus current MDN compatibility/reference pages. In particular:

- `Promise.withResolvers()` returns `{ promise, resolve, reject }` and is a specialized lifecycle tool;
- `Promise.try()` invokes its callback synchronously, then resolves/rejects the result Promise from the callback result/throw;
- `Promise.try(fn)` is not timing-equivalent to `Promise.resolve().then(fn)`.

## Remaining self-review result

- No placeholder steps remain.
- Model/test type names are consistent.
- The adoption scenario protects the intermediate `pending + adopting` state.
- No generic learning primitive is authorized in PR #7.
- No dependency, lockfile, or CI workflow change is expected.
