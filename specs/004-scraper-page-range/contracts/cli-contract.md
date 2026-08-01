# CLI Contract: scraper — Range Mode (004)

The command-line interface of the scraping tool (`scripts/scraper/scrape.mjs`)
as extended by feature 004. This document supersedes the 003
[cli-contract](../003-cli-url-scraper/contracts/cli-contract.md) for the
new two-argument invocation; everything in the 003 contract that is not
contradicted here still applies (options, exit-code meaning, output shape,
error prefixes).

## Invocation

```text
node scrape.mjs <source> [<lastPage>] [--selectors <path>] [--output <path>] [--help]
```

### Positional arguments

- **One argument** (`<source>` only): single-page mode — exactly the 003
  behavior, unchanged (FR-013). `<source>` may be an existing local HTML
  file path or an http(s) URL.
- **Two arguments** (`<source> <lastPage>`): **range mode** (FR-001).
  - `<lastPage>` MUST be a positive whole number (FR-002); otherwise it is
    a usage error.
  - `<source>` MUST be an http(s) URL — a local file path combined with
    `<lastPage>` is a usage error (FR-004).
  - The start page is read from the URL's `page` query parameter; a URL
    without it starts at page 1 (FR-005). A non-numeric `page` value is a
    usage error.
  - The last page MUST be ≥ the start page; an inverted range is a usage
    error (FR-003). `lastPage === start` scrapes exactly one page (still
    range mode: logging on, URL advanced).
  - Every page from `start` through `lastPage`, inclusive, is fetched
    sequentially, one at a time (FR-006), extracting with the same
    `--selectors` config as single-page mode (FR-007).

### Options (unchanged from 003)

| Option | Default | Description |
|--------|---------|-------------|
| `--selectors <path>` | `./selectors.json` | Selector configuration file (schema in the 003 data-contract) |
| `--output <path>` | `./catalog.json` | Output JSON file (merged entries, app catalog format) |
| `--help` | — | Print usage and exit 0 |

More than two positional arguments is a usage error (FR-002).

## stdout: realtime progress log (range mode)

In range mode stdout is a realtime log of what is parsed and appended,
one line per event, followed by the final summary. Lines are emitted as
the work happens (no buffering until the end).

```text
[page 2] fetched https://example.org/analize?page=2
[page 2] + 7117 | Назва тесту … | 1310 грн
[page 2] + 7117 | Назва тесту … | 1310 грн
[page 2] appended 14 entries (total 14)
[page 3] fetched https://example.org/analize?page=3
[page 3] + …
[page 3] appended 13 entries (total 27)
Extracted 27 entries (pages 2-3) → catalog.json
```

- Per page: a `[page N] fetched <url>` line; one
  `[page N] + <id> | <title> | <price> грн` line per extracted entry (in
  document order); a `[page N] appended <k> entries (total <t>)` line with
  the running total of the in-memory JSON object.
- Final line (summary, FR-012):
  `Extracted <total> entries (pages <start>-<last>) → <output path>`.
- Single-page mode keeps the 003 stdout contract (summary line only —
  nothing else on stdout).
- stderr is unchanged: every error is `Error:`-prefixed.

## Exit codes

| Code | Meaning |
|------|---------|
| 0 | Success — merged output file written, summary printed |
| 1 | Usage error (bad/extra arguments, invalid `<lastPage>`, inverted range, file + last page, non-numeric `page` param, invalid selectors JSON, malformed URL), fetch failure of any page in the range (naming the page), or internal error — no output file |
| 2 | A page in the range fetched successfully but contained no extractable data (FR-010, naming the page); single-page mode: no test data found (unchanged) — no output file |

## Output file

Same shape as 003: a pretty-printed JSON array of entries, one per test,
**merged across all pages in page order** (FR-008). Written only when the
whole range succeeded (FR-009/FR-010). The tool never writes into the
application's catalog itself (FR-009 of 003 still applies).

## Examples

```bash
# Range mode: start at page 2, scrape through page 5
node scrape.mjs 'https://example.org/analize?page=2' 5

# Range mode with custom config and output path
node scrape.mjs 'https://example.org/analize?page=1' 3 \
  --selectors my-selectors.json --output out/tests.json

# Single-page mode (unchanged)
node scrape.mjs fixtures/example.html
node scrape.mjs https://example.org/analize

# Invalid ranges
node scrape.mjs 'https://example.org/analize?page=2' 1   # inverted → exit 1
node scrape.mjs 'https://example.org/analize?page=2' x   # not a number → exit 1
node scrape.mjs fixtures/example.html 3                  # file + last page → exit 1
```

## Contract notes

- The range is authoritative: the tool fetches exactly `start..end`; an
  empty or failing page inside the range is reported as an error, not
  skipped silently.
- Pages are fetched strictly sequentially (one at a time) — no parallel
  requests.
- The realtime stdout log is a deliberate, scoped deviation from the 003
  "stdout stays clean" note: it applies to range mode only, where the
  output file (not stdout) is the artifact.
