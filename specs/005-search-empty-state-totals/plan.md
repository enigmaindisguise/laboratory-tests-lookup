# Implementation Plan: Search Empty State & Section Totals

**Branch**: `005-search-empty-state-totals` | **Date**: 2026-08-01 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/005-search-empty-state-totals/spec.md`

## Summary

Enhance the existing laboratory-tests-lookup frontend (React 19 + TypeScript +
Vite + Tailwind v4 + Vitest, zero new dependencies, stack parity with
YuBil/set-ops per the constitution) with three user-visible changes:

1. **Empty table** (US1, P1): when a non-empty query matches no catalog item,
   the Search result area renders an empty table — header row visible, no data
   rows — showing the Ukrainian text "Нічого не знайдено". Populated results
   keep the current list-row presentation (clarification Q1 → option B).
2. **Section counters** (US2, P2): each section title gains a counter showing
   the number of items in its current result set — `results.length` for the
   Search section, `lines.length` for Selected Items. Both are derived values,
   no new state.
3. **Numeric query rule** (US3, P2): purely numeric query tokens match exactly
   or by prefix only — the edit-distance ≤ 1 fuzzy rule no longer applies to
   them. Typing "1001" (which appears in no name/description) yields the empty
   table instead of 15 resemblance noise matches (e.g. "1081", "1091",
   "S-100"); tokens mixing letters and digits ("D2", "M50") keep existing
   fuzzy behavior (clarification Q2 → option B).

All logic changes live in the pure `search` service (constitution IV) with
colocated Vitest tests; UI changes are confined to `TestResultList.tsx`
(empty-state table) and `App.tsx` (counters). No new dependencies, no storage
changes (constitution I/III).

## Technical Context

**Language/Version**: TypeScript ~6.0 (strict, bundler mode, `tsc -b` build), React 19

**Primary Dependencies**: react, react-dom, tailwindcss (+ @tailwindcss/vite), vite, @vitejs/plugin-react — runtime/build; eslint, typescript-eslint, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, vitest — dev. Identical set to YuBil/set-ops; **zero new dependencies** (constitution III).

**Storage**: Embedded JSON catalog at `src/data/laboratory-tests.json` — 1,937 real production entries; unchanged by this feature.

**Testing**: Vitest — colocated `*.test.ts` unit tests for pure services (constitution IV). The numeric rule (US3) is tested in `src/services/search.test.ts`. No component-testing libraries (not in the set-ops dependency set).

**Target Platform**: Modern evergreen browsers (desktop + mobile); static hosting via GitHub Pages.

**Project Type**: Frontend-only web application (SPA)

**Performance Goals**: Instant search results for the 1,937-item catalog; counters and empty state update immediately on every keystroke/action (no measurable latency budget needed — derived values over in-memory arrays).

**Constraints**: No backend; no new libraries beyond the set-ops set; UI stays Ukrainian-only; mobile-first layout (down to ~320 px) with no horizontal page overflow; the only permitted search-logic change is the numeric-token rule (FR-009/FR-010).

**Scale/Scope**: Single user, session-only selection; catalog of 1,937 entries; the feature touches exactly three source files (`search.ts`, `TestResultList.tsx`, `App.tsx`) plus `search.test.ts`.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Gate | Result | Notes |
|------|--------|-------|
| I. Lightweight Frontend-Only | ✅ PASS | Static SPA; embedded data; no server, DB, or API — unchanged |
| II. Stack Parity with Set-Ops (NON-NEGOTIABLE) | ✅ PASS | No config or dependency changes; same libraries, scripts, and config as set-ops |
| III. Minimal Dependency Footprint | ✅ PASS | Zero new dependencies added or proposed |
| IV. Tested Pure Logic | ✅ PASS | The numeric matching rule lives in the pure `search` service with colocated Vitest tests (RED-GREEN); UI changes are presentational |
| V. Type Safety and Lint Gates | ✅ PASS | Strict tsconfig preserved; ESLint flat config must stay at zero errors; `npm run build` must pass |
| Governance (PR compliance review, justification of complexity) | ✅ PASS | No unjustified complexity; changes are minimal and single-purpose |

Post-design re-check: unchanged — PASS. The numeric-token restriction is a
behavior change to the pure search service (justified by FR-010 and SC-007)
but introduces no dependency, no config change, and no architectural change;
it is covered by new tests in `search.test.ts`.

## Project Structure

### Documentation (this feature)

```text
specs/005-search-empty-state-totals/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output — decisions & rationale
├── data-model.md        # Phase 1 output — entities & derived values
├── quickstart.md        # Phase 1 output — validation guide
├── contracts/           # Phase 1 output — UI contract
│   └── ui-contract.md
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── AmountStepper.tsx        # SHARED stepper (unchanged)
│   ├── SearchBar.tsx            # search input (unchanged)
│   ├── TestResultList.tsx       # CHANGED: empty state → empty table with "Нічого не знайдено"
│   ├── SelectedItemsList.tsx    # (unchanged)
│   └── SummaryPanel.tsx         # (unchanged)
├── data/
│   └── laboratory-tests.json    # 1,937 entries (unchanged)
├── hooks/
│   ├── useSearch.ts             # (unchanged — results.length feeds the counter)
│   └── useSelection.ts          # (unchanged — lines.length feeds the counter)
├── services/
│   ├── search.ts                # CHANGED: numeric tokens skip edit-distance matching
│   ├── search.test.ts           # CHANGED: + numeric-rule cases (RED first)
│   ├── selection.ts / selection.test.ts   # (unchanged)
│   └── format.ts / format.test.ts         # (unchanged)
├── types/
│   └── laboratory-test.ts       # (unchanged)
├── App.tsx                      # CHANGED: counters next to both section titles
├── main.tsx
└── index.css                    # Tailwind v4 entry
```

**Structure Decision**: Existing single-project layout preserved untouched;
only the three files above change. No new directories, no config changes.

## Complexity Tracking

No constitution violations — this table is intentionally empty (see
Constitution Check above; all gates pass).
