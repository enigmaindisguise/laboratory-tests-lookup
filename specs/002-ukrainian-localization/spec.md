# Feature Specification: Ukrainian UI Localization

**Feature Branch**: `002-ukrainian-localization`

**Created**: 2026-08-01

**Status**: Draft

**Input**: User description: "Change app language to Ukrainian. Code, comments, components and all tech staff still stays in english. The only change in would be in UI (everything should be translated into Ukrainian) and seeder test data."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse the Entire Application in Ukrainian (Priority: P1)

A user opens the application and every piece of text they see — the page
title, headings, the search box hint, buttons, status and empty-state
messages, and the summary label — is in Ukrainian. Nothing in the interface
reads as English; the app feels natively Ukrainian to the user.

**Why this priority**: This is the core of the feature. The user asked for the
interface language to be Ukrainian; every user-visible string must change for
the feature to have any value. It is the first slice that can be delivered and
verified on its own.

**Independent Test**: Can be fully tested by loading the app, walking through
both sections (search area and selected-items area), and confirming that every
visible string — title, headings, search placeholder, buttons, messages,
summary label — is Ukrainian and that no English UI text remains anywhere.

**Acceptance Scenarios**:

1. **Given** the application is open, **When** the user looks at the page
   title, **Then** it is displayed in Ukrainian.
2. **Given** the application is open, **When** the user looks at the section
   headings, **Then** they are displayed in Ukrainian.
3. **Given** the search box is visible, **When** the user reads its hint text,
   **Then** it is in Ukrainian.
4. **Given** the result list is visible, **When** the user reads the "add"
   button on any item, **Then** it is labeled in Ukrainian.
5. **Given** the user enters a query that matches nothing, **When** the empty
   state is shown, **Then** the message is in Ukrainian.
6. **Given** the Selected Items section is empty, **When** its empty state is
   shown, **Then** the message is in Ukrainian.
7. **Given** the user has selected items, **When** they read the "delete"
   buttons and the total-cost label, **Then** they are displayed in Ukrainian.

---

### User Story 2 - Search and Select Tests Using the Ukrainian Catalog (Priority: P2)

A user searches for laboratory tests by typing Ukrainian phrases. The catalog
is presented in Ukrainian — every test name and description is in Ukrainian —
and typing a Ukrainian query, including partial or loosely worded phrases,
returns the matching tests. Selecting tests, adjusting amounts, and reading
the total cost all work exactly as before.

**Why this priority**: Translating the built-in catalog data is the second
half of the user's request. Search and selection remain fully functional on
the translated data, so this story proves the feature did not break the
existing core flow.

**Independent Test**: Can be fully tested by typing a Ukrainian query (e.g.,
"цукор") and confirming the sugar test appears in the results, then adding
items and confirming the total updates — all with Ukrainian text on screen.

**Acceptance Scenarios**:

1. **Given** the application is open, **When** the user types a Ukrainian
   query such as "цукор", **Then** the matching test (the glucose/sugar test)
   appears in the result list.
2. **Given** the user types a partial Ukrainian word, **When** the result list
   is displayed, **Then** fuzzy matching still tolerates partial words and
   word order on the Ukrainian text.
3. **Given** the user types a query that matches nothing, **When** the empty
   state is shown, **Then** the "no results" message is in Ukrainian.
4. **Given** the user adds several tests from the results, **When** they view
   the Selected Items section, **Then** the tests appear with their Ukrainian
   names and the total cost is correct.
5. **Given** a Ukrainian query with no matches, **When** the result list is
   empty, **Then** the application does not error and shows the Ukrainian
   "no results" message.

---

### User Story 3 - Assistive and Document-Level Localization (Priority: P3)

A screen-reader user opens the application. The language of the page is
declared as Ukrainian, and the labels announced by assistive technology —
such as the search field label and the amount increase/decrease controls —
are in Ukrainian.

**Why this priority**: Accessibility is part of a complete localization, but
it does not block the visual interface work; it is a lower-priority but
required follow-up for full consistency.

**Independent Test**: Can be fully tested by inspecting the page's declared
language and the labels exposed to assistive technology, and confirming each
is Ukrainian.

**Acceptance Scenarios**:

1. **Given** the application is open, **When** the page's language setting is
   inspected, **Then** it declares Ukrainian.
2. **Given** the search field is focused, **When** assistive technology reads
   its label, **Then** the label is in Ukrainian.
3. **Given** the amount stepper controls are present, **When** assistive
   technology reads their labels, **Then** the increase/decrease labels are in
   Ukrainian.

---

### Edge Cases

- What happens to the previous English-language example queries (e.g., "blood
  sugar")? → They no longer match, because the catalog text is now Ukrainian;
  the app shows the Ukrainian "no results" message. This is expected and
  acceptable — search logic itself is unchanged.
- Do long Ukrainian words break the layout on narrow screens? → No: item rows
  and buttons must remain fully usable and unclipped at mobile widths (down to
  ~320 px), with no horizontal page overflow.
- Are strings repeated in multiple places (e.g., the "add" button on every
  result row) translated everywhere? → Yes: every occurrence of every
  user-visible string is translated; none may be missed.
- Does currency display change? → No: costs keep the existing Ukrainian
  Hryvnia formatting (symbol, decimals, and grouping style stay as today).
- Do unit tests and code comments change? → No: code, identifiers, comments,
  and test code remain in English; only the built-in catalog data and
  user-visible UI text change.
- Does the app offer a language switcher? → No: the interface is Ukrainian
  only, with no way to switch back to English.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: All user-visible static text MUST be displayed in Ukrainian,
  including the page title, section headings, search-box hint, buttons
  ("add", "delete"), empty-state messages, and the total-cost label.
- **FR-002**: The page MUST declare Ukrainian as its language so browsers and
  assistive technologies treat the content as Ukrainian.
- **FR-003**: Labels exposed to assistive technology (screen readers) for the
  search field and the amount increase/decrease controls MUST be in Ukrainian.
- **FR-004**: Every built-in catalog entry's name and description MUST be in
  natural Ukrainian (translated meaning, not transliteration).
- **FR-005**: The catalog MUST keep the same entries, identifiers, and prices;
  only names and descriptions change to Ukrainian.
- **FR-006**: Search MUST continue to match catalog entries by name and
  description with the same fuzzy behavior (partial words, word order,
  minor typos), operating on the Ukrainian text.
- **FR-007**: Core flows MUST keep working unchanged after translation:
  browsing the full catalog, adding items, incrementing/decrementing amounts,
  deleting items, and seeing an immediately updated total cost.
- **FR-008**: Costs MUST continue to be displayed with the existing Ukrainian
  Hryvnia (UAH) currency formatting; the translation MUST NOT alter currency
  presentation.
- **FR-009**: No English UI text MAY remain visible to users; English may
  remain only in code identifiers, code comments, file names, and automated
  test code.
- **FR-010**: The layout MUST remain fully usable on mobile widths (down to
  ~320 px) with Ukrainian text: sections stacked, controls reachable, no
  horizontal page overflow, no clipped or overlapping text.

### Key Entities *(include if feature involves data)*

- **Laboratory Test**: A catalog entry representing a test. Its name and
  description attributes change from English to Ukrainian; its unique ID,
  price, and count of entries remain unchanged.
- **Selection**: The user's chosen tests with amounts. Unaffected by
  localization; the summary continues to operate on it unchanged.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of user-visible strings in the application are in
  Ukrainian, verified by a complete walkthrough of both sections covering
  title, headings, placeholder, buttons, messages, and summary label.
- **SC-002**: 100% of built-in catalog entries (all 10) have a Ukrainian name
  and description; none remain in English.
- **SC-003**: A fixed set of representative Ukrainian queries (including
  "цукор" → the sugar test) returns the expected catalog entry, and no query
  causes an error state.
- **SC-004**: The core flow — search in Ukrainian, add three tests, read the
  total cost — completes in under 1 minute on first use, matching the
  pre-translation experience.
- **SC-005**: After any add or delete action, the total cost updates
  immediately and equals the sum of (cost × amount), unchanged from before
  translation.
- **SC-006**: At mobile widths (down to ~320 px), the app remains fully
  usable with Ukrainian text: no horizontal overflow and no clipped labels or
  buttons.
- **SC-007**: The page declares Ukrainian as its language, and all
  assistive-technology labels (search field, amount controls) are in
  Ukrainian.

## Assumptions

- Scope is strictly limited to (1) user-visible UI text and (2) the built-in
  catalog data. Code identifiers, code comments, component/file names,
  configuration, and automated test code remain in English, per the user's
  explicit instruction.
- The interface is Ukrainian only: no language switcher, no multi-language
  support, and no translation framework are introduced.
- "Seeder test data" refers to the built-in catalog of laboratory tests
  embedded in the application; its 10 entries keep their IDs and prices, with
  only names and descriptions translated to natural Ukrainian.
- Search behavior (fuzzy matching over name and description) is unchanged; it
  now operates on Ukrainian text. Queries previously written in English (e.g.,
  "blood sugar") will no longer match and will show the Ukrainian "no results"
  message.
- Currency display is already localized to Ukrainian Hryvnia and is not part
  of this change.
- Automated tests that assert on UI strings will need corresponding updates so
  the test suite still passes with Ukrainian text; this is part of the change,
  not a deviation from the English-code rule.
- The app remains a single-user, frontend-only tool; no data or behavior
  outside the interface language and catalog content is affected.
