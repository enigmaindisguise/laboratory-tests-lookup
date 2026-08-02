# Tasks: Search Empty State & Section Totals

**Input**: Design documents from `/specs/005-search-empty-state-totals/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/, quickstart.md

**Tests**: Test tasks are included for the changed pure service because the
project constitution (principle IV — Tested Pure Logic) REQUIRES a colocated
`*.test.ts` Vitest suite for every service. The numeric-rule change to
`search.ts` therefore extends `search.test.ts`; all service tests follow
RED-GREEN: write the test first, watch it fail, then implement.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, config files at repository root (mirrors YuBil/set-ops layout)
- All paths below are relative to the repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No setup is required — the project was fully initialized by
feature 001 (same stack, configs, scripts, and dependency set as
YuBil/set-ops) and no new dependency or config change is needed (constitution
II/III). This phase only pins the pre-change baseline.

- [ ] T001 Verify the pre-change baseline is green: `npm test -- --run` (23 tests pass), `npm run lint` (zero errors), `npm run build` (tsc -b && vite build succeeds) on the current `main`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: None required. The three changed files (`search.ts`,
`TestResultList.tsx`, `App.tsx`) are independent; no blocking infrastructure
exists. User story work can begin immediately after Phase 1.

---

## Phase 3: User Story 1 - See an Empty Table When Nothing Matches (Priority: P1) 🎯 MVP

**Goal**: When a non-empty query matches no catalog item, the Search result
area renders an empty table — header row (Назва / Опис / Ціна / Кількість /
Дія) and a full-width row with the Ukrainian text "Нічого не знайдено" — with
no data rows. Populated results keep the current list-row presentation
(FR-001, FR-002, FR-007, FR-011).

**Independent Test**: Load the app, type `ззззз` and confirm the result area
renders an empty table containing "Нічого не знайдено" with no data rows;
clear the box and confirm the full catalog returns in browse mode (no empty
table). (quickstart scenario 1, 2)

### Implementation for User Story 1

- [ ] T002 [US1] Update src/components/TestResultList.tsx: replace the plain `<p>` empty-state (when `tests.length === 0`) with an empty table — a header row of column labels (Назва, Опис, Ціна, Кількість, Дія) and a single full-width row (colSpan) showing exactly "Нічого не знайдено"; keep the populated `<ul>` list rendering and the existing `max-h-80` internal scroll untouched (FR-001, FR-011); wrap the table for horizontal overflow safety at narrow widths (FR-008)

**Checkpoint**: User Story 1 is functional and testable independently.

---

## Phase 4: User Story 2 - Section Titles Show Item Counters (Priority: P2)

**Goal**: Each section title gains a compact counter of its current result
set: Search = `results.length` (full catalog in browse mode, matches during a
query, 0 in the no-match state); Selected Items = `lines.length` (distinct
selected tests, not quantities) (FR-003…FR-006).

**Independent Test**: Load the app and confirm the Search counter equals the
full catalog size; type `глюкоза` and confirm the counter equals the visible
match count; add two tests and confirm the Selected counter shows 2; re-add
one (amount increment) and confirm it stays 2; delete one and confirm it drops
to 1. (quickstart scenario 4)

### Implementation for User Story 2

- [ ] T003 [US2] Add a counter to the Search section title in src/App.tsx: render "Пошук і результати" with the count `results.length` adjacent to the title (compact badge/parenthesized number per spec assumption) (FR-003)
- [ ] T004 [US2] Add a counter to the Selected Items section title in src/App.tsx: render "Обрані дослідження" with the count `lines.length` adjacent to the title (FR-004) — depends on T003 (same file, run sequentially)

**Checkpoint**: User Story 2 is functional and testable independently.

---

## Phase 5: User Story 3 - Numeric Queries Return Exact Matches Only (Priority: P2)

**Goal**: Purely numeric query tokens match catalog tokens exactly or by
prefix only; the edit-distance ≤ 1 fuzzy rule no longer applies to them, so
"1001" yields the empty table instead of 15 resemblance matches. Tokens mixing
letters and digits ("D2", "M50") keep the existing fuzzy behavior (FR-009,
FR-010; research.md §1).

**Independent Test**: Type `1001` → empty table with "Нічого не знайдено"
(no "1081"/"1091"/"S-100" items); type `25` → matches including "Вітамін D
загальний (25-OH)(D2+D3)" (8052); type `D2` → matches still returned.
(quickstart scenario 3)

### Tests for User Story 3 (required by constitution IV) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T005 [P] [US3] Extend src/services/search.test.ts with numeric-rule cases (RED first, run `npx vitest run src/services/search.test.ts` and confirm the NEW cases fail before implementing): `searchTests('1001', catalog)` returns 0 items; `'1001'` returns no item whose title/description contains "1081", "1091", or "S-100" (assert against the catalog); `'25'` returns "Вітамін D загальний (25-OH)(D2+D3)" (id 8052); `'D2'` still returns at least one result (mixed tokens keep fuzzy behavior)

### Implementation for User Story 3

- [ ] T006 [US3] Implement the numeric rule in src/services/search.ts: in `matches()`, when the query token consists only of digits (`/^\d+$/`), keep exact and prefix matching but skip the edit-distance ≤ 1 branch; all other tokens behave exactly as before — makes T005 green

**Checkpoint**: All user stories are now independently functional.

---

## Phase 6: User Story 4 - Counters Stay in Sync with the Visible Lists (Priority: P3)

**Goal**: After every query change, add, delete, or amount-change action, both
counters equal the number of rows actually rendered in their sections,
immediately, without a page reload (FR-005, FR-006).

**Independent Test**: Perform a sequence of actions (change query, add items,
delete an item, increment an amount) and after each action compare both
counters against the rows rendered. (quickstart scenario 4, 5)

### Verification for User Story 4

- [ ] T007 [US4] Browser-verify counter sync per quickstart scenario 4/5: after each action (query change, add, re-add, delete, amount change, match↔no-match transition) both counters equal the visible row counts with no reload

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T008 Run full quality gates: `npm run lint` (zero errors), `npm test -- --run` (all green, incl. new numeric cases), `npm run build` (tsc -b && vite build succeeds)
- [ ] T009 [P] Final compliance review: walk every acceptance scenario in spec.md (US1–US4) against the built app; verify constitution gates I–V (FE-only, set-ops parity, no new deps, tested pure logic, type/lint gates)
- [ ] T010 Browser validation pass per quickstart scenarios 1–7, including the ~320 px mobile check (FR-008, SC-005): counters visible, no horizontal page overflow, empty table readable

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — pins the green baseline
- **Foundational (Phase 2)**: Not required for this feature (skipped)
- **User Stories (Phase 3+)**: Independent of each other; run in priority
  order (P1 → P2 → P2 → P3); only T003/T004 share a file and must run
  sequentially
- **Polish (Final Phase)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: No dependencies — `TestResultList.tsx` only
- **User Story 2 (P2)**: No dependencies — `App.tsx` only (counts come from
  existing hooks)
- **User Story 3 (P2)**: No dependencies — `search.ts` + `search.test.ts`
  only
- **User Story 4 (P3)**: Depends on US2 (and US3 for the numeric no-match
  state) — verification only

### Within Each User Story

- Tests MUST be written and FAIL before implementation (RED-GREEN, US3)
- Implementation before verification (US4)

### Parallel Opportunities

- T001 (baseline) runs first, alone
- T002 (US1), T003 (US2), and T005 (US3 tests) touch different files and can
  run in parallel
- T006 (US3 impl) depends on T005 (RED first); T004 depends on T003 (same
  file)
- T007 (US4) and T008/T009/T010 (polish) run after all implementation tasks

---

## Parallel Example: First Wave

```bash
# After T001 (baseline) completes, launch together:
Task: "Empty-table in src/components/TestResultList.tsx"      (T002)
Task: "Search counter in src/App.tsx"                          (T003)
Task: "Numeric-rule tests in src/services/search.test.ts"      (T005)

# Then sequentially:
Task: "Selected counter in src/App.tsx"                        (T004, same file as T003)
Task: "Numeric rule in src/services/search.ts"                 (T006, makes T005 green)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1: baseline green (T001)
2. Phase 3: User Story 1 — empty table (T002)
3. **STOP and VALIDATE**: type `ззззз` → empty table; clear → browse mode

### Incremental Delivery

1. Baseline → US1 (empty table) → US2 (counters) → US3 (numeric rule) →
   US4 (sync verification) → polish/gates
2. Each story adds value without breaking previous stories; all changes are
   small and single-purpose

---

## Notes

- [P] tasks = different files, no dependencies (except T003→T004, same file)
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Verify the new search tests fail before implementing (RED-GREEN per
  constitution IV)
- Do NOT install any library beyond the set-ops dependency set (constitution
  III)
- Do NOT change `SelectedItemsList.tsx`, `useSearch.ts`, `useSelection.ts`,
  or the catalog data — this feature only touches `TestResultList.tsx`,
  `App.tsx`, `search.ts`, and `search.test.ts`
