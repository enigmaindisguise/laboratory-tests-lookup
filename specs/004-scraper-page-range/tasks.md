# Tasks: Scraper Page Range

**Input**: Design documents from `/specs/004-scraper-page-range/`

**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓

**Tests**: Included. Constitution IV requires tested pure logic, and
plan.md mandates the new `test/pages-check.mjs` suite for the pure
page-range module. Tests are written FIRST (RED), then implementation
(GREEN).

**Organization**: Tasks are grouped by user story to enable independent
implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

All implementation is confined to `scripts/scraper/` (FR-014 — nothing
outside that directory may change). Test files use the `*-check.mjs`
naming so the app's root Vitest glob never discovers them.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify the baseline is green before any change.

- [ ] T001 Verify baseline: run `node --test test/extract-check.mjs` inside
  `scripts/scraper/` (9 tests pass) and the root gates
  (`npm run lint`, `npm test -- --run`, `npm run build`) — all green before
  touching code.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The pure page-range logic every user story depends on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T002 [P] Write RED unit tests for the page-range module in
  `scripts/scraper/test/pages-check.mjs` (node:test + node:assert; module
  import fails until T003 lands — that is the expected RED state). Cover:
  `parsePageRange` — start page from `page` query param, default start 1,
  non-numeric `page` value rejected, non-http(s) source rejected, last page
  must be a positive whole number (zero/negative/fractional/non-numeric
  rejected), inverted range (`end < start`) rejected, one-page range
  (`end === start`) accepted; `pageUrl` — advances only the `page`
  parameter, preserves path/other query params, appends `?page=N` when the
  URL has no query string.
- [ ] T003 [P] Implement the pure page-range module in
  `scripts/scraper/src/pages.mjs`: `parsePageRange(source, lastPageArg)`
  → `{ start, end }` (throws descriptive `Error`s: non-http(s) source,
  invalid page parameter, non-positive-whole-number last page, inverted
  range) and `pageUrl(source, page)` → next page URL via the built-in
  `URL` API. No I/O. Run `node --test test/pages-check.mjs` until GREEN.

**Checkpoint**: Foundation ready — page-range parsing and URL advancement
are pure, tested, and reusable; user story implementation can begin.

---

## Phase 3: User Story 1 - Scrape a Range of Pages into One Dataset (Priority: P1) 🎯 MVP

**Goal**: Two-argument invocation scrapes every page from the URL's start
page through the last page, sequentially, logging each parsed/appended
entry to stdout in real time, and writes one merged catalog-format file.

**Independent Test**: `node scrape.mjs '<price-list-url>?page=2' 3` fetches
pages 2–3 one at a time, prints `[page N]` progress lines plus one
`+ <id> | <title> | <price> грн` line per entry, and writes a single
`--output` file containing every entry from both pages in page order
(SC-001, SC-004).

### Implementation for User Story 1

- [ ] T004 [P] [US1] Extend argument parsing in `scripts/scraper/scrape.mjs`
  to accept a second positional `lastPage` (update `USAGE`/`HELP`); keep
  `--selectors`/`--output`/`--help` behavior; more than two positionals is
  a usage error (FR-002).
- [ ] T005 [P] [US1] Guard range mode behind `positional.length === 2` in
  `scripts/scraper/scrape.mjs`: call `parsePageRange(source, lastPage)`;
  loop `start..end` with `pageUrl` → `loadSource` → `extract` → append to
  one in-memory array (FR-006/FR-007/FR-008), strictly sequential, one
  page at a time.
- [ ] T006 [US1] Add realtime stdout logging for range mode in
  `scripts/scraper/scrape.mjs`: `[page N] fetched <url>`, one
  `[page N] + <id> | <title> | <price> грн` line per extracted entry,
  `[page N] appended <k> entries (total <t>)` with the running total of
  the in-memory JSON object.
- [ ] T007 [US1] Update the `test` script in `scripts/scraper/package.json`
  to run both suites: `node --test test/extract-check.mjs test/pages-check.mjs`.

**Checkpoint**: At this point, User Story 1 is fully functional — a live
two-argument run against the paginated price list produces the realtime
log and the merged catalog file (quickstart scenario 2).

---

## Phase 4: User Story 2 - Single-Page Usage Still Works (Priority: P2)

**Goal**: One-argument invocation behaves byte-for-byte as before the
extension (FR-013).

**Independent Test**: `node scrape.mjs fixtures/example.html` prints only
the summary line, writes the same 6-entry catalog, and exits 0 — identical
to the 003 behavior; `node --test test/extract-check.mjs` stays green.

### Implementation for User Story 2

- [ ] T008 [US2] Ensure the single-argument branch in
  `scripts/scraper/scrape.mjs` (entered when `positional.length === 1`)
  never touches the range code path: same fetch/read → extract → write →
  summary-only stdout → exit codes 0/1/2 as in 003 (FR-013).
- [ ] T009 [US2] Regression check: `node scrape.mjs fixtures/example.html`
  → `Extracted 6 entries → catalog.json`, exit 0, stdout contains no
  `[page N]` lines; `node --test test/extract-check.mjs` passes.

**Checkpoint**: At this point, User Stories 1 AND 2 both work independently.

---

## Phase 5: User Story 3 - Clear Errors for Invalid Ranges and Failed Pages (Priority: P2)

**Goal**: Every invalid range and every failed/empty page in the range
produces a clear, page-naming error and the correct non-zero exit code,
with no output file written (FR-002…FR-004, FR-009, FR-010).

**Independent Test**: Each of `'<url>?page=2' 1` (inverted), `'<url>?page=2' abc`
(non-numeric), `fixtures/example.html 3` (file + last page) exits 1 with an
`Error:` line; a range whose page cannot be fetched exits 1 naming the
page; a range containing an empty page exits 2 naming the page; no
`catalog.json` is written on any failure.

### Implementation for User Story 3

- [ ] T010 [P] [US3] Wire `parsePageRange` failures to stderr + exit 1 in
  `scripts/scraper/scrape.mjs` (usage errors: non-http(s) source with last
  page, non-numeric page parameter, non-positive-whole-number last page,
  inverted range) — `Error:` prefixed, usage line appended, exit 1.
- [ ] T011 [US3] Handle fetch failure of any page mid-range in
  `scripts/scraper/scrape.mjs`: `Error: failed to fetch <page-url> …`
  naming the page, exit 1, no output file written (FR-009).
- [ ] T012 [US3] Handle a page with no extractable data in
  `scripts/scraper/scrape.mjs`: `Error: no test data found in <page-url>`
  naming the page, exit 2 (distinct from code 1), no output file written
  (FR-010).

**Checkpoint**: All three error classes verified via quickstart scenario 4.

---

## Phase 6: User Story 4 - Run Summary Covers the Whole Range (Priority: P3)

**Goal**: After a successful range scrape, the final summary states the
total entry count, the page range covered, and the output location
(FR-012); single-page summary stays unchanged.

**Independent Test**: Successful `'<url>?page=2' 3` run ends with
`Extracted <total> entries (pages 2-3) → <output path>` on stdout.

### Implementation for User Story 4

- [ ] T013 [US4] Print the final summary in range mode in
  `scripts/scraper/scrape.mjs`:
  `Extracted <total> entries (pages <start>-<last>) → <output path>`;
  keep the single-page summary line exactly as-is.

**Checkpoint**: All user stories independently functional.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Whole-feature validation and scope enforcement.

- [ ] T014 [P] Run the full scraper test suites:
  `node --test test/extract-check.mjs test/pages-check.mjs` in
  `scripts/scraper/` — all GREEN.
- [ ] T015 [P] Execute the live validation scenarios from
  `specs/004-scraper-page-range/quickstart.md` (range run, boundaries,
  error cases) and confirm each expected stdout/exit-code/output outcome.
- [ ] T016 Run the root gates (`npm run lint`, `npm test -- --run`,
  `npm run build`) and confirm `git status` shows no changes outside
  `scripts/scraper/` (FR-014 scope enforcement).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — baseline verification first.
- **Foundational (Phase 2)**: Depends on Setup; BLOCKS all user stories.
- **User Stories (Phase 3+)**: All depend on Foundational completion;
  proceed sequentially in priority order (P1 → P2 → P2 → P3).
- **Polish (Final Phase)**: Depends on all user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Starts after Phase 2 — no dependencies on other
  stories.
- **User Story 2 (P2)**: Starts after Phase 2 — shares `scrape.mjs` with
  US1 (arg parsing + loop guard), so it lands right after US1 in the same
  file; independently testable via the fixture.
- **User Story 3 (P2)**: Starts after Phase 2 — error handling lives in the
  same `scrape.mjs` range loop; independently testable via invalid-input
  runs.
- **User Story 4 (P3)**: Starts after Phase 2 — a one-line summary addition
  to the same loop; independently testable via a successful run's final
  line.

### Within Each User Story

- Tests (foundational, T002) MUST fail before implementation (T003).
- Pure module (Phase 2) before CLI wiring (US1–US4).
- Core loop before logging before summary.
- Story complete before moving to the next priority.

### Parallel Opportunities

- T002 and T003 can run in parallel (module + its tests — same contract,
  different files; run together, tests go RED→GREEN).
- T004 and T005 are [P]: arg parsing and the loop guard touch different
  regions of `scrape.mjs` — implement sequentially anyway to avoid same-file
  conflicts; the [P] marker notes they have no cross-dependencies on other
  files.
- T010 is [P]: usage-error wiring is independent of the fetch/empty-page
  handlers (T011, T012).
- T014, T015, T016 are [P]: test suites, live validation, and root gates
  run independently.

---

## Parallel Example: User Story 1

```bash
# Foundational pair (run together, RED then GREEN):
Task: "Write RED unit tests in scripts/scraper/test/pages-check.mjs"
Task: "Implement scripts/scraper/src/pages.mjs until tests pass"

# US1 tasks in sequence (same file — scrape.mjs):
Task: "Extend argument parsing in scripts/scraper/scrape.mjs"
Task: "Add the range loop in scripts/scraper/scrape.mjs"
Task: "Add realtime stdout logging in scripts/scraper/scrape.mjs"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (baseline green)
2. Complete Phase 2: Foundational (`pages.mjs` + tests)
3. Complete Phase 3: User Story 1 (range loop + realtime logging + merged
   output)
4. **STOP and VALIDATE**: run quickstart scenario 2 against the live
   paginated price list
5. Deliver the MVP: two-argument range scraping with realtime stdout log

### Incremental Delivery

1. Setup + Foundational → pure, tested range logic
2. Add User Story 1 → test independently → MVP (range scraping works)
3. Add User Story 2 → regression check → single-page mode proven untouched
4. Add User Story 3 → error-path validation → no silent partial results
5. Add User Story 4 → summary check → polish + scope verification

### Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to the spec's user story for traceability
- Commit after each task or logical group; stop at any checkpoint to
  validate the story independently
- **Scope**: no file outside `scripts/scraper/` may be modified (FR-014)
- **Untouched by design**: `load-source.mjs`, `extract.mjs`,
  `normalize.mjs`, `selectors.json`, `fixtures/example.html`,
  `test/extract-check.mjs`
