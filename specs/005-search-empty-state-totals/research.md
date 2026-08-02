# Research: Search Empty State & Section Totals

Phase 0 output. All technical unknowns were resolved during specification
(the two clarification questions, both answered "B") and by the constitution
(frontend-only, stack parity with YuBil/set-ops, minimal dependencies); the
numeric-rule decision below was verified empirically against the real
1,937-entry catalog before being committed to the spec.

## 1. Numeric Query Token Rule

- **Decision**: Purely numeric query tokens (regex `^\d+$`) match catalog
  tokens exactly or by prefix only; the edit-distance ≤ 1 fuzzy rule does not
  apply to them. Tokens mixing letters and digits (e.g. "D2", "M50") keep the
  existing fuzzy behavior.
- **Rationale**: The user observed that typing "1001" returned 15 unrelated
  tests (anti-MAG "1081", GM1 "1091", "S-100", "1003", "1020", …) — all
  within edit distance 1 of "1001" — while the test whose ID actually is
  "1001" was absent from the results (IDs are not searchable, per ratified
  feature 001). Restricting numeric tokens to exact/prefix matching removes
  the noise while keeping legitimate numeric lookups working (e.g. "25"
  prefix-matches "25-OH", "25-дигідроксихолекальцитріол", "25 генів").
- **Verified behavior** (simulated against the real algorithm + catalog):
  - `"1001"` → 0 results (empty table), down from 15.
  - `"25"` → 12 results, top = "Вітамін D загальний (25-OH)(D2+D3)".
  - `"D2"` → 4 results (fuzzy behavior preserved for mixed tokens).
  - `"цукор"` → 0 (unchanged; synonym matching is out of scope).
- **Alternatives considered**:
  - Enable ID search (exact/prefix match against `id`): useful, but reverses
    the ratified 001 decision ("ID presentational only") and expands scope —
    rejected by the user (Q2 → option B).
  - Leave behavior as-is: keeps confusing noise matches — rejected.
  - Block edit distance for ALL tokens containing digits: too broad, would
    break legitimate mixed-token fuzzy matching ("D2" → "D3") — rejected.

## 2. Empty Table (No-Match State Only)

- **Decision**: The empty state of the Search result area renders an empty
  `<table>` — a header row of column labels matching the row fields (Назва,
  Опис, Ціна, Кількість, Дія) and one full-width row (colSpan) with the text
  "Нічого не знайдено". Populated results keep the current `<ul>` row list
  (clarification Q1 → option B; FR-001, FR-011).
- **Rationale**: The user asked for "empty table with text"; a structured
  empty state keeps the area visually stable while editing the query. The
  populated list is not converted to a table to avoid a layout change at
  mobile widths and to keep the change minimal.
- **Alternatives considered**:
  - Always-rendered table (option A): consistent structure but changes the
    look of all results and needs column handling at ~320 px — rejected by
    the user.
  - Keep the plain `<p>` message: already implemented, but the user explicitly
    asked for an empty table — rejected.

## 3. Section Counters

- **Decision**: Two small counters rendered next to the section titles in
  `App.tsx`: `Пошук і результати (N)` with N = `results.length`, and
  `Обрані дослідження (N)` with N = `lines.length`. Both are derived values
  from existing state — no new state, no new hook, no service changes
  (FR-003…FR-006).
- **Rationale**: The "current result-set" is exactly the array each section
  already renders; deriving the count from it guarantees the counters can
  never desync from the visible rows (FR-006, US4).
- **Alternatives considered**:
  - Track counts in `useSearch`/`useSelection` state: redundant — the arrays
    are already the source of truth — rejected.
  - Sum of amounts for the Selected counter: the spec explicitly counts
    distinct selected items, not quantities (assumption) — rejected.

## 4. Empty-State Text

- **Decision**: Exactly "Нічого не знайдено" (no hint sentence) inside the
  empty table (FR-007; spec assumption).
- **Rationale**: The user requested the text "nothing found" in Ukrainian;
  the app already uses this exact phrase, so no translation decision is
  needed. The longer current message ("…Спробуйте інший пошуковий запит.")
  is dropped to match the specified phrase exactly.

## 5. Dependencies & Storage

- **Decision**: Zero new dependencies; no storage or data changes; no config
  changes (constitution II/III; FR-009).
- **Rationale**: All changes are presentational or confined to the existing
  pure search service.
