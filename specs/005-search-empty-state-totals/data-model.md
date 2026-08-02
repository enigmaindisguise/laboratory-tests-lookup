# Data Model: Search Empty State & Section Totals

This feature introduces no new persisted entities and changes no existing
ones. It surfaces two derived values that were already computable from the
existing state.

## Entities

### Laboratory Test (unchanged)

A catalog entry representing a test. Attributes: `id` (string, unique per
title — note: the production catalog contains duplicate IDs for some panel
variants, e.g. `7117`, distinguished by title), `price` (number, UAH ≥ 0),
`title` (string), `description` (string). Source: embedded JSON catalog
`src/data/laboratory-tests.json` (1,937 entries). See feature 001
[data-contract](../001-lab-test-search-select/contracts/data-contract.md).

### Result Set (existing concept, newly surfaced)

The collection of tests displayed in the Search section:

- **Browse mode** (empty/whitespace query): all 1,937 catalog items.
- **Query mode** (non-empty query): the tests matching the current query
  (fuzzy token-overlap matcher, with the new numeric-token rule — see
  research.md §1).
- **No-match state**: empty array (drives the empty table and counter 0).

Derived value: `results.length` (feeds the Search counter, FR-003).

### Selection (unchanged)

The user's chosen tests with amounts, one entry per distinct `testId`
(amount ≥ 1). Derived values in `useSelection`: `lines` (rows joined with
catalog entries) and `total` (Σ price × amount). See feature 001
[data-model](../001-lab-test-search-select/data-model.md).

Derived value: `lines.length` (feeds the Selected Items counter, FR-004) —
the number of distinct selected tests, NOT the sum of amounts (spec
assumption; US2 acceptance scenario 5).

## Derived Values Summary

| Value | Derivation | Consumed by |
|-------|-----------|-------------|
| Search counter | `results.length` from `useSearch` | App.tsx, Search section title (FR-003) |
| Selected counter | `lines.length` from `useSelection` | App.tsx, Selected Items section title (FR-004) |
| Empty-table visibility | `results.length === 0` AND query non-empty | TestResultList.tsx (FR-001, FR-002) |

## State Transitions

No new state transitions. Existing transitions (query change, add, delete,
amount change) now additionally refresh the derived counters, which is
automatic because they are recomputed from the same arrays via `useMemo`/
render (FR-005, US4).
