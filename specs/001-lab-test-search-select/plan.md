# Implementation Plan: Laboratory Test Search & Selection

**Branch**: `001-lab-test-search-select` | **Date**: 2026-08-01 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-lab-test-search-select/spec.md`

## Summary

Build a lightweight, frontend-only web application that lets a user fuzzy-search
a hardcoded catalog of laboratory tests, build a selection with per-test
amounts (up/down steppers in both sections), and see a live total cost in UAH.
The stack mirrors YuBil/set-ops exactly (React 19 + TypeScript ~6 + Vite 8 +
Tailwind CSS v4 + Vitest 4 + ESLint 10 flat config, same scripts and
configuration) with zero new dependencies. All logic lives in small, pure
services (`search`, `selection`, `format`) with colocated Vitest tests; UI is
small single-responsibility components sharing one `AmountStepper` component.
Data is an embedded JSON array of 10 seeded laboratory tests (see
[contracts/data-contract.md](./contracts/data-contract.md)).

## Technical Context

**Language/Version**: TypeScript ~6.0 (strict, bundler mode, `tsc -b` build), React 19

**Primary Dependencies**: react, react-dom, tailwindcss (+ @tailwindcss/vite), vite, @vitejs/plugin-react — runtime/build; eslint, typescript-eslint, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, vitest, @types/* — dev. Identical set to YuBil/set-ops.

**Storage**: Embedded JSON catalog at `src/data/laboratory-tests.json` (no external storage; FE-only per constitution I). One-line `resolveJsonModule: true` addition to `tsconfig.app.json` — see Constitution Check.

**Testing**: Vitest 4 — colocated `*.test.ts` unit tests for pure services; `npm test` (watch) / `npm test -- --run` (CI). No component-testing libraries (not in set-ops dependency set).

**Target Platform**: Modern evergreen browsers (desktop + mobile); static hosting via GitHub Pages (mirrors set-ops deploy workflow).

**Project Type**: Frontend-only web application (SPA)

**Performance Goals**: Instant search results and total updates for catalogs of tens to low hundreds of items; "immediate" per SC-004 (no measurable latency budget needed).

**Constraints**: No backend; no new libraries beyond the set-ops set; offline-capable (SC-006); small files with single responsibility; internal scroll in the result list; UAH currency formatting.

**Scale/Scope**: Single user, session-only selection (no persistence); catalog starts at 10 entries, extensible to low hundreds.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Gate | Result | Notes |
|------|--------|-------|
| I. Lightweight Frontend-Only | ✅ PASS | Static SPA; embedded data; no server, DB, or API |
| II. Stack Parity with Set-Ops (NON-NEGOTIABLE) | ✅ PASS | Same libraries, scripts, and config files as set-ops. One justified deviation: `resolveJsonModule: true` in `tsconfig.app.json` (one line, standard TS flag) required to import the user-mandated JSON data file; no new dependency, no script change |
| III. Minimal Dependency Footprint | ✅ PASS | Zero new dependencies added or proposed |
| IV. Tested Pure Logic | ✅ PASS | Search/selection/format are pure services with colocated Vitest tests |
| V. Type Safety and Lint Gates | ✅ PASS | Strict tsconfig preserved; ESLint flat config with zero errors in CI |
| Governance (PR compliance review, justification of complexity) | ✅ PASS | No unjustified complexity introduced |

Post-design re-check: unchanged — PASS. The `resolveJsonModule` flag is a
PATCH-level configuration clarification, not a principle change; it is the
only difference from the set-ops configuration and is documented here and in
`research.md` §3.

## Project Structure

### Documentation (this feature)

```text
specs/001-lab-test-search-select/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output — decisions & rationale
├── data-model.md        # Phase 1 output — entities & state transitions
├── quickstart.md        # Phase 1 output — validation guide
├── contracts/           # Phase 1 output — data + UI contracts
│   ├── data-contract.md
│   └── ui-contract.md
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── AmountStepper.tsx        # SHARED: up/down arrows for amount (both sections)
│   ├── SearchBar.tsx            # search input (section 1)
│   ├── TestResultList.tsx       # section 1: result rows (Add + AmountStepper)
│   ├── SelectedItemsList.tsx    # section 2: selected rows (Delete + AmountStepper)
│   └── SummaryPanel.tsx         # section 2: total cost in UAH
├── data/
│   └── laboratory-tests.json    # 10 seeded entries (see contracts/data-contract.md)
├── hooks/
│   ├── useSearch.ts             # query state → fuzzy-filtered results
│   └── useSelection.ts          # selection map → lines, total (derived)
├── services/
│   ├── search.ts                # pure fuzzy matcher
│   ├── search.test.ts
│   ├── selection.ts             # pure selection ops (add/increment/decrement/remove/total)
│   ├── selection.test.ts
│   ├── format.ts                # pure UAH formatting
│   └── format.test.ts
├── types/
│   └── laboratory-test.ts       # LaboratoryTest, SelectionLine types
├── App.tsx                      # layout: two stacked sections
├── main.tsx
└── index.css                    # Tailwind v4 entry
```

Root configuration mirrors set-ops exactly: `vite.config.ts` (react +
tailwindcss plugins, `base` for GH Pages), `tsconfig.json` (project refs),
`tsconfig.app.json` (+ `resolveJsonModule`), `tsconfig.node.json`,
`eslint.config.js` (flat), `index.html`, `.github/workflows/deploy.yml`
(GH Pages via peaceiris, Node 20, `npm ci`).

**Structure Decision**: Single frontend project mirroring the set-ops layout
(`src/components`, `src/hooks`, `src/services`, `src/types`) plus `src/data/`
for the user-mandated JSON catalog. Tests colocated with services per
constitution IV. Option 1 (single project) selected; the backend/mobile
options do not apply to a FE-only app.

## Complexity Tracking

No constitution violations — this table is intentionally empty (see
Constitution Check above; all gates pass).
