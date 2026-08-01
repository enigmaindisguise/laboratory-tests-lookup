# UI Contract: Ukrainian Interface

The user-facing interface of the application. Behavioral requirements map to
the feature spec (`../spec.md`); component responsibilities map to the
project structure in [plan.md](../plan.md). Layout and behavior are
**unchanged from feature 001**; all user-visible strings are now Ukrainian.
The exact target strings are normative in [research.md](../research.md) §2.

## Document Level

- The page declares `lang="uk"` (FR-002).
- The document `<title>` is `Лабораторні дослідження` (FR-001).

## Layout

Two vertically stacked sections on one page (unchanged):

1. **Пошук і результати** — search input on top; scrollable result list below.
2. **Обрані дослідження + підсумок** — scrollable selected-items list;
   summary (total cost) below it.

## Controls

| Control | Location | Label (uk) | Behavior | Spec ref |
|---------|----------|------------|----------|----------|
| Search input | Section 1, top | placeholder `Пошук лабораторних досліджень…`; aria-label `Пошук лабораторних досліджень` | Filters the catalog by fuzzy match; empty query shows the full catalog (browse mode) | FR-001, FR-002, FR-005, FR-003 |
| Add button | Every result row | `Додати` | Adds the stepper amount (N) of that test to the selection; if already selected, increments its amount by N | FR-003, FR-007 |
| Amount stepper (− N +) | Every row, both sections | aria-labels `Зменшити кількість` / `Збільшити кількість` | Section 1: sets the amount to add (min 1); Section 2: adjusts the selected amount by ±1, never below 1 | FR-016, FR-017, FR-003 |
| Delete button | Every selected row | `Видалити` | Removes that item from the selection entirely, regardless of its amount | FR-008, FR-009 |
| Summary | Section 2, bottom | `Загальна вартість` | Shows total cost = Σ(price × amount), formatted in UAH | FR-010, FR-015 |

## Messages

| State | Text (uk) |
|-------|-----------|
| Empty result list (no match) | `Нічого не знайдено. Спробуйте інший пошуковий запит.` |
| Empty selected-items list | `Поки нічого не обрано.` |

## Behavior Rules (unchanged from 001)

- Empty query → all catalog items are shown (browse mode).
- No match → the Ukrainian "no results" message replaces the list (FR-006).
- Amounts never go below 1 in Section 2; "Delete" is the only way to remove.
- The total updates immediately after every add, delete, or amount change —
  no page refresh (FR-011).
- Fresh load → empty selection and a total of `0,00 ₴` (FR-013, FR-014).
- Page reload → selection resets; catalog remains available (assumption).
- Currency formatting: UAH, two decimals, via `Intl.NumberFormat` with the
  `uk-UA` locale (e.g., `320,00 ₴`) — unchanged (FR-008).
- **No English UI text** may be visible in any state (FR-009); English may
  remain only in code, comments, file names, and test code (user requirement).
