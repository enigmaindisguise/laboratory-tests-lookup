# Implementation Plan: CLI URL Scraper

**Branch**: `003-cli-url-scraper` | **Date**: 2026-08-01 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-cli-url-scraper/spec.md`

## Summary

A command-line scraping tool (developer authoring tooling) that fetches a web
page's HTML by URL, extracts laboratory-test entries via user-provided CSS
selectors targeting the page's HTML structure, and writes a JSON data file in
the application's catalog format (`{id, title, description, price}` per
entry). Acceptance anchor: running the tool against the attached example
document (`scripts/scraper/fixtures/example.html`) produces exactly 6
entries.

The tool lives in an isolated Node package at `scripts/scraper/` so it does
not touch the application's stack, config, or bundle (constitution II).

## Technical Context

**Language/Version**: Node.js ≥ 20 (ESM JavaScript, no build step) — matches
the project's CI Node 20; plain JS chosen so the script runs directly with
`node scrape.mjs` and needs no transpiler in the isolated package.

**Primary Dependencies**: `cheerio` (^1.2.0) — HTML parsing + CSS selector
engine (the only installed package; justified in Complexity Tracking). HTTP
fetching uses Node's built-in `fetch` (stable since Node 18) — no curl
wrapper, no HTTP client package.

**Storage**: None — input is a URL (or a local HTML file path); output is a
JSON file written to disk (`--output`, default `catalog.json` in the current
working directory).

**Testing**: `node:test` + `node:assert` (built into Node, zero
dependencies), run via `node --test test/extract-check.mjs` inside the
scraper package. The test file name deliberately avoids the `*.test.*`
glob so the application's root Vitest suite never discovers it.

**Target Platform**: Developer machine (macOS/Linux/Windows), Node 20+.
Not part of the deployed application; never runs in the browser or on a
server.

**Project Type**: CLI tool (dev authoring tooling).

**Performance Goals**: Single page per run. Success criteria: complete in
≤ 1 minute (SC-001); fail fast on bad input — clear error within 10 seconds
for malformed/unreachable URLs (SC-002). Implemented via a 10 s fetch
timeout (`AbortSignal.timeout`).

**Constraints**: Zero changes to application config (`package.json`,
`tsconfig*.json`, `eslint.config.js`); selectors must target HTML structure
only (FR-012); no hard-coded site knowledge; price recorded as integer UAH
(FR-006).

**Scale/Scope**: One page per invocation; tens to hundreds of entries per
page (the example has 6).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Verdict | Basis |
|-----------|---------|-------|
| I. Lightweight Frontend-Only | **PASS** | The scraper is developer authoring tooling running on a developer's machine at authoring time. It is not deployed, not served, and not part of the application runtime. |
| II. Stack Parity with Set-Ops | **PASS** | The scraper is an isolated package under `scripts/scraper/` with its own `package.json`. App config (`package.json`, `tsconfig.app/node`, `eslint.config.js`) is untouched. `tsc -b` covers only `tsconfig.app` + `tsconfig.node` (vite.config.ts); ESLint flat config matches only `**/*.{ts,tsx}`; Vitest's default glob does not match the scraper test file name. Root gates are unaffected. |
| III. Minimal Dependency Footprint | **PASS (documented)** | The application bundle gains nothing. One dependency (`cheerio`) is added inside the isolated dev-tool package only — see Complexity Tracking. |
| IV. Tested Pure Logic | **PASS** | Extraction is a pure function `(html, config) → entries[]` with no I/O, covered by `node:test` tests against the fixture (6 entries) plus normalization and empty-page cases. |
| V. Type Safety and Lint Gates | **PASS** | App gates (`npm run lint`, `npm run build`, `npm test -- --run`) are untouched and keep passing. The scraper package is validated by its own tests and the quickstart run; adding it to app `tsconfig`/ESLint would violate stack parity (II), so it is intentionally outside those gates. |

No gate failures; no unjustified violations.

## Project Structure

### Documentation (this feature)

```text
specs/003-cli-url-scraper/
├── plan.md              # This file
├── research.md          # Phase 0 output (decisions: parser, fetch, runtime)
├── data-model.md        # Phase 1 output (ScrapedEntry, ScrapeConfig)
├── quickstart.md        # Phase 1 output (validation guide)
├── contracts/           # Phase 1 output
│   ├── cli-contract.md  # CLI invocation, flags, exit codes
│   └── data-contract.md # selectors.json schema + output JSON schema
├── checklists/requirements.md
└── spec.md
```

### Source Code (repository root)

```text
scripts/scraper/              # isolated Node package (own package.json)
├── package.json              # private, "type": "module"; dep: cheerio
├── selectors.json            # default selector config (developer-provided point)
├── scrape.mjs                # CLI entry point (arg parsing, orchestration)
├── src/
│   ├── load-source.mjs       # read HTML: local file path OR fetch URL (10s timeout)
│   ├── extract.mjs           # PURE: (html, config) → entries[] via cheerio
│   └── normalize.mjs         # PURE: field value extraction + price → integer UAH
├── fixtures/
│   └── example.html          # attached example document (6 entries) — saved verbatim
└── test/
    └── extract-check.mjs     # node:test suite (run via `node --test`)
```

**Structure Decision**: Single isolated mini-package (no workspaces, no app
integration). Plain ESM JavaScript avoids a build/transpile step so the tool
is runnable with `node` alone. The test file is named `extract-check.mjs`
(no `.test.`/`.spec.` suffix) so the application's root Vitest run never
discovers it, keeping `npm test` green without touching Vitest config.
Sources under `src/` mirror the app's "small single-responsibility files"
convention; extraction/normalization stay I/O-free for testability
(constitution IV).

## Complexity Tracking

> Filled because Constitution Check has a documented dependency addition.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| `cheerio` dependency inside `scripts/scraper/` only | CSS-selector-driven HTML parsing requires a real HTML parser; cheerio is the standard, minimal option and the selectors the developer supplies (FR-012) need a CSS selector engine | Regex parsing of HTML is fragile and incorrect for real-world documents (nested tags, entities, attributes); `jsdom` is ~10× heavier; `parse5` alone has no selector API. The application bundle is untouched (constitution III applies to the app, not to isolated dev tooling). |
