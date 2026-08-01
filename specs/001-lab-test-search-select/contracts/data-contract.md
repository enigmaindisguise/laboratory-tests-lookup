# Data Contract: Laboratory Test Catalog

The application's only data interface is the embedded catalog file
(`src/data/laboratory-tests.json`). This contract defines its shape and the
seed data. See [data-model.md](../data-model.md) for entity rules.

## Schema

A JSON array of objects:

```json
[
  {
    "id": "string (unique, stable)",
    "price": "integer >= 0 (UAH)",
    "title": "string (non-empty)",
    "description": "string"
  }
]
```

- `id` is the canonical key; consumers MUST NOT assume array order stability
  beyond what the file provides.
- `price` is an integer amount in UAH (per clarification Q3).
- Future catalog extensions add entries to the array (and may add optional
  fields) without changing this contract's required fields.

## Production Catalog

`src/data/laboratory-tests.json` holds the production dataset: **1,937 entries
(1,669 unique IDs)** of real laboratory tests and services with Ukrainian
titles, e.g.:

```json
[
  {
    "id": "8013",
    "price": 225,
    "title": "Глюкоза",
    "description": "Маркер порушень вуглеводного обміну"
  },
  {
    "id": "8032",
    "price": 205,
    "title": "Холестерин загальний",
    "description": "Маркер порушень ліпідного обміну"
  }
]
```

- The spec's canonical search example ("blood sugar" → "Test for levels of
  sugar in blood") refers to the original 10-entry fixture, which was removed
  when the production catalog landed. The real-catalog analogue used by the
  tests and quickstart is `глюкоза` → `8013` (Глюкоза).
- ⚠️ Some IDs repeat in the source data (e.g. `7117` across microbiology
  sample-site variants); rows are distinguished by title. Consumers key by
  `id` per data-model.md.
