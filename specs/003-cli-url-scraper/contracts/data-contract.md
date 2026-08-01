# Data Contract: selectors config & output JSON

The two JSON artifacts the scraper reads and writes. Schema + worked example
anchored to the attached example document (`scripts/scraper/fixtures/example.html`).

## 1. Selector configuration (`selectors.json`)

```jsonc
{
  // CSS selector matching one element per entry (FR-012: HTML structure only)
  "item": "tr.page-analize__table_tr",

  // Output key → extraction rule. Keys MUST be: id, title, description, price.
  // Each selector is resolved relative to a matched item element.
  "fields": {
    "id":          { "selector": "[itemprop='url'] b" },
    "title":       { "selector": "[itemprop='name']" },
    "description": { "selector": "[itemprop='description']" },
    "price":       { "selector": "[itemprop='price']", "attr": "content" }
  }
}
```

### Rules

- `item` and every `fields.*.selector` MUST be a valid CSS selector.
- `fields` MUST contain exactly the keys `id`, `title`, `description`,
  `price`; unknown keys are rejected at startup (invalid config → exit 1).
- `attr` is optional. Present → read that attribute's value; absent →
  trimmed text content of the first matched element.
- Selectors may target any HTML structure — element types, classes,
  attributes (including schema.org microdata like `itemprop`). They must
  never encode site identity (no URL matching, no site-specific logic).

### Worked example (against the attached example document)

| Field | Selector | First-row match | Output |
|-------|----------|-----------------|--------|
| id | `[itemprop='url'] b` | `<b>5520</b>` | `"5520"` |
| title | `[itemprop='name']` | `ПЛР РНК до коронавірусу SARS-CoV-2 (COVID-19), якісне визначення` | trimmed text |
| description | `[itemprop='description']` | `Діагностичний маркер інфікування COVID-19` | trimmed text |
| price | `[itemprop='price']` `attr: content` | `<meta itemprop="price" content="630">` | `630` (integer) |

The document contains exactly **6** item elements
(`tr.page-analize__table_tr`), so the default config yields **6 entries**
(SC-001).

## 2. Output file (`--output`, default `catalog.json`)

A JSON array of entries in the application's catalog format (FR-007):

```json
[
  {
    "id": "5520",
    "title": "ПЛР РНК до коронавірусу SARS-CoV-2 (COVID-19), якісне визначення",
    "description": "Діагностичний маркер інфікування COVID-19",
    "price": 630
  },
  {
    "id": "5521",
    "title": "Антитіла IgМ до SARS CoV-2 (COVID-19)",
    "description": "Серологічний маркер поточного інфікування COVID-19",
    "price": 560
  }
]
```

### Rules

- Pretty-printed (`JSON.stringify(entries, null, 2)`).
- `price` is a JSON number ≥ 0 (normalization rules in
  [data-model.md](../data-model.md)); `null` when the page has no price.
- One entry per matched item, in document order; repeated names kept as
  separate entries (FR-010).
- All four fields are optional: a missing/empty field is emitted as `''`
  (id/title/description) or `null` (price) rather than dropping the entry,
  so rows lacking, e.g., a description still land in the catalog.
- When a page shows a discounted price alongside the regular one (schema.org
  `lowPrice`), the config must target `itemprop="price"` — the regular
  price — so the discount is ignored (worked example below).
- The file is written only if at least one entry was extracted; an item
  selector that matches nothing yields "no test data found" (exit 2).
- The file is compatible with the application's catalog
  (`src/data/laboratory-tests.json`): same field names and types (price may
  be `null` when the source page omits it) — it can be loaded as the catalog
  directly (SC-003).

## 3. Default config file

`scripts/scraper/selectors.json` ships with the worked-example selectors
above (schema.org microdata structure). Developers override it with
`--selectors <path>` for other page structures (FR-012).
