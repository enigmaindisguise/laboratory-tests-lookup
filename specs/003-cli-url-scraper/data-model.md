# Data Model: CLI URL Scraper

Phase 1 output. Entities and rules derived from the feature spec
(`spec.md`), the clarification session (2026-08-01), and the attached example
document.

## Entities

### ScrapedEntry

One extraction result per test listed on the page. Produced by the tool and
written to the output JSON file. Its shape is identical to the application's
`LaboratoryTest` catalog entry so the produced dataset can be consumed as the
catalog unchanged (SC-003).

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | string | optional, default `''` | Identifier as it appears on the page (e.g. `5520`); reused as the catalog entry id (developer may remap when merging) |
| title | string | optional, default `''` | Test name as shown on the page |
| description | string | optional, default `''` | Free-text description as shown on the page |
| price | integer (number) \| null | optional, default `null`; ≥ 0 when present | Price in UAH, normalized to a whole number (FR-006); `null` when the page has no price |

- One `ScrapedEntry` per matched item element on the page; repeated test
  names stay separate entries (FR-010).
- No persistence beyond the output file; no server involvement
  (constitution I applies to the app runtime; the tool is authoring tooling).

### ScrapeConfig

The user-provided extraction configuration (FR-012). Selectors target the
page's HTML structure only — element types, classes, and attributes (e.g.
schema.org microdata attributes such as `itemprop`).

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| item | string | REQUIRED, valid CSS selector | Selects one element per entry (e.g. `tr.page-analize__table_tr`) |
| fields | map<string, FieldConfig> | REQUIRED, must contain `id`, `title`, `description`, `price` | Output key → extraction rule |

### FieldConfig

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| selector | string | REQUIRED, valid CSS selector | Resolved **relative to** the matched item element |
| attr | string? | optional | When set, the value is read from this attribute (e.g. `content` for `<meta itemprop="price" content="630">`); when absent, the trimmed text content is used |

## Validation Rules

- `price` MUST be an integer ≥ 0 after normalization (FR-006); a price that
  cannot be normalized to a number (or is absent) is emitted as `null` for
  that entry.
- All four fields are optional: every matched item element produces exactly
  one `ScrapedEntry`; missing/empty fields fall back to `''` (text) or
  `null` (price). Nothing is dropped at extraction time.
- If the `item` selector matches nothing, the run reports "no test data
  found" and exits with code 2 (FR-008) — distinct from usage/network
  errors (code 1).
- The output file is written only when at least one entry was extracted.

## Normalization Rules (price)

| Input | Output | Rule |
|-------|--------|------|
| `630` | `630` | digits kept |
| `630 грн` | `630` | non-digit residue discarded |
| `1 250,50` | `1250` | separators/decimals discarded (whole UAH) |
| `` / `немає` | `null` | no digits → price emitted as `null` |

A discounted-price page (schema.org `lowPrice` next to `itemprop="price"`)
keeps the regular `price` value; the discount is not extracted.

## Mapping to the Application

`ScrapedEntry` → `LaboratoryTest` (the app's existing entity: `id`, `price`
integer UAH ≥ 0, `title`, `description`). Field names and types align
1:1; no transformation is required beyond the developer's optional id
remapping when merging the produced file into `src/data/laboratory-tests.json`.

## State Transitions

| Action | Transition |
|--------|------------|
| Run with valid source + config | fetch/read HTML → extract entries → write output file → exit 0 with summary |
| Malformed URL / unreachable / HTTP error | exit 1, clear error on stderr, no output file |
| `item` selector matches nothing | exit 2, "no test data found", no output file |
| Some entries missing fields | entries emitted with `''` / `null` defaults, exit 0 |
