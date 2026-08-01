# Quickstart: Validation Guide (Ukrainian UI)

How to run the app and prove the localization works end-to-end. Contract and
data details live in [contracts/](./contracts/) and
[data-model.md](./data-model.md); implementation tasks live in `tasks.md`.
All scenarios below are updated for the Ukrainian interface (feature 002);
behavioral scenarios 4–9 carry over from feature 001 unchanged except for the
visible language.

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
npm test -- --run   # Vitest unit tests — search fixtures now Ukrainian (constitution IV)
npm run build       # tsc -b && vite build — MUST succeed (type safety gate)
```

## Manual Validation Scenarios

Map to spec acceptance scenarios and success criteria.

| # | Scenario | Steps | Expected outcome | Ref |
|---|----------|-------|------------------|-----|
| 1 | Full Ukrainian UI | Load the app; read title, both headings, search placeholder, buttons, summary label | Every visible string is Ukrainian; no English UI text anywhere (audit per research.md §2 inventory) | FR-001, FR-009, SC-001 |
| 2 | Page language | Inspect the page source / devtools | `<html lang="uk">`; `<title>` is `Лабораторні дослідження` | FR-002, SC-007 |
| 3 | Ukrainian fuzzy search | Type `цукор` | `t-001` «Глюкоза (цукор крові)» appears among the matches | SC-003, FR-006 |
| 4 | Browse mode | Clear the search box | All 10 Ukrainian catalog items listed; list scrolls internally if it overflows | FR-005, FR-004 |
| 5 | No results (Ukrainian message) | Type `zzzz` | «Нічого не знайдено. Спробуйте інший пошуковий запит.» shown | FR-006 |
| 6 | Add & increment | Click «Додати» on `t-001` twice | Section 2 shows `t-001` once with amount 2; heading «Обрані дослідження» | FR-007 |
| 7 | Steppers | Use up/down arrows in both sections | Amount changes by 1 per click; Section 2 amount never goes below 1; screen-reader labels are Ukrainian (`Зменшити/Збільшити кількість`) | FR-016, FR-017, FR-003 |
| 8 | Delete | Click «Видалити» on an item with amount > 1 | Item removed entirely (amount does not just decrement) | FR-009 |
| 9 | Total cost | Add 3 items with different amounts | Total = Σ(price × amount), e.g., t-001 ×2 (300) + t-002 (320) = `620,00 ₴`; updates immediately after every change | FR-010, FR-011, SC-005 |
| 10 | Zero state | Load the page fresh | Empty selection, total `0,00 ₴`, «Поки нічого не обрано.» | FR-013, FR-014 |
| 11 | Reload | Add items, refresh the page | Selection resets to empty; catalog still fully browsable | Assumption |
| 12 | Mobile/responsive | Resize the viewport to ~320 px wide (or open on a narrow phone) | Sections stay stacked, all controls reachable, no horizontal page overflow, no clipped Ukrainian labels or buttons | FR-010, SC-006 |

## Expected Final State

- All 12 manual scenarios pass.
- `npm run lint`, `npm test -- --run`, `npm run build` all green.
- `npm run preview` serves the production build from `dist/` locally.
