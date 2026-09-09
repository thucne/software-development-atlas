---
name: atlas-lesson-authoring
description: Use when authoring, revising, or reviewing Software Development Atlas lessons, deep-dives, decision guides, or architecture walkthroughs. Enforces high visual pacing, standardized illustration placeholders, production micro-scenarios, interactive mental model self-checks, actionable task checklists, and TermBox moderation.
---

# Atlas Lesson Authoring & Pedagogical Quality Standard

This skill defines the complete authoring workflow and pedagogical contract for creating or improving lessons in the **Software Development Atlas** (`software-development-atlas`).

## When to Activate This Skill

Activate this skill whenever you are:
- Writing a new lesson (e.g., `contentType: deep-dive | decision-guide | architecture-walkthrough | concept`).
- Revising, refactoring, or polishing existing lessons.
- Reviewing PRs or evaluating lesson quality for engagement, readability, visual cadence, or technical rigor.

---

## The 6 Core Pedagogical Rules

### 1. High-Frequency Visual Cadence (Min. 3–4 Visual Anchors)
Long walls of plain prose cause cognitive fatigue. Substantive lessons must interleave visual elements every **1–2 conceptual sections**.
- Target **at least 3 to 4 visual anchors** per deep dive, decision guide, or architecture walkthrough.
- Visual anchors can be:
  - **Illustration Placeholders** (detailed visual prompts for graphics to be drawn).
  - **Mermaid Diagrams** (decision trees, state diagrams, sequence charts).
  - **Interactive Labs / Explorers** (only when interaction uniquely aids mental model formation).

### 2. Standardized Illustration Placeholders
When image assets (SVG/PNG) are not yet rendered, insert a standardized blockquote placeholder:

```markdown
> 🖼️ **[Illustration Placeholder: Descriptive Title]**  
> *Mô tả hình minh họa:* Mô tả chi tiết bố cục hình vẽ (ví dụ: chia làm 3 cột / 2 luồng song song), các thành phần chính (Client, Cache, Network, Server), hướng mũi tên luồng dữ liệu, và insight kỹ thuật then chốt mà hình vẽ cần truyền tải cho người đọc.
```

- **Rule:** Never leave a vague placeholder like `[TODO: Add image]`. Always specify the visual layout and key technical insight so a human illustrator or AI image tool can draft it immediately.

### 3. Real-World Production Micro-Scenarios
Bridge abstract language specs or architecture theories with real-world engineering stakes. Every substantive lesson must include at least one production failure scenario structured with three explicit anchors:

```markdown
### Production scenario: The "Invisible" UI Freeze

Một hệ thống chat realtime xử lý batch tin nhắn WebSocket qua đệ quy `queueMicrotask`:

```ts
function processBatch(items: Item[]) {
  if (items.length === 0) return;
  renderItem(items.shift()!);
  queueMicrotask(() => processBatch(items));
}
```

- **Hậu quả (Impact):** Màn hình đơ cứng suốt 1.2s, user bấm nút không phản hồi, chỉ số INP báo đỏ (>1000ms).
- **Nguyên nhân cốt lõi (Root cause):** `queueMicrotask` không bao giờ nhường luồng (yield) cho Rendering Pipeline; nó xả sạch checkpoint cho đến khi queue rỗng.
- **Cách khắc phục chuẩn (Correct pattern):** Sử dụng `scheduler.yield()` hoặc `setTimeout(resolve, 0)` để nhường quyền vẽ frame và nhận click event cho trình duyệt.
```

### 4. Interactive Mental-Model Self-Checks (`<details>`)
Allow the learner to think, predict, and test their understanding before being handed the answer. Wrap reasoning and answers in HTML `<details>`:

```markdown
## Exercise

Predict the settlement order of P0 through P4:

```ts
// code snippet here
```

<details>
<summary>Show the reasoning</summary>

- `p0` fulfills with `2`.
- `p1` fulfills with `6`.
- `p2` rejects with `Error('boom')`.
- Downstream `p3` adopts the inner promise and remains pending until inner settles.

</details>
```

### 5. Actionable Task-List Checklists (`- [ ]`)
Replace passive rhetorical questions with actionable task lists. The site's CSS (`app/globals.css`) formats `ul.contains-task-list` with clean hanging indents and custom checkbox positioning:

```markdown
When reviewing scheduling-sensitive browser code, verify against this checklist:

- [ ] **Main thread duration:** Will current task execution stay under 50ms (DevTools Long Task threshold)?
- [ ] **Microtask checkpoint bounds:** Do Promise chains or `queueMicrotask()` calls have bounded recursion so the checkpoint can drain?
- [ ] **Task source ordering assumptions:** Does the code avoid assuming a fixed FIFO order between unrelated task sources?
```

### 6. TermBox Moderation (2–3 Max per Lesson)
`<TermBox>` is designed to break down difficult learning barriers (e.g. *Microtask checkpoint*, *Transactional outbox*, *Hydration*).
- **Limit:** 2 to 3 TermBoxes per page.
- **Placement:** Place near the **first substantive use** where the term is actively needed for reasoning.
- **Anti-pattern:** Never create a "dictionary wall" of 6–8 TermBoxes stacked consecutively at the top of a page.
- **Scope:** Do not box ordinary developer words (e.g. function, array, HTTP request, API).

---

## Step-by-Step Lesson Improvement Workflow

1. **Verify Map Concept:** Check `content/atlas-map.json` for canonical concept IDs. Never invent ad-hoc IDs.
2. **Review Frontmatter:** Ensure `contentType`, `learningDepth`, and `concepts` are valid.
3. **Pace the Content:**
   - Section 1: TL;DR + Mental Model (Lead with practical rule & concrete behavior).
   - Section 2: Visual Anchor 1 (Illustration Placeholder or Mermaid diagram).
   - Section 3: Core Explanation + TermBox (first substantive use).
   - Section 4: Visual Anchor 2 (Detailed comparison or flow placeholder).
   - Section 5: Production Micro-Scenario (Impact, Root Cause, Fix).
   - Section 6: Visual Anchor 3 (Edge cases or multi-tier boundary placeholder).
   - Section 7: Exercise / Quiz (wrapped in `<details>`).
   - Section 8: Agent Rule & Actionable Checklist (`- [ ] **Keyword:** ...`).
4. **Run Machine Checks:**
   ```bash
   npx vitest run
   npx pnpm typecheck
   npx pnpm lint
   ```
   Never submit changes without 100% passing tests.
