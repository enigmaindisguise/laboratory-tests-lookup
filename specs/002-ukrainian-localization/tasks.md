# Tasks: Ukrainian UI Localization

**Input**: Design documents from `/specs/002-ukrainian-localization/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: No new test tasks — the existing Vitest suites are maintained in place (US2 migrates `search.test.ts` fixtures; `selection.test.ts` and `format.test.ts` need no changes). Tests are only included when the feature specification requests them.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `index.html` at repository root (per plan.md — unchanged 001 structure).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Pre-flight check — the project already exists (feature 001); nothing to scaffold. No new dependencies, no config changes (constitution II, III).

- [X] T001 Run baseline quality gates before any change: `npm run lint`, `npm test -- --run`, `npm run build` — all three MUST pass and confirm the working tree starts green

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: None required. This is a content-only feature: no new infrastructure, no shared services changed, no schema/config changes. All user stories depend only on Phase 1 (baseline confirmed green) and on the normative translation tables in `specs/002-ukrainian-localization/research.md` §2–§4.

**Checkpoint**: Baseline green — user story implementation can begin in parallel.

---

## Phase 3: User Story 1 - Browse the Entire Application in Ukrainian (Priority: P1) 🎯 MVP

**Goal**: Every visible UI string — page title, headings, search placeholder, buttons, empty-state messages, summary label — is Ukrainian; no English UI text is visible anywhere (FR-001, FR-009, SC-001).

**Independent Test**: Load the app and walk both sections (search area + selected-items area) with the search box empty, with a query typed, and with items selected; every visible string matches the normative inventory in `research.md` §2 (S3–S12), and no English UI text remains.

### Implementation for User Story 1 (all tasks parallel — 6 distinct files)

- [X] T002 [P] [US1] Translate h1 and both section headings in src/App.tsx per research.md §2 S3–S5 («Лабораторні дослідження», «Пошук і результати», «Обрані дослідження»)
- [X] T003 [P] [US1] Translate search placeholder and aria-label in src/components/SearchBar.tsx per research.md §2 S6–S7 («Пошук лабораторних досліджень…», «Пошук лабораторних досліджень»)
- [X] T004 [P] [US1] Translate empty-state message and Add button in src/components/TestResultList.tsx per research.md §2 S8–S9 («Нічого не знайдено. Спробуйте інший пошуковий запит.», «Додати»)
- [X] T005 [P] [US1] Translate empty-state message and Delete button in src/components/SelectedItemsList.tsx per research.md §2 S10–S11 («Поки нічого не обрано.», «Видалити»)
- [X] T006 [P] [US1] Translate summary label in src/components/SummaryPanel.tsx per research.md §2 S12 («Загальна вартість»)
- [X] T007 [P] [US1] Set `<html lang="uk">` and translate `<title>` in index.html per research.md §2 S1–S2 («Лабораторні дослідження»)

**Checkpoint**: US1 complete — the full interface is visible in Ukrainian (quickstart scenarios 1–2 pass).

---

## Phase 4: User Story 2 - Search and Select Tests Using the Ukrainian Catalog (Priority: P2)

**Goal**: The embedded catalog is Ukrainian and search works on Ukrainian text: typing «цукор» returns the sugar test; fuzzy behavior (partial words, word order, typos) is unchanged; the test suite is green (FR-004–FR-007, SC-003).

**Independent Test**: Type «цукор» → t-001 «Глюкоза (цукор крові)» appears among the matches; add items and confirm the total updates; `npm test -- --run` passes (search fixtures now Ukrainian, selection/format untouched).

### Implementation for User Story 2 (sequential — T009 depends on T008)

- [X] T008 [US2] Translate all 10 `title` and `description` values in src/data/laboratory-tests.json per research.md §3 — ids (t-001…t-010) and prices MUST stay frozen (data-model.md; selection service and selection.test.ts depend on them)
- [X] T009 [US2] Migrate query fixtures in src/services/search.test.ts to Ukrainian equivalents per research.md §4 (e.g., `цукор` → t-001, `глукоза` typo, `крові цукор` word order, `холесте` partial, `запалення` description match, `аналіз крові` ranking, `кров` stable order) — same IDs, same assertions, test titles/comments stay English; then run `npm test -- --run` and confirm all 23 tests pass

**Checkpoint**: US2 complete — Ukrainian search + selection work end-to-end (quickstart scenarios 3–11 pass).

---

## Phase 5: User Story 3 - Assistive and Document-Level Localization (Priority: P3)

**Goal**: All labels exposed to assistive technology are Ukrainian and the document-level metadata is verified (FR-002, FR-003, SC-007). Note: `lang="uk"` and the search-field aria-label are already implemented in US1 (T003, T007); this story completes the remaining a11y labels and performs the audit.

**Independent Test**: Inspect the page in devtools — `lang="uk"`; activate the amount stepper with a screen reader / inspect its accessible name — «Зменшити кількість» / «Збільшити кількість»; the search field's accessible name is «Пошук лабораторних досліджень».

### Implementation for User Story 3

- [X] T010 [P] [US3] Translate amount-stepper aria-labels in src/components/AmountStepper.tsx per research.md §2 S13–S14 («Зменшити кількість», «Збільшити кількість»)
- [X] T011 [US3] Run the accessibility/document audit (quickstart scenarios 2 + 7): confirm `lang="uk"`, Ukrainian `<title>`, and Ukrainian accessible names for the search field and both stepper buttons (devtools accessibility tree)

**Checkpoint**: All user stories are independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, English-remnant audit, and quality gates.

- [X] T012 [P] Run the full manual validation of specs/002-ukrainian-localization/quickstart.md — all 12 scenarios including mobile width ~320 px (no horizontal overflow, no clipped Ukrainian labels/buttons, FR-010, SC-006)
- [X] T013 [P] Audit for English remnants: grep the 14 English strings from research.md §2 (S1–S14) across index.html and src/ — zero occurrences must remain (FR-009); English in code comments, test titles, and identifiers is expected and allowed
- [X] T014 Run final quality gates: `npm run lint`, `npm test -- --run`, `npm run build` — all MUST pass before the feature is complete

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — baseline gates first (T001).
- **Foundational (Phase 2)**: None required for this feature (content-only).
- **User Stories (Phase 3+)**: All depend on Phase 1 (green baseline) and on the normative tables in `research.md`.
  - User stories can proceed in parallel (different files) or sequentially in priority order (P1 → P2 → P3).
- **Polish (Final Phase)**: Depends on all user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: No dependencies — 6 parallel file edits (T002–T007).
- **User Story 2 (P2)**: Independent of US1 — catalog (T008) then test fixtures (T009). NOTE: the tree is red between T008 and T009 (English fixtures vs. Ukrainian catalog) — complete both before running the gates.
- **User Story 3 (P3)**: Independent of US1/US2 — AmountStepper (T010) then audit (T011); the audit also verifies US1's document-level work (T003, T007).

### Within Each User Story

- Data before tests that assert on it (T008 → T009).
- Implementation before its verification task (T010 → T011).
- Story complete before moving to the next priority; run the gates at each checkpoint.

### Parallel Opportunities

- T002–T007: 6 independent file edits — all parallel (US1).
- US1, US2, US3 are file-disjoint — implementable in parallel by different workers.
- T012, T013: independent audits — parallel (Polish phase).

---

## Parallel Example: User Story 1

```bash
# Launch all six file edits together (no shared files):
Task: "Translate h1 + section headings in src/App.tsx (S3–S5)"
Task: "Translate search placeholder + aria-label in src/components/SearchBar.tsx (S6–S7)"
Task: "Translate empty state + Add in src/components/TestResultList.tsx (S8–S9)"
Task: "Translate empty state + Delete in src/components/SelectedItemsList.tsx (S10–S11)"
Task: "Translate summary label in src/components/SummaryPanel.tsx (S12)"
Task: "Set lang='uk' + translate <title> in index.html (S1–S2)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: T001 baseline gates.
2. Complete Phase 3: T002–T007 (all 6 UI files).
3. **STOP and VALIDATE**: walk the app — full Ukrainian UI, no English text (quickstart scenarios 1–2).
4. Deploy/demo if ready — the interface is fully localized even while the catalog is still English.

### Incremental Delivery

1. Phase 1 baseline → green start.
2. US1 (T002–T007) → full Ukrainian interface → test independently → demo (MVP).
3. US2 (T008–T009) → Ukrainian catalog + search → test independently → demo.
4. US3 (T010–T011) → accessibility labels + audit → test independently → demo.
5. Polish (T012–T014) → full validation + gates → done.

### Parallel Team Strategy

With multiple developers:

1. Team completes Phase 1 together (T001).
2. Once baseline is green:
   - Developer A: User Story 1 (T002–T007)
   - Developer B: User Story 2 (T008–T009)
   - Developer C: User Story 3 (T010–T011)
3. Stories integrate independently; Polish (T012–T014) after all stories land.

---

## Notes

- [P] tasks = different files, no dependencies.
- [Story] label maps task to specific user story for traceability.
- Each user story is independently completable and testable (US3's audit additionally verifies US1's document-level work).
- Normative strings: research.md §2 (UI), §3 (catalog), §4 (test fixtures) — implement exactly, do not invent translations.
- Commit after each logical group; the tree is expected to be red between T008 and T009 only.
- Stop at any checkpoint to validate the story independently.
