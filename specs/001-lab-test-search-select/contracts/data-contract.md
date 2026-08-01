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

## Seed Data (10 dummy entries)

```json
[
  {
    "id": "t-001",
    "price": 150,
    "title": "Glucose (blood sugar)",
    "description": "Test for levels of sugar in blood"
  },
  {
    "id": "t-002",
    "price": 320,
    "title": "Complete Blood Count",
    "description": "Measures red blood cells, white blood cells and platelets"
  },
  {
    "id": "t-003",
    "price": 280,
    "title": "Cholesterol Panel",
    "description": "Total, LDL and HDL cholesterol levels"
  },
  {
    "id": "t-004",
    "price": 190,
    "title": "Thyroid-Stimulating Hormone",
    "description": "Checks thyroid gland function"
  },
  {
    "id": "t-005",
    "price": 240,
    "title": "Vitamin D",
    "description": "Levels of vitamin D in the blood"
  },
  {
    "id": "t-006",
    "price": 210,
    "title": "Iron Studies",
    "description": "Serum iron, ferritin and transferrin saturation"
  },
  {
    "id": "t-007",
    "price": 120,
    "title": "Urinalysis",
    "description": "Physical, chemical and microscopic examination of urine"
  },
  {
    "id": "t-008",
    "price": 160,
    "title": "C-Reactive Protein",
    "description": "Measures the inflammation marker CRP"
  },
  {
    "id": "t-009",
    "price": 260,
    "title": "Liver Function Test",
    "description": "ALT, AST and bilirubin enzyme panel"
  },
  {
    "id": "t-010",
    "price": 200,
    "title": "HbA1c",
    "description": "Average blood sugar level over the past three months"
  }
]
```

Note: `t-001` (and `t-010`) intentionally contain the words of the spec's
canonical example — the query "blood sugar" MUST return `t-001` among the
matches (SC-001).
