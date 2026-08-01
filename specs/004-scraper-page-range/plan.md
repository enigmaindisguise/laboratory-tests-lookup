# Implementation Plan: Scraper Page Range

**Branch**: `004-scraper-page-range` | **Date**: 2026-08-01 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-scraper-page-range/spec.md`

## Summary

Extends the existing CLI scraper (`scripts/scraper/scrape.mjs`) with a
**page-range mode**: the developer passes a price-list URL that carries the
start page (e.g. `https://example.org/analize?page=2`) as the first argument
and the number of the last page to scrape as the second argument. The tool
then runs the **same extraction algorithm** (fetch → extract via selectors →
normalize) **one page at a time**, sequentially, appending every page's
entries into a single in-memory JSON object, and writes the merged result to
the output file. While the range runs, the tool logs to **stdout in real
time** what is being parsed and appended (per-page progress plus one line
per extracted entry).

Single-argument invocation keeps today's exact behavior (FR-013). The
change is confined to `scripts/scraper` (FR-014) and deliberately reuses
the existing `load-source.mjs`, `extract.mjs`, and `normalize.mjs`
unchanged — only the CLI orchestration (`scrape.mjs`) gains the loop, and
one small pure helper module (`src/pages.mjs`) is added for page-range
parsing and URL advancement so that logic stays unit-testable.

## Technical Context

**Language/Version**: Node.js ≥ 20 (ESM JavaScript, no build step) — same
as the existing scraper; plain JS runs directly with `node scrape.mjs`.

**Primary Dependencies**: `cheerio` (^1.2.0) — unchanged, already
installed in the isolated package. HTTP fetching stays on Node's built-in
`fetch` with the existing 10 s timeout. **No new dependencies.**

**Storage**: None. Output is a JSON file written to `--output <path>`
(default `catalog.json`); during a range run entries accumulate in memory
and the file is written only after every page in the range succeeded.

**Testing**: `node:test` + `node:assert` (built-in, zero dependencies), run
via `node --test test/extract-check.mjs test/pages-check.mjs` inside the
scraper package. New pure helpers (`src/pages.mjs`) get a colocated
`test/pages-check.mjs`; both test file names deliberately avoid the
`*.test.*` glob so the application's root Vitest suite never discovers
them.

**Target Platform**: Developer machine (macOS/Linux/Windows), Node 20+.
Not part of the deployed application.

**Project Type**: CLI tool (dev authoring tooling).

**Performance Goals**: Pages are fetched strictly sequentially, one at a
time (user requirement), each bounded by the existing 10 s fetch timeout.
A typical range (a handful of pages, tens of entries per page) completes
well within the spec's 2-minute success bound (SC-001). Fail fast on bad
input: usage errors surface within seconds.

**Constraints**: No changes outside `scripts/scraper` (FR-014); no changes
to `load-source.mjs`, `extract.mjs`, or `normalize.mjs` (user: "don't
change unnecessary code"); no hard-coded site knowledge; selectors config
reused unchanged; entry/price shape unchanged; realtime progress logging
to stdout in range mode only.

**Scale/Scope**: Ranges of up to dozens of pages; hundreds to a few
thousand entries accumulated in one array (the example site's catalog is
~1500 entries across a handful of pages).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Verdict | Basis |
|-----------|---------|-------|
| I. Lightweight Frontend-Only | **PASS** | The scraper remains developer authoring tooling running on a developer's machine at authoring time — never deployed, served, or part of the application runtime. |
| II. Stack Parity with Set-Ops | **PASS** | The change lives entirely inside the isolated `scripts/scraper/` package. App config (`package.json`, `tsconfig*.json`, `eslint.config.js`) is untouched; root gates (`npm run lint`, `npm test -- --run`, `npm run build`) are unaffected, and the new test file name keeps the Vitest glob from matching it. |
| III. Minimal Dependency Footprint | **PASS** | No new dependencies anywhere. The loop uses the already-installed `cheerio` and built-in `fetch`/`URL`/`node:test`. |
| IV. Tested Pure Logic | **PASS** | Page-range parsing and URL advancement are pure functions in `src/pages.mjs` with no I/O, covered by a `node:test` suite. The existing pure extraction/normalization modules are untouched and remain covered. |
| V. Type Safety and Lint Gates | **PASS** | App gates keep passing untouched. The scraper package is validated by its own tests and the quickstart run; it stays intentionally outside app `tsconfig`/ESLint (same rationale as 003). |

No gate failures; no unjustified violations.

## Project Structure

### Documentation (this feature)

```text
specs/004-scraper-page-range/
├── plan.md              # This file
├── research.md          # Phase 0 output (loop, logging, URL advancement)
├── data-model.md        # Phase 1 output (PageRange, merged catalog)
├── quickstart.md        # Phase 1 output (validation guide)
├── contracts/           # Phase 1 output
│   └── cli-contract.md  # Range-mode CLI invocation, logging format, exit codes
├── checklists/requirements.md
└── spec.md
```

### Source Code (repository root)

```text
scripts/scraper/              # isolated Node package (own package.json)
├── package.json              # private, "type": "module"; dep: cheerio (unchanged)
├── selectors.json            # default selector config (unchanged)
├── scrape.mjs                # CLI entry — gains the sequential range loop
│                             #   + realtime stdout logging (range mode only)
├── src/
│   ├── pages.mjs             # NEW, PURE: parsePageRange(), pageUrl() — no I/O
│   ├── load-source.mjs       # unchanged
│   ├── extract.mjs           # unchanged
│   └── normalize.mjs         # unchanged
├── fixtures/
│   └── example.html          # unchanged (single-page fixture)
└── test/
    ├── extract-check.mjs     # unchanged (node:test)
    └── pages-check.mjs       # NEW (node:test) — page-range + URL advancement
```

**Structure Decision**: Same single isolated mini-package; no workspaces, no
app integration. The loop is orchestration, so it lives in the CLI entry
(`scrape.mjs`); everything that is *logic* (deriving start/end from the
arguments, advancing the URL) is extracted into `src/pages.mjs` as pure
functions, mirroring the existing `src/` convention and keeping the logic
testable without I/O (constitution IV). Test files keep the
`*-check.mjs` naming so the app's Vitest run never discovers them.
`load-source.mjs`, `extract.mjs`, `normalize.mjs`, `selectors.json`, and
`fixtures/example.html` are not modified.

## Complexity Tracking

> Not needed — Constitution Check has no violations and no new
> dependencies are introduced.
