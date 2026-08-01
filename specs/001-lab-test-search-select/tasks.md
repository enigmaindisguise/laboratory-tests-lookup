# Tasks: Laboratory Test Search & Selection

**Input**: Design documents from `/specs/001-lab-test-search-select/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Test tasks are included for all pure services because the project
constitution (principle IV — Tested Pure Logic) REQUIRES a colocated
`*.test.ts` Vitest suite for every service. All service tests follow
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

**Purpose**: Project initialization mirroring the set-ops reference repository
(libraries, scripts, and configuration — constitution II). Do NOT add any
dependency beyond the set-ops set (constitution III, user constraint).

- [X] T001 Initialize npm project: package.json with the exact set-ops dependency set (react, react-dom, tailwindcss, @tailwindcss/vite, vite, @vitejs/plugin-react; dev: typescript, vitest, eslint, typescript-eslint, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, @types/*) and scripts dev/build/lint/preview/test
- [X] T002 [P] Create vite.config.ts with react() and tailwindcss() plugins and a base path for GitHub Pages deployment
- [X] T003 [P] Create tsconfig.json (project references) plus tsconfig.app.json (strict bundler settings: noEmit, noUnusedLocals, noUnusedParameters, verbatimModuleSyntax + resolveJsonModule for the JSON catalog) and tsconfig.node.json
- [X] T004 [P] Create eslint.config.js flat config (typescript-eslint recommended, react-hooks, react-refresh, globals.browser)
- [X] T005 [P] Create index.html (root div + module script to /src/main.tsx) and src/index.css (Tailwind v4 entry)
- [X] T006 [P] Create .gitignore (node_modules, dist, .vite, editor dirs — mirror set-ops)
- [X] T007 [P] Create .github/workflows/deploy.yml (GitHub Pages via peaceiris/actions-gh-pages, Node 20, npm ci, publish dist/ on push to main)
- [X] T008 Run npm install and verify the empty shell passes npm run build and npm run lint (green baseline before any feature code)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T009 Create shared types in src/types/laboratory-test.ts (LaboratoryTest: id string unique, price number >= 0, title string, description string; SelectionLine: testId, amount >= 1) per data-model.md
- [X] T010 Create catalog data in src/data/laboratory-tests.json with the 10 seeded entries from contracts/data-contract.md (t-001..t-010; t-001 must read "Test for levels of sugar in blood")
- [X] T011 [P] Write format service tests in src/services/format.test.ts (RED first: 0 → "0,00 ₴", 150 → "150,00 ₴", 1234 → "1 234,00 ₴", negative input handling)
- [X] T012 Implement format service in src/services/format.ts using Intl.NumberFormat (locale uk-UA, currency UAH, 2 decimals) — makes T011 green
- [X] T013 Create App shell in src/App.tsx: two stacked sections (Search & Result Set on top, Selected Items + Summary below) in a mobile-first, constrained-width container per FR-018; sections render placeholder panels until US1/US2 land

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Search for Laboratory Tests (Priority: P1) 🎯 MVP

**Goal**: A user can fuzzy-search the embedded catalog and see matching tests,
each with an amount stepper and an Add button, in a scrollable list. Empty
query shows the full catalog (browse mode); no matches shows a clear message.

**Independent Test**: Load the app, type "blood sugar" and confirm t-001
"Glucose (blood sugar)" appears among the matches (SC-001); clear the box and
confirm all 10 catalog items are listed with internal scroll; type "zzzz" and
confirm the "no results" message. (quickstart scenarios 1, 2, 3)

### Tests for User Story 1 (required by constitution IV) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T014 [P] [US1] Write fuzzy search tests in src/services/search.test.ts (RED first: "blood sugar" returns t-001; empty query returns all items; "zzzz" returns none; typo tolerance e.g. "glucose" still finds t-001; word-order tolerance)

### Implementation for User Story 1

- [X] T015 [US1] Implement fuzzy search service in src/services/search.ts (pure token-overlap matcher per research.md §1: normalize, tokenize title+description, containment score, prefix + edit-distance <= 1 tolerance, stable catalog order on ties) — makes T014 green
- [X] T016 [P] [US1] Create AmountStepper shared component in src/components/AmountStepper.tsx (SHARED with US2: props value, min, onIncrement, onDecrement; up/down arrow buttons; small, single-responsibility)
- [X] T017 [P] [US1] Create SearchBar component in src/components/SearchBar.tsx (controlled search input, onQueryChange callback)
- [X] T018 [P] [US1] Create useSearch hook in src/hooks/useSearch.ts (query state, results via search service, browse mode on empty query)
- [X] T019 [US1] Create TestResultList component in src/components/TestResultList.tsx (row per result: title, description, price in UAH, AmountStepper for amount-to-add, Add button; internal scroll; "no results" empty state) — depends on T016
- [X] T020 [US1] Wire section 1 in src/App.tsx (SearchBar → useSearch → TestResultList; Add button emits an onAdd(testId, amount) callback; App provides a minimal stub handler — full selection logic lands in US2)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Build a Selection and View Total Cost (Priority: P2)

**Goal**: A user builds a selection with per-test amounts (up/down arrows in
both sections), removes items with Delete, and sees the live total cost in
UAH. Adding an already-selected test increments its amount (unique-ID
quantity model, clarification Q2); Delete removes the item entirely.

**Independent Test**: Add t-001 twice → amount 2 and total "300,00 ₴"; use the
up/down arrows in both sections (amount never below 1); Delete on an item with
amount > 1 removes it entirely; fresh load shows empty selection and "0,00 ₴".
(quickstart scenarios 4-9)

### Tests for User Story 2 (required by constitution IV) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T021 [P] [US2] Write selection service tests in src/services/selection.test.ts (RED first: add creates entry with amount N; re-add increments; decrement stops at 1; delete removes entirely; total = sum of price x amount; empty selection totals 0) per data-model.md state transitions

### Implementation for User Story 2

- [X] T022 [US2] Implement selection service in src/services/selection.ts (pure functions: add, increment, decrement, remove, calculateTotal) — makes T021 green
- [X] T023 [P] [US2] Create useSelection hook in src/hooks/useSelection.ts (selection map state keyed by testId, lines joined with catalog, derived total via calculateTotal) — depends on T022
- [X] T024 [P] [US2] Create SelectedItemsList component in src/components/SelectedItemsList.tsx (row per selected test: title, price in UAH, AmountStepper min 1, Delete button; empty-state text when nothing selected) — reuses T016
- [X] T025 [P] [US2] Create SummaryPanel component in src/components/SummaryPanel.tsx (total cost via format service; "0,00 ₴" when empty) — depends on T012
- [X] T026 [US2] Wire section 2 in src/App.tsx (replace US1 stub: onAdd → useSelection.add(testId, amount); steppers in both sections; Delete removes; total updates immediately) — depends on T020, T023, T024, T025
- [X] T027 [US2] Verify reload behavior: refreshing the page resets the selection to empty while the catalog remains fully browsable (no persistence, per assumption)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T028 [P] Mobile-first verification pass per FR-018/SC-007: at ~320px width sections stay stacked, all controls reachable, no horizontal page overflow; on desktop the stacked layout stays comfortable (constrained content width)
- [X] T029 Update quickstart.md with a mobile/responsive validation row (resize to ~320px, verify stacked layout and no overflow)
- [X] T030 Run full quality gates: npm run lint (zero errors), npm test -- --run (all green), npm run build (tsc -b && vite build succeeds)
- [X] T031 [P] Final compliance review: walk every acceptance scenario in spec.md against the built app; verify constitution gates I-V (FE-only, set-ops parity, no new deps, tested services, type/lint gates)
- [X] T032 Verify production build: npm run preview serves dist/ and the app works end-to-end from the static build (SC-006 offline check)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories run sequentially here (US2 integrates with US1's Add button), but can proceed in parallel if staffed (see Parallel Team Strategy)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2); integrates with US1 (receives Add events from the result list) but is independently testable via its own service tests and UI

### Within Each User Story

- Tests MUST be written and FAIL before implementation (RED-GREEN)
- Services before hooks/components
- Components before wiring into App
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T002-T007)
- Within Phase 2: T011 (format tests) can run parallel to T009/T010/T013
- Within US1: T014 (search tests), T016 (AmountStepper), T017 (SearchBar) are parallel; then T015 (impl), T018, T019, T020 sequentially
- Within US2: T021 (selection tests) parallel to nothing else until T022; then T023, T024, T025 parallel; then T026, T027
- Polish phase: T028, T031 parallel

---

## Parallel Example: User Story 1

```bash
# After foundational phase (T009-T013) completes, launch together:
Task: "Write fuzzy search tests in src/services/search.test.ts"   (T014)
Task: "Create AmountStepper in src/components/AmountStepper.tsx"   (T016)
Task: "Create SearchBar in src/components/SearchBar.tsx"           (T017)

# Then sequentially (each depends on the previous):
Task: "Implement search.ts to make T014 green"                     (T015)
Task: "Create useSearch hook in src/hooks/useSearch.ts"            (T018)
Task: "Create TestResultList in src/components/TestResultList.tsx" (T019)
Task: "Wire section 1 in src/App.tsx"                              (T020)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (mirror set-ops config exactly)
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (fuzzy search + result list + Add stub)
4. **STOP and VALIDATE**: Test User Story 1 independently (quickstart scenarios 1-3)
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (search service → hooks → components → wiring)
   - Developer B: User Story 2 services/tests (T021, T022) — the pure selection logic does not depend on US1 UI
3. Developer B's UI work (T023-T026) proceeds once US1's Add callback contract (T020) is fixed

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing (RED-GREEN per constitution IV)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Do NOT install any library beyond the set-ops dependency set (constitution III)
- Keep files small and single-responsibility; reuse AmountStepper instead of duplicating stepper UI (user constraint)
