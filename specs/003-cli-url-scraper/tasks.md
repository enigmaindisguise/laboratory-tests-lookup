# Tasks: CLI URL Scraper

**Input**: Design documents from `/specs/003-cli-url-scraper/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Included — the ratified plan (plan.md, Constitution Check IV) and
research.md (§4) commit the scraper's pure extraction logic to a `node:test`
suite (`scripts/scraper/test/extract-check.mjs`), so test tasks are part of
the definition of done, not optional.

**Organization**: Tasks are grouped by user story to enable independent
implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- All paths are relative to the repository root.
- The scraper is an **isolated Node package** at `scripts/scraper/` (own
  `package.json`); the app's root config/gates must stay untouched
  (constitution II).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Stand up the isolated scraper package; verify assets pre-created
during planning.

- [X] T001 Create `scripts/scraper/package.json` — `"name": "scraper"`,
      `"private": true`, `"type": "module"`, scripts
      `{"scrape": "node scrape.mjs", "test": "node --test test/extract-check.mjs"}`,
      dependency `"cheerio": "^1.2.0"`
- [X] T002 Install dependencies: run `npm install` inside
      `scripts/scraper/` (installs cheerio; verify with
      `test -d scripts/scraper/node_modules/cheerio`)
- [X] T003 [P] Verify pre-created assets: `scripts/scraper/fixtures/example.html`
      contains exactly 6 `tr.page-analize__table_tr` rows, and
      `scripts/scraper/selectors.json` matches the schema in
      `specs/003-cli-url-scraper/contracts/data-contract.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story
can be implemented.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Implement source loading in `scripts/scraper/src/load-source.mjs` —
      auto-detect the positional source: existing file path → read file
      (UTF-8); otherwise http(s) URL → Node `fetch` with
      `AbortSignal.timeout(10_000)`; non-2xx response → throw clear error;
      return HTML string
- [X] T005 [P] Implement field extraction helpers in
      `scripts/scraper/src/normalize.mjs` — `extractField(el, fieldConfig)`:
      read `attr` value if set, else trimmed text content; `normalizePrice`:
      digits only → integer ≥ 0 (e.g. `"630 грн"` → `630`,
      `"1 250,50"` → `1250`); return `null` when nothing/non-numeric
- [X] T006 Implement extraction in `scripts/scraper/src/extract.mjs` — pure
      function `extract(html, config) → entries[]`: parse with cheerio,
      select `config.item`, resolve each field selector relative to the item,
      normalize via `normalize.mjs`, skip entries with any missing field,
      return `[]` when no items match

**Checkpoint**: Foundation ready — user story implementation can now begin.

---

## Phase 3: User Story 1 - Scrape a Lab Price List into the Catalog Data (Priority: P1) 🎯 MVP

**Goal**: Running `node scrape.mjs <source>` with the default selectors
extracts one entry per test (id, title, description, price) and writes a JSON
file in the application's catalog format.

**Independent Test**: `node scrape.mjs fixtures/example.html` exits 0 and
writes `catalog.json` containing exactly 6 objects; the first is
`{"id": "5520", "title": "ПЛР РНК до коронавірусу SARS-CoV-2 (COVID-19), якісне визначення", "description": "Діагностичний маркер інфікування COVID-19", "price": 630}`; ids 5521, 5523, 5527а, 9075, 9079 follow (SC-001); the file loads as the app catalog unchanged (SC-003).

### Tests for User Story 1 ⚠️ (write FIRST, ensure they FAIL before implementation)

- [X] T007 [P] [US1] Write extraction tests in
      `scripts/scraper/test/extract-check.mjs` (`node:test`): fixture →
      exactly 6 entries; entry 0 field mapping (id/title/description/price
      via default `selectors.json`); price normalization cases; run with
      `node --test test/extract-check.mjs` from `scripts/scraper/` — RED

### Implementation for User Story 1

- [X] T008 [US1] Implement CLI entry point `scripts/scraper/scrape.mjs` —
      parse exactly one positional source + `--selectors` (default
      `./selectors.json`) + `--output` (default `./catalog.json`); load and
      validate selectors config (keys must be id/title/description/price);
      load source (T004); extract (T006); write output as pretty JSON
      (`JSON.stringify(entries, null, 2)`); never write when 0 entries

**Checkpoint**: User Story 1 fully functional and testable independently —
`catalog.json` produced from the fixture with 6 entries, exit 0.

---

## Phase 4: User Story 2 - Clear Errors Instead of Silent Failures (Priority: P2)

**Goal**: Every failure mode — bad invocation, malformed URL, unreachable
page, no extractable data — produces a readable stderr message and the
correct non-zero exit code, without hanging.

**Independent Test**: Run each failure scenario and assert exit codes:
no argument → 1; two arguments → 1; `not-a-url` → 1; unreachable URL → 1
(within 10 s, SC-002); config that matches nothing → 2; no output file is
created in any case.

### Tests for User Story 2 ⚠️ (write FIRST, ensure they FAIL before implementation)

- [X] T009 [P] [US2] Extend `scripts/scraper/test/extract-check.mjs` with
      failure-path checks: no-match selector config → `[]`; entry with a
      missing field → skipped; invalid selectors config (unknown field key)
      → rejected — RED

### Implementation for User Story 2

- [X] T010 [US2] Add usage/argument validation in
      `scripts/scraper/scrape.mjs` — 0 or >1 positional args → usage text on
      stderr, exit 1 (FR-001, FR-002); malformed URL (missing scheme) →
      `Error: invalid URL: …`, exit 1 (FR-003)
- [X] T011 [US2] Add fetch failure handling in
      `scripts/scraper/src/load-source.mjs` — unreachable host, timeout, or
      non-2xx → `Error: failed to fetch <url> (reason)`, exit 1, bounded by
      the 10 s timeout (FR-004, SC-002)
- [X] T012 [US2] Add no-data handling in `scripts/scraper/scrape.mjs` —
      `extract()` returns `[]` → stderr `Error: no test data found in
      <source>`, exit 2 (distinct from code 1), no output file (FR-008)

**Checkpoint**: User Stories 1 AND 2 both work — happy path extracts,
every failure path exits with a clear message.

---

## Phase 5: User Story 3 - Help and Run Summary (Priority: P3)

**Goal**: `--help` prints usage; every successful run prints a one-line
summary; runs with skipped entries warn without failing.

**Independent Test**: `node scrape.mjs --help` prints usage and exits 0;
a successful run prints `Extracted 6 entries → catalog.json`; a run where
one entry is missing a field prints the summary plus
`Warning: skipped 1 entry(s)` and still exits 0.

### Implementation for User Story 3

- [X] T013 [US3] Implement `--help` in `scripts/scraper/scrape.mjs` — print
      usage (same text as the no-argument error, plus options) and exit 0
      (FR-002)
- [X] T014 [US3] Implement the success summary in
      `scripts/scraper/scrape.mjs` — print `Extracted N entries → <output>`
      to stdout; when entries were skipped for missing fields, append
      `Warning: skipped M entry(s)` (FR-011)

**Checkpoint**: All user stories independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validation and consistency across all stories.

- [X] T015 [P] Run every scenario in
      `specs/003-cli-url-scraper/quickstart.md` end-to-end (offline fixture,
      live-URL shape, custom `--selectors`/`--output`, error cases,
      automated checks); fix any drift between the docs and the actual CLI
- [X] T016 Run full validation: `node --test test/extract-check.mjs` inside
      `scripts/scraper/`, plus root `npm run lint`, `npm test -- --run`,
      `npm run build` — all must pass (root gates must stay untouched/green)
- [X] T017 Final traceability pass: map every spec requirement
      (FR-001…FR-012) and success criterion (SC-001…SC-004) to the
      implementing file(s) in this tasks.md; update
      `specs/003-cli-url-scraper/checklists/requirements.md` if the mapping
      exposes a gap

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Phase 2; US2 and US3 also
  depend on US1's CLI entry (`scrape.mjs`, T008) because a CLI tool's
  error paths and summary live in the same entry file — run stories
  sequentially (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all user stories

### User Story Dependencies

- **User Story 1 (P1)**: After Phase 2 — no story dependencies
- **User Story 2 (P2)**: After Phase 2 + US1 (T008) — independently
  testable once the CLI exists
- **User Story 3 (P3)**: After Phase 2 + US1 (T008) — independently
  testable once the CLI exists

### Within Each User Story

- Tests MUST be written and FAIL before implementation (RED → GREEN)
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- T003 and T005 are [P] — different files, no dependencies
- T007 ([US1] tests) runs in parallel with T008 ([US1] CLI) — different
  files, RED must be observed before T008 lands
- T009 ([US2] tests) runs in parallel with T010–T012 — different files
- T015 ([P] quickstart run) is independent of T016/T017

---

## Parallel Example: User Story 1

```bash
# Launch tests and CLI implementation together (different files):
Task: "T007 [P] [US1] Write extraction tests in scripts/scraper/test/extract-check.mjs"
Task: "T008 [US1] Implement CLI entry point scripts/scraper/scrape.mjs"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: `node scrape.mjs fixtures/example.html` → 6
   entries in `catalog.json`; tests green
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → foundation ready
2. Add User Story 1 → test independently → **MVP**
3. Add User Story 2 → test error paths independently
4. Add User Story 3 → `--help` + summary
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done: Developer A → US1; tests (T007, T009) can be
   drafted in parallel by a second developer
3. US2/US3 follow sequentially once the CLI entry (T008) exists

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to the spec's user story for traceability
- Each user story is independently completable and testable
- Verify tests fail before implementing (RED)
- Commit after each task or logical group
- Stop at any checkpoint to validate the story independently
- Avoid: vague tasks, same-file conflicts, cross-story dependencies that
  break independence
- Pre-existing (created during planning): `scripts/scraper/fixtures/example.html`
  and `scripts/scraper/selectors.json`

---

## Traceability (T017)

Spec requirements (FR-001…FR-012) and success criteria (SC-001…SC-004) →
implementing file(s). All paths relative to the repository root.

| Requirement | Implementing file(s) |
|-------------|----------------------|
| FR-001 exactly one positional source | `scripts/scraper/scrape.mjs` (parseArgs, positional length check) |
| FR-002 usage on no arg / >1 arg / `--help` | `scripts/scraper/scrape.mjs` (USAGE error, HELP text) |
| FR-003 malformed URL → clear error, non-zero | `scripts/scraper/src/load-source.mjs` (invalid URL throw) + `scrape.mjs` (exit 1) |
| FR-004 fetch failure (unreachable/timeout/HTTP) | `scripts/scraper/src/load-source.mjs` (fetchUrl, `AbortSignal.timeout(10_000)`) + `scrape.mjs` (exit 1) |
| FR-005 one entry per test (id/title/description/price) | `scripts/scraper/src/extract.mjs` (extract) |
| FR-006 price normalization → whole UAH integer | `scripts/scraper/src/normalize.mjs` (normalizePrice) |
| FR-007 catalog-format output via user selectors | `scripts/scraper/scrape.mjs` (writeFile) + `src/extract.mjs` |
| FR-008 no data → exit 2 (distinct from 1) | `scripts/scraper/scrape.mjs` (no-data branch) |
| FR-009 never modifies app catalog | `scripts/scraper/scrape.mjs` (writes only `--output`) |
| FR-010 repeated names kept as separate entries | `scripts/scraper/src/extract.mjs` (one entry per matched item) |
| FR-011 one-line summary | `scripts/scraper/scrape.mjs` (summary + skip warning) |
| FR-012 selectors from config file, HTML structure only | `scripts/scraper/selectors.json` + `src/extract.mjs` (validateSelectors) + `scrape.mjs` (`--selectors`) |
| SC-001 exactly 6 entries from example doc, ≤ 1 min | `scripts/scraper/test/extract-check.mjs` + quickstart scenario 1 (verified: 6 entries) |
| SC-002 clear error within 10 s | `scripts/scraper/src/load-source.mjs` (10 s fetch timeout; verified 10.2 s incl. Node boot) |
| SC-003 produced dataset loads as app catalog | output shape matches `src/data/laboratory-tests.json` keys/types (verified) |
| SC-004 full refresh without retyping | tool end-to-end: HTML → catalog-format JSON → developer review |

No gaps found; the spec-quality checklist (`checklists/requirements.md`) is
unchanged (already PASS).
