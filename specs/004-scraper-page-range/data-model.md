# Data Model: Scraper Page Range

Phase 1 output. Entities and rules derived from the feature spec
(`spec.md`) and the design decisions in `research.md`.

## Entities

### ScrapedEntry *(existing, unchanged)*

One extraction result per test listed on a page — the same entity as the
single-page scraper (see `specs/003-cli-url-scraper/data-model.md`):
`id` (string, default `''`), `title` (string, default `''`), `description`
(string, default `''`), `price` (integer ≥ 0, whole UAH, or `null` when the
page has no price). Produced per page by the unchanged extraction pipeline;
shape is identical to the application's `LaboratoryTest` catalog entry
(SC-004).

### PageRange *(new)*

The ordered set of pages the tool must scrape. Derived by the CLI from the
two positional arguments.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| start | integer | ≥ 1 | Start page taken from the URL's `page` query parameter (FR-005); 1 when the parameter is absent. A non-numeric value is a usage error. |
| end | integer | ≥ 1, ≥ start | Inclusive last page, given as the second positional argument; must be a positive whole number (FR-002). `end === start` is a valid one-page range. |

- The range is authoritative: the tool fetches exactly `start..end` and
  does not probe for an earlier end of pagination (spec Assumptions).
- Pagination mode requires an http(s) URL source; a local file path cannot
  form a `PageRange` (FR-004).

### MergedCatalog *(new)*

The in-memory "JSON object" the run appends to: an ordered array of
`ScrapedEntry`, page by page. Written to the output file exactly once, when
every page in the range succeeded.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| entries | array of ScrapedEntry | REQUIRED, page order preserved | One page's entries appended after the previous page's (FR-008); duplicates across pages kept (FR-011). |

## Validation Rules

- `parsePageRange(url, lastPageArg)` MUST reject: a non-positive/non-integer
  `lastPageArg`; `end < start`; a local-file source paired with a
  `lastPageArg`; a non-numeric `page` query parameter in the URL.
- `pageUrl(url, page)` MUST produce a URL that differs from the input only
  in the `page` parameter (FR-006); all other query parameters, path,
  scheme, and host are preserved.
- Per-page extraction keeps every existing rule (missing fields are emitted
  as `''` / `null` defaults; price normalization is unchanged).
- The output file is written only when every page in the range produced
  extractable entries and was fetched successfully (FR-009/FR-010).

## State Transitions

| Action | Transition |
|--------|------------|
| Range run, all pages succeed | fetch page start → extract → append → log → … → fetch page end → write merged file → exit 0 with summary |
| Last page not a positive whole number / `end < start` / file + last page | exit 1, usage error on stderr, nothing fetched |
| A page in the range fails to fetch (timeout / HTTP error) | exit 1, `Error:` naming the page, no output file |
| A page in the range yields no extractable data | exit 2, `Error:` naming the page, no output file |
| Single-argument invocation | unchanged single-page flow (FR-013): fetch/read → extract → write → summary → exit 0/1/2 |

## Mapping to the Application

`MergedCatalog.entries` are `ScrapedEntry`s, which map 1:1 onto the
application's `LaboratoryTest` entity exactly as in 003 — the merged file
is consumed as the catalog unchanged (SC-004). No transformation is
required beyond the developer's optional id remapping when merging.
