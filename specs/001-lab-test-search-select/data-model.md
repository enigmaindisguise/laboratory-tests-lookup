# Data Model: Laboratory Test Search & Selection

Phase 1 output. Entities and rules derived from the feature spec
(`spec.md`), the clarifications session (2026-08-01), and the user's data
requirement (`id`, `price`, `title`, `description`).

## Entities

### LaboratoryTest

The catalog entry a user can search for and select.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | string | REQUIRED, stable | Canonical identifier of the test; displayed to the user as `ID – Title` on every row (FR-019) |
| price | integer (number) | REQUIRED, ≥ 0 | Price of the test in UAH |
| title | string | REQUIRED, non-empty | Name of the test (displayed in both sections) |
| description | string | REQUIRED | Free-text description; matched by fuzzy search together with title |

- The catalog is a fixed array of `LaboratoryTest` objects embedded in the
  application (`src/data/laboratory-tests.json`). No persistence, no server
  (constitution I; FR-012).
- **Identity rule**: `id` is the canonical key — a test is unique by `id`.
  ⚠️ The production dataset currently repeats some IDs (e.g. `7117` across
  microbiology sample-site variants); rows are distinguished by title, and the
  selection model keys by ID as specified. No deduplication was performed
  (out of scope for the presentational modification; see research.md §7).
- **Extensibility**: the file format is a plain JSON array; future catalog
  extensions only add entries (or, later, fields) without reworking the
  consumers.

### SelectionLine (runtime, derived)

One selected test with its quantity. Not stored — derived from user actions.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| testId | string | REQUIRED, references LaboratoryTest.id | Which test is selected |
| amount | integer | REQUIRED, ≥ 1 | How many of this test are selected |

- The selection is a map `testId → amount`; a test appears at most once
  (clarification Q2).
- Display fields (title, price) are joined from the catalog via `testId`.

## State Transitions

| Action | Transition |
|--------|------------|
| Click "Add" in section 1 (stepper shows N) | `amount[testId] += N` (entry created with N if absent) |
| Click up arrow in section 2 | `amount[testId] += 1` |
| Click down arrow in section 2 | `amount[testId] -= 1`; MUST NOT go below 1 |
| Click "Delete" in section 2 | entry for `testId` removed entirely (regardless of amount) |
| Page reload | selection resets to empty (no persistence, documented assumption) |

## Validation Rules

- `price` MUST be an integer ≥ 0 (FR-010 relies on it for the sum).
- `amount` MUST be an integer ≥ 1; 0 is never a valid selection amount — the
  down arrow stops at 1 and "Delete" is the only removal path (FR-017).
- `id` MUST be present and stable; uniqueness is the stated rule, with known
  production-data exceptions documented under the Identity rule.

## Derived Values

- **Total cost** = Σ over selection of (`price × amount`), formatted in UAH
  (FR-010, FR-015, SC-003).
- **Search results** = catalog filtered by fuzzy match on title + description,
  scored and ordered by relevance (FR-002); empty query → full catalog
  (FR-005).
