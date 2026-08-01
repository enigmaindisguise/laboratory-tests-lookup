# Quickstart: CLI URL Scraper — Validation Guide

Runnable end-to-end validation for `specs/003-cli-url-scraper`. Proves the
feature works: fetch/read HTML → extract via selectors → JSON output.
Details live in the contracts, not here.

## Prerequisites

- Node.js ≥ 20 (the project's CI runs Node 20 — `nvm use 20`).
- **Machine quirk**: the global npm config has `omit=dev`; install with
  `--no-omit` if you install dev deps (this package has none, but the flag
  is harmless and matches repo convention).

## Setup (one time)

```bash
cd scripts/scraper
npm install          # installs cheerio (the only runtime dependency)
```

## Validation scenarios

### 1. Offline: attached example document → exactly 6 entries (SC-001)

```bash
cd scripts/scraper
node scrape.mjs fixtures/example.html
```

**Expected**:

```
Extracted 6 entries → catalog.json
```

Exit code 0. `catalog.json` contains 6 objects with keys `id`, `title`,
`description`, `price`. First entry:

```json
{
  "id": "5520",
  "title": "ПЛР РНК до коронавірусу SARS-CoV-2 (COVID-19), якісне визначення",
  "description": "Діагностичний маркер інфікування COVID-19",
  "price": 630
}
```

Prices are integers (630, 560, 250, 370, 190, 470); ids 5520, 5521, 5523,
5527а, 9075, 9079.

### 2. Live URL (same page structure)

```bash
node scrape.mjs https://example.org/analize/koronavirus
```

**Expected**: same shape as scenario 1; a one-line summary on stdout; exit 0.

### 3. Custom selectors / output path

```bash
node scrape.mjs https://example.org/analize/koronavirus \
  --selectors my-selectors.json --output out/tests.json
```

**Expected**: selectors read from `my-selectors.json` (see
[data-contract.md](./contracts/data-contract.md) for the schema); output
written to `out/tests.json`; summary names that path.

### 4. Error handling (FR-002…FR-004, FR-008)

```bash
node scrape.mjs                      # → usage on stderr, exit 1
node scrape.mjs not-a-url            # → invalid URL, exit 1
node scrape.mjs https://example.org/404  # → fetch error, exit 1
node scrape.mjs fixtures/example.html --selectors <config matching nothing>
                                     # → "no test data found", exit 2
```

Each prints a clear `Error:` message on stderr; no output file is created.

### 5. Automated checks

```bash
cd scripts/scraper
node --test test/extract-check.mjs   # extraction unit tests (fixture-based)
```

**Expected**: all tests pass (6 entries from fixture, field mapping,
price normalization, empty-page case). Root repo gates
(`npm run lint`, `npm test -- --run`, `npm run build`) must remain green —
the scraper package is isolated from them by design (see
[plan.md](./plan.md), Constitution Check).

## References

- CLI flags & exit codes: [contracts/cli-contract.md](./contracts/cli-contract.md)
- Selector config & output schema: [contracts/data-contract.md](./contracts/data-contract.md)
- Entities & normalization: [data-model.md](./data-model.md)
- Design decisions: [research.md](./research.md)
