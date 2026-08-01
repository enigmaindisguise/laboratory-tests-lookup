# Research: CLI URL Scraper

Phase 0 output for `specs/003-cli-url-scraper`. Resolves the technical
unknowns recorded in the plan's Technical Context. Each entry follows
Decision / Rationale / Alternatives considered.

## 1. HTML parsing library

- **Decision**: `cheerio` (^1.2.0) inside the isolated `scripts/scraper`
  package.
- **Rationale**: The tool's core requirement is "parse HTML into JSON based
  on selectors that the developer provides" (FR-012). Cheerio is a jQuery-
  like API over a WHATWG-compliant parser (`parse5`) and provides a CSS
  selector engine out of the box (`$(selector, context)`), which maps
  directly onto the config-driven field selectors. It is the de-facto
  standard for Node CLI scraping, small (~1.1 MB installed), and has no
  native dependencies. Verified against npm: latest is 1.2.0.
- **Alternatives considered**:
  - `parse5` — spec-compliant parser, but no selector API; would require
    hand-rolling a traversal/query layer (more code, more bugs).
  - `jsdom` — full DOM implementation; heavy (~5 MB+), slow to boot,
    overkill for static extraction.
  - `linkedom` — lighter DOM; selector support exists but the API surface is
    smaller and less battle-tested than cheerio's.
  - Regex/string parsing — rejected outright: real-world HTML (nested tags,
    entities like `&#039;`, attributes with quotes, `meta` tags) breaks
    regex extraction; incorrect output would violate SC-001.

## 2. HTTP fetching strategy

- **Decision**: Node's built-in `fetch` (global since Node 18) with a
  10-second timeout via `AbortSignal.timeout(10_000)`.
- **Rationale**: Zero dependencies — the user permitted installing packages
  "only if needed to work with HTML or CURL"; Node 20 already ships a full
  HTTP/1.1+ client with redirect following (the page redirects `?page=1`
  links etc.). `fetch` returns `response.text()`, which decodes UTF-8 —
  the charset used by the example document (`<meta charset="utf-8">`).
  Non-2xx responses are treated as fetch failures (clear error + exit 1).
- **Alternatives considered**:
  - Shelling out to `curl` — extra process, platform quirks, messy
    argument/escaping handling; adds nothing over native `fetch`.
  - `node-fetch`/`axios` packages — same capability as native `fetch`; an
    unnecessary dependency.

## 3. Language & runtime

- **Decision**: Plain ESM JavaScript (`"type": "module"`), run directly with
  `node scrape.mjs`. No TypeScript, no build step, no runner dependency.
- **Rationale**: The scraper is an isolated dev tool, not part of the app's
  TS project (constitution II forbids touching app tsconfig/eslint).
  Plain JS keeps the tool executable with a single `node` invocation.
  Node ≥ 20 is already required by the project (CI runs Node 20).
- **Alternatives considered**:
  - TypeScript + `tsx` runner — adds a dev dependency and a runtime shim;
    type safety would only benefit this one-off tool, and the app's strict
    TS gates deliberately exclude `scripts/`.
  - TypeScript compiled by `tsc` to `dist/` — adds a build step for a
    ~200-line tool.
  - Shell script — inadequate for selector-driven DOM parsing.

## 4. Testing approach

- **Decision**: `node:test` + `node:assert` (built into Node 20), run via
  `node --test test/extract-check.mjs` from the scraper package.
- **Rationale**: Zero additional dependencies. The extraction logic is kept
  pure (`html + config → entries[]`), so tests are plain function
  assertions: 6 entries from the fixture, correct field mapping for entry
  5520, price normalization, empty/no-match cases. The file is named
  `extract-check.mjs` (not `*.test.mjs`) so the app's root Vitest glob
  (`**/*.{test,spec}.*`) never picks it up — `npm test` at the repo root
  stays green without touching Vitest config.
- **Alternatives considered**:
  - Vitest inside the scraper package — duplicates the app's toolchain for
    one module; adds `vitest` as a second package dependency.
  - No tests — rejected: constitution IV requires tested pure logic.

## 5. Source input handling (URL vs. local file)

- **Decision**: The single positional argument is auto-detected: if it is an
  existing local file path, the HTML is read from disk; otherwise it is
  treated as an http(s) URL and fetched.
- **Rationale**: The user's acceptance check ("produces 6 entries from this
  HTML document") must be runnable offline and deterministically against the
  saved fixture; the same code path then works against live URLs in
  production use. Auto-detection is unambiguous (a URL never names an
  existing local file).
- **Alternatives considered**:
  - A separate `--file` flag — more explicit but adds a flag that
    auto-detection makes unnecessary (KISS).

## 6. Selector configuration format

- **Decision**: A JSON config file (`selectors.json` by default, overridable
  with `--selectors <path>`): one `item` selector (repeating element per
  entry) plus `fields` mapping output keys to `{selector, attr?}` — the
  selector is resolved relative to each item; `attr` (optional) reads an
  attribute value, otherwise the trimmed text content is used.
- **Rationale**: JSON is the project's native data format (catalog is JSON),
  trivially validatable, and editable by the developer without touching
  code. The `attr` option is required for values carried in attributes
  (e.g. `price` lives in `<meta itemprop="price" content="630">`).
- **Alternatives considered**:
  - Selectors as CLI flags — unwieldy for four+ fields; not persistent.
  - Inline JS config — couples the "user-provided" part to code and
    enables arbitrary execution; JSON is declarative and safe.

## 7. Price normalization

- **Decision**: The raw extracted value (text or attribute) is normalized to
  a non-negative integer: digits only, leading zeros trimmed; non-numeric
  residue (currency words/symbols, separators, decimals) is discarded.
  E.g. `"630 грн"` and `"630"` both become `630`; `"1 250,50"` → `1250`.
- **Rationale**: FR-006 requires plain whole-number UAH matching the
  application's catalog (`price: integer ≥ 0`). The example page renders
  prices as `<b>630</b> грн` and also carries a machine-readable
  `<meta itemprop="price" content="630">`; both forms must yield `630`.
- **Alternatives considered**:
  - Keeping the raw display string (`"630 грн"`) — would break the app's
    catalog contract (integer price) and SC-003.
  - `Intl.NumberFormat` parsing — no inverse API; unnecessary.

## 8. Output file & summary

- **Decision**: Results are written as a JSON array to `--output <path>`
  (default `catalog.json` in the current working directory) with
  `JSON.stringify(entries, null, 2)`. A one-line summary is printed to
  stdout: `Extracted N entries → <path>`. The tool never modifies the
  application's catalog (FR-009).
- **Rationale**: FR-007/FR-011; pretty-printed JSON is diff-friendly for the
  developer's review step before inclusion in the app.
- **Alternatives considered**: Printing JSON to stdout only — loses the
  file artifact the review workflow needs; piping is still possible via
  the summary print (stdout stays clean for `> file` use).
