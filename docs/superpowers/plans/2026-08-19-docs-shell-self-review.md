# Phase 0.1 Documentation Shell Plan — Self-Review Corrections

**Status:** Normative companion to `2026-08-19-docs-shell.md`.

These corrections were found during the required plan self-review against current Next.js 16 and Fumadocs documentation. When this file conflicts with the main implementation plan, this file wins.

## 1. Next.js type generation and `next-env.d.ts`

Next.js 16 generates `next-env.d.ts` via `next dev`, `next build`, or `next typegen`, and current Next.js guidance recommends not tracking the generated file.

Apply these corrections to Task 1:

- Change the `typecheck` script from:

```json
"typecheck": "tsc --noEmit"
```

to:

```json
"typecheck": "next typegen && tsc --noEmit"
```

- Add `next-env.d.ts` to `.gitignore`.
- Do not list `next-env.d.ts` as a created/committed file.
- Do not include `next-env.d.ts` in the Task 1 `git add` command.

The `tsconfig.json` `include` entry for `next-env.d.ts` remains correct.

## 2. ESM-safe Vitest alias configuration

The plan's `vitest.config.ts` uses `__dirname`, which is not a safe assumption in an ESM config.

Use this exact file instead:

```ts
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('.', import.meta.url)),
    },
  },
});
```

## 3. Render the registered MDX component map

The docs page renderer must use `getMDXComponents()` rather than passing only `defaultMdxComponents`; otherwise later custom components such as `Mermaid` are not guaranteed to be passed to the compiled MDX body.

In `app/docs/[[...slug]]/page.tsx`:

- remove the `defaultMdxComponents` import;
- add:

```ts
import { getMDXComponents } from '@/components/mdx';
```

- render:

```tsx
<MDX components={getMDXComponents()} />
```

This is the normative implementation for Tasks 3 and 5.

## 4. Add explicit browser coverage for search

Task 6 must also prove that local/static search is usable.

Add this Playwright test to `tests/e2e/docs-shell.spec.ts` after the basic docs-shell test:

```ts
test('finds a lesson through local documentation search', async ({ page }) => {
  await page.goto('/docs');
  await page.getByRole('button', { name: /search/i }).first().click();
  await page.getByRole('textbox').fill('freshness');
  await expect(page.getByText('Content Freshness', { exact: true })).toBeVisible();
});
```

If the installed Fumadocs version exposes the search trigger as an accessible link instead of a button, preserve the behavior assertion and select the trigger by its actual accessible role/name. Do not use CSS implementation-detail selectors.

The expected browser suite count becomes **6 tests**, not 5.

## 5. GitHub page-action browser assertion

`ViewOptionsPopover` may place GitHub actions behind a menu rather than render a visible anchor immediately. The implementation must test user-observable behavior, not assume the link is already in the DOM.

During implementation, inspect the rendered accessible roles. Open the page-actions control when necessary, then assert that a GitHub edit destination points to:

```text
https://github.com/thucne/software-development-atlas/edit/main/content/docs/
```

If Fumadocs exposes the GitHub action differently in the installed version, keep the same destination and visible user capability.

## 6. Verification count correction

Where the main plan says `5 Playwright tests pass`, read it as:

```text
6 Playwright tests pass.
```

The final acceptance gate remains unchanged except that the browser suite must include the explicit local-search test above.
