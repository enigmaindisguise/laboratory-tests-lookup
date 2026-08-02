# Quickstart: Search Empty State & Section Totals

Validation guide for feature `005-search-empty-state-totals`. Run the
scenarios below against a local dev server (`npm run dev`) after
implementation. All expected outcomes map to the feature spec
([spec.md](./spec.md)) and the [UI contract](./contracts/ui-contract.md).

## Prerequisites

- Repository root with `npm install` completed (dev deps included).
- Quality gates green before starting: `npm test -- --run`, `npm run lint`,
  `npm run build`.

## Scenario 1 — No-Match Query Shows an Empty Table

1. Open the app, type `ззззз` (a query matching nothing).
2. **Expected**: the Search result area renders an empty table — header row
   (Назва / Опис / Ціна / Кількість / Дія) and a full-width row with the
   text "Нічого не знайдено"; no data rows. The Search counter shows 0.
   (FR-001, FR-007; SC-001)

## Scenario 2 — Browse Mode Still Shows the Full Catalog

1. Clear the search box entirely (empty query).
2. **Expected**: the full catalog is shown in browse mode; the empty table is
   not shown; the Search counter equals the catalog size (1,937). (FR-002,
   FR-003; SC-002)

## Scenario 3 — Numeric Queries Return Exact/Prefix Matches Only

1. Type `1001`.
2. **Expected**: empty table with "Нічого не знайдено" and counter 0 — no
   tests containing "1081", "1091", "S-100", etc. (FR-010, SC-007)
3. Type `25`.
4. **Expected**: matches appear, including "Вітамін D загальний
   (25-OH)(D2+D3)". (FR-010; US3 acceptance 3)
5. Type `D2`.
6. **Expected**: matches still appear (mixed alphanumeric tokens keep fuzzy
   behavior). (US3 acceptance 4)

## Scenario 4 — Section Counters Track the Visible Lists

1. With an empty query, note the Search counter (1,937).
2. Type `глюкоза` → the Search counter equals the number of matches shown;
   "Глюкоза" (8013) is the top row.
3. Click "Додати" on 2 different tests → the Selected Items counter shows 2.
4. Click "Додати" again on an already-selected test → the Selected counter
   stays 2 (row count, not quantity); the amount incremented.
5. Delete one selected item → the Selected counter drops to 1; the total cost
   updates immediately.
6. After every action, compare each counter with the rows actually rendered —
   they must always match, with no page reload. (FR-003…FR-006; SC-002,
   SC-003, SC-004; US4)

## Scenario 5 — Match ↔ No-Match Transitions

1. With `ззззз` showing the empty table, edit the query to `глюкоза`.
2. **Expected**: the empty table is replaced by the matching rows in their
   usual presentation; the counter updates.
3. Change the query back to `ззззз`.
4. **Expected**: rows replaced by the empty table; counter drops to 0.
   (US1 acceptance 2, 4)

## Scenario 6 — Mobile Layout (~320 px)

1. Resize the viewport to ~320 px wide.
2. **Expected**: both counters fully visible; no horizontal page overflow;
   lists keep their internal scrolling; the empty table's message row is
   readable. (FR-008; SC-005)

## Scenario 7 — Regression Check

1. Repeat the core flow: search in Ukrainian, add three tests, read the total
   cost in UAH.
2. **Expected**: identical to pre-feature behavior — same matches for
   non-numeric queries, same totals, immediate updates. (FR-009; SC-006)

## Automated Verification

```bash
npm test -- --run     # all service tests incl. new numeric-rule cases
npm run lint          # zero errors
npm run build         # tsc -b && vite build succeeds
```
