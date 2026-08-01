# Data Model: Ukrainian UI Localization

No structural data-model change: the entities, fields, and relationships from
feature 001 are untouched. This feature changes **values only**. See
[contracts/data-contract.md](./contracts/data-contract.md) for the concrete
seed data and [research.md](./research.md) §3 for the translation table.

## Laboratory Test

| Field | Type | Change | Rule |
|-------|------|--------|------|
| `id` | string | **unchanged** | Unique, stable canonical key; MUST NOT change (selection service and `selection.test.ts` depend on `t-001`…`t-010`) |
| `price` | integer (UAH) | **unchanged** | MUST NOT change (total-cost math and `selection.test.ts` depend on prices) |
| `title` | string | **value → Ukrainian** | Non-empty, natural Ukrainian (research.md §3) |
| `description` | string | **value → Ukrainian** | Natural Ukrainian (research.md §3); search matches against it, so it must keep the informative wording |

Validation rules inherited from 001 (unchanged): non-empty `title`, integer
`price >= 0`, unique `id`.

## Selection

Unchanged in every respect: map of `testId → amount`, derived lines and
total via the selection service. Localization has no effect on it.

## State Transitions

None — this feature introduces no new states. The only observable changes are
the rendered values of existing UI strings and catalog fields.
