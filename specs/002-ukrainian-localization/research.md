# Research: Ukrainian UI Localization

Phase 0 output — all decisions resolved; no NEEDS CLARIFICATION remain (the
feature description explicitly bounded scope). The tables in §2 and §3 are
**normative**: implementation MUST use these exact strings.

## 1. Translation Approach

- **Decision**: In-place Ukrainian literals directly in the components,
  `index.html`, and the catalog JSON. No i18n framework, no central strings
  module, no language switcher.
- **Rationale**: 12 user-visible strings across 7 files, one target language,
  no pluralization needs, and an explicit spec assumption that the interface
  is Ukrainian-only. The constitution (III) forbids new dependencies without
  ratification; an i18n library would add a dependency and indirection for
  zero behavioral gain. A central strings module was considered and rejected:
  without a switcher it is pure indirection, and it cannot mechanically prove
  "no English UI text remains" anyway (that gate is a manual/visual audit, SC-001).
- **Alternatives considered**: react-i18next / react-intl (rejected: new deps,
  overkill), central `strings.ts` module (rejected: indirection without a
  switcher), inline literals (chosen).

## 2. UI String Inventory (normative)

| # | File | English (current) | Ukrainian (target) |
|---|------|-------------------|--------------------|
| S1 | `index.html` `<html lang>` | `en` | `uk` |
| S2 | `index.html` `<title>` | `Laboratory Tests Lookup` | `Лабораторні дослідження` |
| S3 | `src/App.tsx` h1 | `Laboratory Tests Lookup` | `Лабораторні дослідження` |
| S4 | `src/App.tsx` section 1 heading | `Search & Result Set` | `Пошук і результати` |
| S5 | `src/App.tsx` section 2 heading | `Selected Items` | `Обрані дослідження` |
| S6 | `src/components/SearchBar.tsx` placeholder | `Search laboratory tests…` | `Пошук лабораторних досліджень…` |
| S7 | `src/components/SearchBar.tsx` aria-label | `Search laboratory tests` | `Пошук лабораторних досліджень` |
| S8 | `src/components/TestResultList.tsx` empty state | `No results found. Try a different search.` | `Нічого не знайдено. Спробуйте інший пошуковий запит.` |
| S9 | `src/components/TestResultList.tsx` Add button | `Add` | `Додати` |
| S10 | `src/components/SelectedItemsList.tsx` empty state | `No items selected yet.` | `Поки нічого не обрано.` |
| S11 | `src/components/SelectedItemsList.tsx` Delete button | `Delete` | `Видалити` |
| S12 | `src/components/SummaryPanel.tsx` label | `Total cost` | `Загальна вартість` |
| S13 | `src/components/AmountStepper.tsx` aria-label decrement | `Decrease amount` | `Зменшити кількість` |
| S14 | `src/components/AmountStepper.tsx` aria-label increment | `Increase amount` | `Збільшити кількість` |

- **Decision**: Keep the exact target strings above, including typographic
  details — ellipsis `…` in S6, punctuation and «і» (not «та») in headings
  per natural Ukrainian usage.
- **Rationale**: Consistent with Ukrainian UI conventions; short enough to fit
  existing button/label layouts (verified in §5).
- **Alternatives considered**: «Пошук аналізів», «Вибрані позиції» (rejected:
  «лабораторні дослідження» matches the app's subject and is the standard
  term for lab tests).

## 3. Catalog Translation (normative)

IDs and prices are frozen (stable keys for the selection service and
`selection.test.ts`); only `title` and `description` change.

| id | price | English title / description | Ukrainian title / description |
|----|-------|-----------------------------|-------------------------------|
| t-001 | 150 | Glucose (blood sugar) / Test for levels of sugar in blood | Глюкоза (цукор крові) / Тест на рівень цукру в крові |
| t-002 | 320 | Complete Blood Count / Measures red blood cells, white blood cells and platelets | Загальний аналіз крові / Вимірює кількість еритроцитів, лейкоцитів і тромбоцитів |
| t-003 | 280 | Cholesterol Panel / Total, LDL and HDL cholesterol levels | Ліпідограма (холестерин) / Рівні загального холестерину, ЛПНЩ та ЛПВЩ |
| t-004 | 190 | Thyroid-Stimulating Hormone / Checks thyroid gland function | Тиреотропний гормон (ТТГ) / Перевіряє функцію щитоподібної залози |
| t-005 | 240 | Vitamin D / Levels of vitamin D in the blood | Вітамін D / Рівень вітаміну D у крові |
| t-006 | 210 | Iron Studies / Serum iron, ferritin and transferrin saturation | Обмін заліза / Сироваткове залізо, феритин і насичення трансферину |
| t-007 | 120 | Urinalysis / Physical, chemical and microscopic examination of urine | Загальний аналіз сечі / Фізичне, хімічне та мікроскопічне дослідження сечі |
| t-008 | 160 | C-Reactive Protein / Measures the inflammation marker CRP | С-реактивний білок / Вимірює маркер запалення СРБ |
| t-009 | 260 | Liver Function Test / ALT, AST and bilirubin enzyme panel | Печінкові проби / Ферментна панель: АЛТ, АСТ і білірубін |
| t-010 | 200 | HbA1c / Average blood sugar level over the past three months | Глікований гемоглобін (HbA1c) / Середній рівень цукру в крові за останні три місяці |

- **Decision**: Use standard Ukrainian medical laboratory terminology; keep
  internationally recognized abbreviations in their standard Ukrainian or
  Latin forms as shown (ТТГ, ЛПНЩ/ЛПВЩ, СРБ, АЛТ/АСТ, HbA1c unchanged).
- **Rationale**: Users will recognize standard lab-report terminology; keeping
  the canonical abbreviation forms matches how Ukrainian labs print reports.
- **Alternatives considered**: Pure transliteration («Глюкоза (блад шугар)»
  — rejected), English-only names with Ukrainian descriptions (rejected:
  violates FR-004 "translated meaning").

## 4. Test Fixture Migration (`src/services/search.test.ts`)

`search.test.ts` imports the real catalog and asserts English queries; after
translation those queries match nothing. Rewrite the query strings to
Ukrainian equivalents targeting the **same IDs and same behavioral intent**
(test names/descriptions/comments stay English — user requirement):

| Current query | Ukrainian replacement | Assertion preserved |
|---------------|----------------------|---------------------|
| `blood sugar` | `цукор` | t-001 is top match |
| `''` / `'   '` | unchanged | browse mode / whitespace = empty |
| `zzzz` | unchanged | no matches → empty list |
| `glocose` (typo) | `глукоза` (typo of глюкоза) | typo tolerance → contains t-001 |
| `sugar blood` (word order) | `крові цукор` | word order → t-001 top |
| `chol` (partial) | `холесте` (partial of холестерин) | partial word → contains t-003 |
| `inflammation marker` (description) | `запалення` (in t-008 description) | description match → contains t-008 |
| `blood count` (ranking) | `аналіз крові` | all-tokens ranking → t-002 top |
| `blood` (equal scores) | `кров` | stable catalog order (t-001, t-002, t-010 match) |

- **Decision**: Update only the query strings; keep every assertion, test
  title, and the catalog import as-is.
- **Rationale**: The tests verify the *search service* (untouched); the
  fixtures must reflect the new production data. `selection.test.ts` and
  `format.test.ts` need no changes (prices and UAH formatting are untouched).
- **Alternatives considered**: Keeping English fixtures via a separate
  in-test English catalog (rejected: tests would no longer exercise the real
  production data).

## 5. Layout & Rendering Risks

- **Decision**: No CSS changes; verify rather than modify. Item rows already
  use `flex-wrap` (TestResultList/SelectedItemsList) and buttons have
  `whitespace`-default wrapping, so longer Ukrainian words reflow safely at
  ~320 px.
- **Rationale**: Ukrainian words average longer than English; the risk is
  clipping/overflow in the fixed-width stepper (`w-6` amount span) and
  buttons. The stepper shows digits only (language-neutral); buttons are
  `px-3 py-1.5` with wrapping text — safe. Final proof is the manual mobile
  check in quickstart.md.
- **Alternatives considered**: Adding `whitespace-nowrap`/shrinking classes
  (rejected unless the manual check actually fails).

## 6. Document Metadata & Accessibility

- **Decision**: `index.html` declares `lang="uk"` (S1) — required for
  assistive tech to pick the right pronunciation/voice and for browsers to
  hyphenate correctly. All aria-labels (S7, S13, S14) translate to Ukrainian
  (FR-003).
- **Rationale**: `lang` is part of the page contract (FR-002); a Ukrainian UI
  with `lang="en"` would mispronounce every string for screen-reader users.
- **Alternatives considered**: Keeping `lang="en"` (rejected — violates
  FR-002/SC-007).

## 7. Currency & Numbers

- **Decision**: Leave `src/services/format.ts` and all `formatUah` call sites
  untouched. `Intl.NumberFormat('uk-UA', { style: 'currency', currency:
  'UAH' })` already renders UAH per Ukrainian conventions (e.g., `320,00 ₴`).
- **Rationale**: FR-008 explicitly excludes currency from this change; the
  format tests already cover it.
