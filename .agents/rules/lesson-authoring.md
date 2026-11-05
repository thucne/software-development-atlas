# Software Development Atlas: Lesson Authoring Rules

Whenever writing, editing, or refactoring lesson content (`content/docs/**/*.mdx`):

1. **Use Visuals to Teach (not to meet a quota):**
   - Aim for meaningful visual breaks across substantial lessons, but choose illustrations, exact diagrams, decision matrices, and interactive labs by the learner misunderstanding they resolve.
   - Never insert a placeholder into a published lesson. Temporary placeholders are draft-only; use `<AtlasIllustration id="..." />` for published canonical diagrams.
   - Keep essential facts in MDX text or accessible semantic UI. Reuse shared assets across translations where possible.

2. **Keep English and Vietnamese Teaching Outcomes Aligned:**
   - Both files should teach equivalent models, caveats, important examples, and exercises. Literal translation and matching word counts are not required.
   - English lessons use natural technical English, Vietnamese companions use idiomatic Vietnamese. Keep formal terms where useful, but avoid importing unnecessary English verbs into Vietnamese sentences.
   - Explain terms near first meaningful use and keep code behavior and technical boundaries identical in both languages.

3. **Ground Production Micro-scenarios in Evidence:**
   - Use a concrete impact → root cause → correct pattern progression, localized as Hậu quả → Nguyên nhân cốt lõi → Cách khắc phục in Vietnamese.
   - Clearly mark invented stories and numerical examples **illustrative / hypothetical**. Do not imply they are real incidents.
   - Real incidents need a first-party postmortem, official incident record, or other credible source; qualify metrics and provider-specific behavior.
   - Do not add drama or false precision to make a teaching example engaging.

4. **Active Mental-Model Checks (`<details>`):**
   - Wrap solutions in `<details>` and let the reader predict before revealing the answer.
   - Use `<summary>Show the reasoning</summary>` in English and `<summary>Xem giải thích chi tiết</summary>` in Vietnamese.

5. **Actionable Task Lists:**
   - Format review questions and agent rules as markdown task lists (`- [ ] **<Keyword>:** ...`).
   - Do not use plain numbered lists for review checklists.

6. **Moderate TermBox Usage:**
   - Use `<TermBox>` for difficult, topic-specific terms that would impede the declared audience; 2–3 is a useful guideline, not a hard quota.
   - Define concepts before relying on them. Place boxes near first substantive use, rather than stacking definitions at page start.
   - Do not wrap ordinary developer vocabulary.

7. **Date updates after edits (when applicable):**
   - Bump `lastVerified` to today's `YYYY-MM-DD` when the edit is an intentional re-verification or material teaching/factual change; keep EN/VI companions identical; sync body lines that restate the date.
   - Do **not** bump `lastVerified` for typo-only or formatting-only edits.
   - Bump `atlasLastUpdated` in `lib/site-metadata.ts` when the change should update the docs footer; sync hard-coded footer tests in the same change.
   - Do **not** mass-bump every lesson's `lastVerified` merely because the site footer date moved.

8. **Reconcile the rolling changelog:**
   - When a substantive lesson is newly published in navigation, or a substantive lesson is materially revised and its `lastVerified` date moves forward, reconcile both `content/docs/start-here/changelog.mdx` and `content/docs/start-here/changelog.vi.mdx` in the same pull request.
   - Keep the English and Vietnamese changelog entries semantically aligned, include the canonical lesson route in both locales, and keep changelog `lastVerified` at least as recent as the newest lesson represented.
   - Treat the top release banner as a milestone announcement, not as the rolling release ledger; update it only when the milestone message itself changes.
   - `tests/changelog.test.ts` enforces rolling coverage for substantive lessons verified on or after `2026-09-11`; do not bypass that contract by weakening the test or backdating lesson freshness.

9. **Verification Requirements:**
   - All tests in `vitest run` must pass 100%.
   - `pnpm typecheck` and `pnpm lint` must pass with zero errors.

10. **Precision and Natural Prose:**
   - Prefer one primary idea per sentence. Distinguish language/API guarantees, runtime/provider discretion, and conditional engineering recommendations.
   - Avoid unsupported absolutes (`always`, `never`, `100%`) and repeated alarmist labels (`fatal pitfall`, `cạm bẫy chết người`) unless a precise technical guarantee genuinely warrants them.
   - TL;DR should establish the practical mental model, central rule and main pitfall—without repeating a long hypothetical incident, a second TL;DR, or provider trivia.
   - For every substantive change, inspect the English and Vietnamese companion together and record primary-source, code/example and date/changelog evidence in the PR.
