# UI Contract: Laboratory Test Search & Selection

The user-facing interface of the application. Behavioral requirements map to
the feature spec (`../spec.md`); component responsibilities map to the
project structure in [plan.md](../plan.md).

## Layout

Two vertically stacked sections on one page:

1. **Search & Result Set** — search input on top; scrollable result list below.
2. **Selected Items + Summary** — scrollable selected-items list; summary
   (total cost) below it.

## Controls

| Control | Location | Behavior | Spec ref |
|---------|----------|----------|----------|
| Search input | Section 1, top | Filters the catalog by fuzzy match; empty query shows the full catalog (browse mode) | FR-001, FR-002, FR-005 |
| Add button | Every result row | Adds the stepper amount (N) of that test to the selection; if already selected, increments its amount by N | FR-003, FR-007 |
| Amount stepper (− N +) | Every row, both sections | Section 1: sets the amount to add (min 1); Section 2: adjusts the selected amount by ±1, never below 1 | FR-016, FR-017 |
| Delete button | Every selected row | Removes that item from the selection entirely, regardless of its amount | FR-008, FR-009 |
| Summary | Section 2, bottom | Shows total cost = Σ(price × amount), formatted in UAH | FR-010, FR-015 |

## Behavior Rules

- Empty query → all catalog items are shown (browse mode).
- No match → a clear "no results" message replaces the list.
- Amounts never go below 1 in Section 2; "Delete" is the only way to remove.
- The total updates immediately after every add, delete, or amount change —
  no page refresh (FR-011).
- Fresh load → empty selection and a total of 0,00 ₴ (FR-013, FR-014).
- Page reload → selection resets; catalog remains available (assumption).
- Currency formatting: UAH, two decimals, via `Intl.NumberFormat` with the
  `uk-UA` locale (e.g., "320,00 ₴").
