# Research: Laboratory Test Search & Selection

Phase 0 output. All technical unknowns are resolved by the constitution
(frontend-only, stack parity with YuBil/set-ops, minimal dependencies) and the
user's plan constraints; no open clarifications remain.

## 1. Fuzzy Search Algorithm

- **Decision**: Implement a lightweight token-overlap fuzzy matcher in a pure
  service (`src/services/search.ts`) with zero external libraries.
- **Rationale**: The constitution (principle III) and the user forbid new
  dependencies beyond the set-ops stack. The catalog is small (tens to low
  hundreds of items), so a simple algorithm is instant and sufficient:
  normalize text (lowercase, strip punctuation), tokenize the query and each
  item's title + description, score items by the fraction of query tokens
  contained in the item's token set, tolerate prefix matches and small typos
  (edit distance ≤ 1), and sort by score (ties keep catalog order). Example:
  "blood sugar" → both tokens are contained in "Test for levels of sugar in
  blood" → top match (satisfies SC-001).
- **Alternatives considered**:
  - fuzzysort / Fuse.js / minisearch: mature, but new dependencies —
    rejected (constitution III, user constraint).
  - Exact substring matching: too strict — fails the "blood sugar" example —
    rejected.
  - Server-side search: impossible — the app is frontend-only (constitution I)
    — rejected.

## 2. State Management

- **Decision**: React built-ins only — `useState` for the query and the
  selection map, `useMemo` for derived values (filtered results, total cost),
  wrapped in two small hooks (`useSearch`, `useSelection`).
- **Rationale**: The app holds exactly two pieces of state (query, selection)
  and simple derived values. A state library would violate the minimal
  dependency principle with no benefit.
- **Alternatives considered**: Zustand/Redux (new deps, overkill), useReducer
  (unnecessary complexity at this scale) — both rejected.

## 3. Catalog Data Format

- **Decision**: A real JSON data file `src/data/laboratory-tests.json`
  containing an array of objects `{ id, price, title, description }`, imported
  with TypeScript's standard `resolveJsonModule` flag (one-line addition to
  `tsconfig.app.json`). Ten dummy entries are defined in the data contract.
- **Rationale**: The user explicitly requires a JSON data file that will be
  extended in the future. Vite imports JSON natively; `resolveJsonModule` is
  the standard TypeScript mechanism and adds no dependency. The one-line
  tsconfig change is a justified, PATCH-level deviation from the set-ops
  configuration (same libraries, same scripts, same config files otherwise).
- **Alternatives considered**:
  - A `.ts` module exporting a typed array: no config change, but not a JSON
    file — rejected per the explicit user requirement.
  - JSON via `?raw` + `JSON.parse`: no tsconfig change, but loses static
    typing — rejected.

## 4. Currency Formatting

- **Decision**: Browser built-in `Intl.NumberFormat` with locale `uk-UA` and
  currency `UAH`, exposed through a tiny pure service
  (`src/services/format.ts`).
- **Rationale**: Zero dependencies, correct UAH output (e.g., "320,00 ₴"),
  trivially unit-testable (FR-015).
- **Alternatives considered**: manual string formatting (error-prone),
  currency library (new dependency) — both rejected.

## 5. Component Strategy

- **Decision**: Small, single-responsibility components. One shared component,
  `AmountStepper` (up/down arrows), is reused by both sections; section
  components (`TestResultList`, `SelectedItemsList`) compose it. Hooks stay
  thin — all logic lives in pure services.
- **Rationale**: User requirement ("shared components, small files,
  single-responsibility") plus constitution IV (pure logic in services).
- **Alternatives considered**: one monolithic section component (rejected:
  duplicated stepper logic), a generic ItemRow abstraction for both sections
  (rejected: the sections have different actions — composition wins).

## 6. Testing Strategy

- **Decision**: Colocated Vitest unit tests (`*.test.ts`) for the pure
  services (search, selection, format), mirroring set-ops
  (`src/services/setOperations.test.ts`). UI behavior is validated via the
  quickstart manual scenarios.
- **Rationale**: Constitution IV requires tested pure logic; set-ops parity
  means no component-testing library (e.g., @testing-library/react is not in
  the set-ops dependency set, and the user forbids new libraries).
- **Alternatives considered**: @testing-library/react / Playwright — new
  dependencies — rejected.

## 7. Modification (2026-08-01): Show IDs in UI + Test Realignment

- **Decision**: (a) Every item row in both sections displays the test's ID
  followed by an en dash and its title (`ID – Title`, e.g. `8013 – Глюкоза`),
  per FR-019. (b) Service tests were updated to assert against the production
  catalog instead of the removed 10-item fixture (`t-001`…`t-010`).
- **Rationale**:
  - The ID is already a required field of every catalog entry (data-model.md),
    so the change is purely presentational — no data or logic changes, no new
    dependencies (FR-020; constitution III/IV unaffected).
  - The `prod data ready` commit (897a5fe) replaced the fixture catalog with
    the real dataset (1,937 entries), which made 7 assertions stale: the old
    fixtures `t-001` (150 ₴), `t-002` (320 ₴), `t-003`, `t-008` no longer
    exist. Tests now assert against verified real entries: `глюкоза` → top
    `8013` (Глюкоза, 225 ₴), `холестерин загальний` / `холесте` → `8032`
    (Холестерин загальний, 205 ₴), `запалення` (description match) → `8025`
    (C-реактивний білок), `аналіз крові` → `9028` (Загальний аналіз крові).
  - The spec's canonical example ("blood sugar" → "Test for levels of sugar in
    blood") has no literal equivalent in the production catalog; the closest
    real match is `глюкоза` → `8013`, used as the test analogue.
- **Alternatives considered**: keeping fixture-only assertions decoupled from
  the real catalog (rejected: tests must prove behavior on the shipped data);
  adding synthetic entries to the production JSON (rejected: data is
  user-owned production data).
- **Caveat**: the production dataset contains duplicate IDs (1,669 unique IDs
  across 1,937 entries, e.g. `7117` repeated for microbiology variants
  distinguished by title). Displaying `ID – Title` still distinguishes rows by
  title; the selection model keys by ID as specified. No logic change was made
  for duplicates — out of scope for this presentational modification.
