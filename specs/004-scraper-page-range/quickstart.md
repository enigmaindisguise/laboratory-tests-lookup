# Quickstart: Scraper Page Range — Validation Guide

Runnable end-to-end validation for `specs/004-scraper-page-range`. Proves
the extension works: two-argument invocation → sequential per-page
fetch/extract → realtime stdout log → merged JSON output. Details live in
the contracts, not here.

## Prerequisites

- Node.js ≥ 20 (the project's CI runs Node 20 — `nvm use 20`).
- **Machine quirk**: the global npm config has `omit=dev`; install with
  `--no-omit` if you install dev deps (this package has none, but the flag
  is harmless and matches repo convention).
- Network access to the paginated price-list site being scraped (for the
  live scenarios).

## Setup (one time)

```bash
cd scripts/scraper
npm install          # installs cheerio (the only runtime dependency)
```

## Validation scenarios

### 1. Single-page regression: unchanged behavior (FR-013)

```bash
cd scripts/scraper
node scrape.mjs fixtures/example.html
```

**Expected**: exactly as before this feature —

```
Extracted 6 entries → catalog.json
```

Exit 0; stdout contains only the summary line (no progress lines in
single-page mode); `catalog.json` has the same 6 entries as 003
(`id`/`title`/`description`/`price`, integer prices).

### 2. Range mode against a paginated price list (SC-001)

```bash
node scrape.mjs '<price-list-url>?page=2' 3
```

(replace `<price-list-url>` with the actual site, e.g. the paginated
`/analize` page from the feature description).

**Expected**: exit 0, and stdout shows the realtime log, e.g.:

```
[page 2] fetched <price-list-url>?page=2
[page 2] + 7117 | Назва тесту … | 1310 грн
[page 2] appended 14 entries (total 14)
[page 3] fetched <price-list-url>?page=3
[page 3] appended 13 entries (total 27)
Extracted 27 entries (pages 2-3) → catalog.json
```

- One `+` line per entry actually appended (id | title | price).
- `catalog.json` contains all entries from pages 2 and 3, page order
  preserved, in the app catalog format; the file loads as the application's
  catalog without errors (SC-004).
- Note: real entry counts/titles vary with the live site; the shape is what
  is validated.

### 3. Range boundaries (FR-002…FR-006)

```bash
node scrape.mjs '<price-list-url>' 2                # URL without ?page= → starts at page 1
node scrape.mjs '<price-list-url>?page=2' 2         # one-page range (start == last)
node scrape.mjs '<price-list-url>?page=2?x=1' ...   # n/a — use proper URLs
```

**Expected**: first command fetches pages 1-2; second fetches only page 2
(still logs `[page 2]` lines and prints `(pages 2-2)` in the summary);
other query parameters in the URL are preserved on advanced pages.

### 4. Error handling (FR-002…FR-004, FR-009, FR-010)

```bash
node scrape.mjs '<price-list-url>?page=2' 1         # inverted range → exit 1
node scrape.mjs '<price-list-url>?page=2' abc       # not a number → exit 1
node scrape.mjs fixtures/example.html 3             # file + last page → exit 1
node scrape.mjs '<price-list-url>?page=2' 999       # tail page empty/404 → exit 1 or 2
```

**Expected**: clear `Error:` on stderr naming the problem (page number for
range failures); no output file created; exit codes per the CLI contract.

### 5. Automated checks

```bash
cd scripts/scraper
node --test test/extract-check.mjs test/pages-check.mjs
```

**Expected**: both suites pass — extraction (unchanged) plus the new
page-range/URL-advancement unit tests (start-page parsing, defaults,
inverted/non-numeric ranges, parameter preservation). Root repo gates
(`npm run lint`, `npm test -- --run`, `npm run build`) must remain green —
the scraper package is isolated from them by design (see
[plan.md](./plan.md), Constitution Check).

## References

- CLI invocation, logging format, exit codes: [contracts/cli-contract.md](./contracts/cli-contract.md)
- Entities & validation rules: [data-model.md](./data-model.md)
- Design decisions: [research.md](./research.md)
- Prior single-page contract & data schema (still applicable):
  `specs/003-cli-url-scraper/contracts/`
