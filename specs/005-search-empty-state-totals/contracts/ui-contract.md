# UI Contract: Search Empty State & Section Totals

The user-facing interface of the application as modified by this feature.
Behavioral requirements map to the feature spec (`../spec.md`); component
responsibilities map to the project structure in [plan.md](../plan.md). The
base layout, controls, and currency rules from feature 001's
[ui-contract](../../001-lab-test-search-select/contracts/ui-contract.md)
remain in force and are not repeated here.

## Section Titles with Counters

Both section titles gain a compact counter showing the number of items in
that section's current result set (FR-003…FR-006):

| Section | Title (Ukrainian) | Counter value | Spec ref |
|---------|-------------------|---------------|----------|
| 1 — Search & Result Set | Пошук і результати | Number of tests currently displayed: full catalog (browse mode) or matches (query mode); 0 in the no-match state | FR-003, FR-006 |
| 2 — Selected Items + Summary | Обрані дослідження | Number of distinct selected tests (rows), not the sum of amounts; 0 when nothing selected | FR-004, FR-006 |

- The counter is displayed adjacent to the title (compact badge/parenthesized
  number; exact visual style is an implementation detail per the spec
  assumption).
- Counters update immediately after every query change, add, delete, and
  amount-change action, without a page reload (FR-005), and always equal the
  number of rows rendered in the section (FR-006, US4).

## Empty Table (No-Match State)

When a non-empty query matches no catalog item, the Search result area renders
an empty table instead of a plain text line (FR-001, FR-011):

- A header row with column labels matching the row fields: Назва, Опис,
  Ціна, Кількість, Дія.
- No data rows; a single full-width row shows the Ukrainian text "Нічого не
  знайдено" (FR-001, FR-007).
- The empty table appears ONLY for a non-empty query with zero matches; an
  empty/whitespace-only query continues to show the full catalog in browse
  mode (FR-002).
- When a query matches items, the rows keep their current presentation — the
  empty-table structure is not used for populated results (FR-011).
- The Selected Items section keeps its existing empty-state message ("Поки
  нічого не обрано.") and gains only the counter (spec assumption).

## Search Behavior: Numeric Tokens

Search matching changes ONLY for purely numeric query tokens (FR-009,
FR-010):

- A query token consisting only of digits matches a catalog token exactly or
  as a prefix of a longer number; resemblance (edit distance) matches are not
  returned. E.g. "1001" → 0 results (empty table), never "1081"/"1091"/
  "S-100" items.
- Tokens mixing letters and digits ("D2", "M50") keep the existing fuzzy
  behavior.
- IDs remain presentational only and are not searchable (ratified feature
  001; spec assumption).

## Behavior Rules (this feature)

- "1001" (or any non-empty query matching nothing) → empty table with "Нічого
  не знайдено"; Search counter 0.
- Empty query → full catalog; Search counter = 1,937.
- Adding an already-selected test increments its amount but does not change
  the Selected counter (row count, not quantity).
- Deleting the last selected item → Selected counter 0 + existing empty-state
  message.
- At ~320 px: counters visible, no horizontal page overflow, existing
  internal list scrolling preserved (FR-008).
