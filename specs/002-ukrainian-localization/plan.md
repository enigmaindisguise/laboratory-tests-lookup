# Implementation Plan: Ukrainian UI Localization

**Branch**: `002-ukrainian-localization` | **Date**: 2026-08-01 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-ukrainian-localization/spec.md`

## Summary

Localize the existing laboratory-tests-lookup app to Ukrainian: every
user-visible UI string (page title, headings, search placeholder, buttons,
empty-state messages, summary label, accessibility labels) and the embedded
catalog seed data (10 test names + descriptions) become Ukrainian, while code,
identifiers, comments, file names, and unit-test code stay English. Zero new
dependencies: no i18n framework, no language switcher — a single Ukrainian
UI. Search, selection, and formatting services are untouched; the only test
change is rewriting the `search.test.ts` query fixtures from English to
Ukrainian (same expected IDs). The full string inventory and catalog
translation tables live in [research.md](./research.md) and are normative for
implementation.

## Technical Context

**Language/Version**: TypeScript ~6.0 (strict, bundler module resolution, `tsc -b`), React 19 — unchanged from 001.

**Primary Dependencies**: Identical set-ops set (react, react-dom, tailwindcss + @tailwindcss/vite, vite, @vitejs/plugin-react — runtime/build; eslint, typescript-eslint, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, vitest, @types/* — dev). **Zero new dependencies**: no i18n/translation library (constitution III).

**Storage**: Embedded JSON catalog at `src/data/laboratory-tests.json` — schema, IDs, and prices unchanged; only `title` and `description` values become Ukrainian (see [contracts/data-contract.md](./contracts/data-contract.md)).

**Testing**: Vitest 4, colocated `*.test.ts` for pure services (constitution IV). `search.test.ts` imports the real catalog and asserts English queries — its query fixtures MUST be rewritten to Ukrainian equivalents that map to the same IDs (table in [research.md](./research.md) §4). `selection.test.ts` and `format.test.ts` are unaffected (prices/formatting unchanged).

**Target Platform**: Modern evergreen browsers (desktop + mobile); static hosting via GitHub Pages.

**Project Type**: Frontend-only web application (SPA) — unchanged.

**Performance Goals**: Unchanged from 001 — instant search results and total updates; no measurable latency budget needed.

**Constraints**: UI text and catalog content only; no English UI text may remain (FR-009); page declares Ukrainian language (FR-002); accessibility labels in Ukrainian (FR-003); layout must stay usable at ~320 px with longer Ukrainian words, no horizontal overflow or clipping (FR-010); code/comments/test code remain English (user requirement); no language switcher (spec assumption); currency formatting untouched (FR-008).

**Scale/Scope**: 12 UI strings across 7 files + 10 catalog entries × 2 fields; single user, single language.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Gate | Result | Notes |
|------|--------|-------|
| I. Lightweight Frontend-Only | ✅ PASS | No architecture change; still a static SPA with embedded data |
| II. Stack Parity with Set-Ops (NON-NEGOTIABLE) | ✅ PASS | No library, script, or config change; only string values in existing files |
| III. Minimal Dependency Footprint | ✅ PASS | Zero new dependencies — in-place Ukrainian literals, no i18n framework |
| IV. Tested Pure Logic | ✅ PASS | Services untouched; search tests updated to match translated catalog fixtures (same behavioral intent) |
| V. Type Safety and Lint Gates | ✅ PASS | Strict tsconfig and ESLint flat config unaffected; gates must stay green |
| Governance (PR compliance review, justification of complexity) | ✅ PASS | Minimal, content-only change; no complexity introduced |

## Project Structure

### Documentation (this feature)

```text
specs/002-ukrainian-localization/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output — translation decisions & normative tables
├── data-model.md        # Phase 1 output — entity & value-change rules
├── quickstart.md        # Phase 1 output — validation guide (Ukrainian scenarios)
├── contracts/           # Phase 1 output — updated data + UI contracts
│   ├── data-contract.md
│   └── ui-contract.md
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

Structure is unchanged from 001; the feature touches only these files:

```text
index.html                          # lang="uk", Ukrainian <title>
src/
├── components/
│   ├── AmountStepper.tsx           # aria-labels → Ukrainian
│   ├── SearchBar.tsx               # placeholder + aria-label → Ukrainian
│   ├── TestResultList.tsx          # empty-state message + "Add" → Ukrainian
│   ├── SelectedItemsList.tsx       # empty-state message + "Delete" → Ukrainian
│   └── SummaryPanel.tsx            # "Total cost" → Ukrainian
├── data/
│   └── laboratory-tests.json       # 10 titles + descriptions → Ukrainian (ids/prices frozen)
├── services/
│   └── search.test.ts              # English query fixtures → Ukrainian (same IDs)
├── App.tsx                         # h1 + section headings → Ukrainian
└── ...                             # everything else (hooks, services, types, main, css) UNTOUCHED
```

**Structure Decision**: Single frontend project, unchanged layout. No new
files, no new directories: the localization is a pure value-level edit of
existing files, keeping the diff minimal and reviewable. Ukrainian strings
are inline literals in components (12 strings, single language, no switcher —
a strings module or i18n framework would add indirection without benefit;
see [research.md](./research.md) §1).

## Complexity Tracking

No constitution violations — this table is intentionally empty (see
Constitution Check above; all gates pass).
