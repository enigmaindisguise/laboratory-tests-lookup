# Quickstart: Validation Guide

How to run the app and prove the feature works end-to-end. Contract and data
details live in [contracts/](./contracts/) and
[data-model.md](./data-model.md); implementation tasks live in `tasks.md`.

## Prerequisites

- Node.js 20+ and npm (CI uses Node 20 with `npm ci`).

## Setup & Run

```bash
npm install
npm run dev        # dev server with hot reload → http://localhost:5173
```

## Automated Checks (quality gates)

```bash
npm run lint        # ESLint flat config — MUST pass with zero errors (constitution V)
npm test -- --run   # Vitest unit tests for pure services (constitution IV)
npm run build       # tsc -b && vite build — MUST succeed (type safety gate)
```

## Manual Validation Scenarios

Map to spec acceptance scenarios and success criteria.

| # | Scenario | Steps | Expected outcome | Ref |
|---|----------|-------|------------------|-----|
| 1 | Fuzzy search | Type `глюкоза` | `8013 – Глюкоза` appears among the matches (top match) | SC-001, FR-002 |
| 2 | Browse mode | Clear the search box | All 1,937 catalog items listed; list scrolls internally if it overflows | FR-005, FR-004 |
| 3 | No results | Type `zzzz` | "No results" message shown | FR-006 |
| 4 | Add & increment | Click "Add" on `8013 – Глюкоза` twice | Section 2 shows `8013 – Глюкоза` once with amount 2 | FR-007, scenario 2.5 |
| 5 | Steppers | Use up/down arrows in both sections | Amount changes by 1 per click; Section 2 amount never goes below 1 | FR-016, FR-017 |
| 6 | Delete | Click "Delete" on an item with amount > 1 | Item removed entirely (amount does not just decrement) | FR-009, scenario 2.7 |
| 7 | Total cost | Add 3 items with different amounts | Total = Σ(price × amount), e.g., 8013 ×2 (450) + 8032 (205) = "655,00 ₴"; updates immediately after every change | FR-010, FR-011, SC-003 |
| 8 | Zero state | Load the page fresh | Empty selection, total "0,00 ₴" | FR-013, FR-014 |
| 9 | Reload | Add items, refresh the page | Selection resets to empty; catalog still fully browsable | Assumption |
| 10 | Mobile/responsive | Resize the viewport to ~320 px wide (or open on a narrow phone) | Sections stay stacked, all controls reachable, no horizontal page overflow | FR-018, SC-007 |
| 11 | ID display | Browse the catalog and check both sections | Every row shows `ID – Title` (e.g. `8013 – Глюкоза`); the ID does not affect search results, amounts, or totals | FR-019, FR-020, SC-008 |

## Expected Final State

- All 11 manual scenarios pass.
- `npm run lint`, `npm test -- --run`, `npm run build` all green.
- `npm run preview` serves the production build from `dist/` locally.
