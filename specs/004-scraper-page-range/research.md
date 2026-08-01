# Research: Scraper Page Range

Phase 0 output for `specs/004-scraper-page-range`. Resolves the design
unknowns for extending the CLI scraper with a page-range loop. Each entry
follows Decision / Rationale / Alternatives considered.

## 1. Loop strategy: strictly sequential, one page at a time

- **Decision**: The range is scraped with a plain sequential loop — page
  `start`, then `start+1`, … through `last`, each iteration running the
  *existing* pipeline (fetch HTML → extract → normalize), appending the
  page's entries to a single in-memory array, and logging progress to
  stdout before moving on. No `Promise.all`, no concurrency.
- **Rationale**: This is an explicit user requirement ("Run one page at a
  time"). It also keeps the run deterministic (output order = page order),
  makes the realtime log coherent (each line is emitted right as its page
  is processed), and is polite to the target site. The existing per-page
  pipeline is reused as-is — "don't change unnecessary code".
- **Alternatives considered**:
  - Parallel fetching (`Promise.all`) — faster wall-clock, but violates the
    explicit "one page at a time" requirement, scrambles log/append order,
    and hammers the site with simultaneous requests.
  - A `--pages` flag with a range string (`--pages 2-5`) — different
    interface than the user specified; the two-positional-argument shape is
    fixed by the feature description.

## 2. Start page and URL advancement

- **Decision**: The start page is read from the URL's `page` query
  parameter (per the user's example `…?page=2`); a URL without that
  parameter is treated as page 1. Each next page URL is derived by setting
  the `page` parameter to the next number while preserving every other part
  of the URL (scheme, host, path, and all other query parameters). A
  non-numeric `page` value is a usage error.
- **Rationale**: FR-005/FR-006. The standard `URL` API (built into Node)
  parses and re-serializes the URL safely, handling encoding and the
  `?` vs `&` question for us; the example site's pagination links are
  relative (`?page=3`) but the user always supplies an absolute URL with
  `page=`, so preserving the rest of the query string is the correct
  general rule. The example paginated page's own pagination markup confirms
  the parameter name is `page` and that page 1 is reachable without it.
- **Alternatives considered**:
  - String/regex substitution on `?page=N` — fragile: breaks on encoded
    values, on `&`-joined parameters, and on URLs without a query string;
    `URL` is built in and exact.
  - Appending `?page=N` unconditionally — destroys any existing query
    parameters (e.g. filters), violating FR-006's "preserve all other
    parts".
  - Requiring `page=` always — rejected: FR-005 explicitly defaults a
    bare URL to page 1.

## 3. Realtime stdout logging (range mode)

- **Decision**: In range mode, stdout carries realtime progress lines as
  the run proceeds:
  - per page: `[page N] fetched <url>`, then one line per extracted entry
    `[page N] + <id> | <title> | <price> грн`, then
    `[page N] appended <k> entries (total <t>)`;
  - at the end: the summary line
    `Extracted <total> entries (pages <start>-<last>) → <output path>`.
  Errors keep going to stderr (`Error:`-prefixed, unchanged). Single-page
  mode keeps its current clean stdout (summary only).
- **Rationale**: The user explicitly asked for realtime logging into
  stdout of what is being parsed and appended ("appended into a JSON
  object" — the in-memory merged array). Per-entry lines show exactly what
  each page contributed; the running total shows the object growing; the
  per-page bracket prefix makes lines greppable per page. This is a
  deliberate, scoped deviation from the 003 contract note "stdout stays
  clean" — limited to range mode, where the output file (not stdout) is
  the artifact.
- **Alternatives considered**:
  - Logging to stderr — keeps stdout pipe-clean, but contradicts the
    explicit "into stdout" requirement.
  - Logging only page-level summaries — loses "what is being parsed and
    appended" per entry, which is what the user asked to see.
  - A `--verbose` opt-in flag — the user wants the logging on by default
    in range mode; a flag is added complexity for nothing.

## 4. Range validation and failure semantics

- **Decision**: The last-page argument must be a positive whole number,
  and must be ≥ the start page (a URL `?page=5` with last page `2` is a
  usage error; last page equal to the start page is a valid one-page
  range). Pagination requires an http(s) URL — a local file path combined
  with a last-page argument is a usage error. If any page in the range
  fails to fetch (timeout/HTTP error), the run stops with a clear error
  naming that page and exit code 1; if a page yields no extractable data,
  the run stops with exit code 2 naming that page. The output file is
  written only when the whole range succeeded.
- **Rationale**: FR-002/FR-003/FR-004/FR-009/FR-010. Strictness is the
  user's "last page that should be scraped" reading: the range is
  authoritative, so an empty or failing page inside it is an anomaly worth
  surfacing, not silently tolerating. No output on partial failure avoids a
  misleading half-catalog (same "write at the end" behavior as single-page
  mode).
- **Alternatives considered**:
  - Skip-and-warn on empty pages — friendlier when the site has fewer
    pages than requested, but silently produces an incomplete catalog and
    contradicts the existing single-page "no data found" semantics
    (FR-008/FR-010 consistency).
  - Writing per-page partial outputs — creates merge work for the
    developer; the whole point of the range mode is a single merged file.

## 5. Where the loop lives

- **Decision**: Orchestration (the loop, logging, append, final write)
  lives in `scrape.mjs`; the two pure helpers go in a new `src/pages.mjs`:
  `parsePageRange(url, lastPageArg)` → `{start, end}` (throws descriptive
  errors) and `pageUrl(url, page)` → advanced URL string. Everything else
  (`load-source.mjs`, `extract.mjs`, `normalize.mjs`, `selectors.json`,
  `fixtures/example.html`, the existing test file) is untouched.
- **Rationale**: Matches the existing architecture — `src/` holds pure,
  I/O-free logic; the CLI owns side effects (constitution IV). The user's
  "don't change unnecessary code" is honored: only the entry point and one
  new small module change.
- **Alternatives considered**:
  - A new `src/scrape-pages.mjs` orchestrator module — would be testable
    only with I/O mocking; the loop is thin glue over already-tested pure
    functions, so keeping it in the CLI is simpler.
  - Inlining the helpers in `scrape.mjs` — mixes parse/URL logic into the
    CLI and makes it untestable without spawning the process.

## 6. Selector configuration compatibility

- **Decision**: `selectors.json` is reused unchanged; no site-specific
  selectors are hard-coded. The example paginated page uses the same
  schema.org microdata attributes (`itemprop="url"`, `itemprop="name"`,
  `itemprop="description"`, `itemprop="price"` with `content`) that the
  existing fixture and default selectors already target, so the same config
  drives every page of the range identically.
- **Rationale**: FR-012/FR-017 — selectors stay developer-provided and
  HTML-structure-only. Per-page extraction is identical to single-page
  mode (FR-007), so no config changes are needed.
- **Alternatives considered**: A per-page selector override — unnecessary;
  pagination in the target site changes the URL only, not the row markup.

## 7. Memory, ordering, and output shape

- **Decision**: All entries are accumulated in one array in page order
  (each page's entries appended as extracted), then serialized with the
  existing `JSON.stringify(entries, null, 2)` to `--output`. Duplicates
  across pages are kept (FR-011). The array lives only for the duration of
  the run (hundreds to a few thousand entries — trivial memory).
- **Rationale**: The output contract (FR-008) is "a single output file in
  the application's catalog format" — exactly the same JSON array shape as
  single-page mode, so the app consumes the result unchanged (SC-004).
- **Alternatives considered**: Streaming append per page — adds partial
  state and contradicts "write only on full success"; the catalog sizes in
  scope make buffering in memory a non-issue.
