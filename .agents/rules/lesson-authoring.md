# Software Development Atlas: Lesson Authoring Rules

Whenever writing, editing, or refactoring lesson content (`content/docs/**/*.mdx`):

1. **Maintain High Visual Cadence:**
   - Ensure at least **3 to 4 visual anchors** (Illustration Placeholders or Mermaid diagrams) per substantive lesson (`deep-dive`, `decision-guide`, `architecture-walkthrough`).
   - Break up walls of text every 1–2 conceptual sections.

2. **Standardized Illustration Placeholders:**
   - Format:
     ```markdown
     > 🖼️ **[Illustration Placeholder: <Descriptive Title>]**  
     > *Mô tả hình minh họa:* <Chi tiết bố cục, khối chức năng, luồng mũi tên, và thông điệp cốt lõi>
     ```
   - Never leave an empty or vague placeholder.

3. **Include Real-World Production Micro-Scenarios:**
   - Anchor abstract technical concepts with a realistic production incident.
   - Always structure with:
     - **Hậu quả (Impact):** The observable breakdown or latency spike.
     - **Nguyên nhân cốt lõi (Root cause):** The mental model disconnect.
     - **Cách khắc phục chuẩn (Correct pattern):** The production-grade solution.

4. **Active Mental-Model Checks (`<details>`):**
   - Wrap exercise/scenario solutions and reasoning in `<details><summary>Show the reasoning</summary>...</details>`.

5. **Actionable Task Lists:**
   - Format review questions and agent rules as markdown task lists (`- [ ] **<Keyword>:** ...`).
   - Do not use plain numbered lists for review checklists.

6. **Moderate TermBox Usage:**
   - Restrict `<TermBox>` to 2–3 difficult learning-barrier terms per page.
   - Place near first substantive use; do not stack consecutively at page start.
   - Do not wrap ordinary developer vocabulary.

7. **Verification Requirements:**
   - All tests in `vitest run` must pass 100%.
   - `pnpm typecheck` and `pnpm lint` must pass with zero errors.
