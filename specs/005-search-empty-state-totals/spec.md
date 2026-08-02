# Feature Specification: Search Empty State & Section Totals

**Feature Branch**: `005-search-empty-state-totals`

**Created**: 2026-08-01

**Status**: Draft

**Input**: User description: "Search update & showing totals. When I search for something that doesn't exist in the storage, then it should render empty table with text in ukrainian 'nothing found'. Also, next to the titles of each section, there should a counter added that shows the total number of items in the current result-set."

**Modification (2026-08-01)**: Clarifications resolved: (1) the empty table
applies only to the no-match state — populated results keep the current
list-row presentation; (2) purely numeric queries must not produce
resemblance matches — e.g., "1001" yields the empty table.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See an Empty Table When Nothing Matches (Priority: P1)

A user types a query that matches no test in the catalog (for example, a
misspelled or nonexistent word). Instead of the result area collapsing into a
plain text line, the application renders the search result area as an empty
table — its header row visible, no data rows — showing the Ukrainian text
"Нічого не знайдено". The user immediately understands that nothing matched,
and the area stays visually stable while they edit the query.

**Why this priority**: This is the core of the request. The no-match state is a
frequent part of the search flow, and giving it a proper, structured
presentation is the primary value of this feature. It is the first slice that
can be delivered and verified on its own.

**Independent Test**: Can be fully tested by loading the app, typing a query
that matches no test (e.g., "ззззз"), and confirming the result area renders
an empty table containing the text "Нічого не знайдено" with no data rows.
Delivers the structured empty-state value without any counter work.

**Acceptance Scenarios**:

1. **Given** a non-empty query that matches no catalog item, **When** the user
   searches, **Then** the result area renders an empty table — header row
   visible, no data rows — containing the Ukrainian text "Нічого не
   знайдено".
2. **Given** the empty table is shown, **When** the user edits the query so
   that tests now match, **Then** the empty table is replaced by the matching
   rows in their usual presentation and the empty-state text disappears.
3. **Given** the search box is cleared, **When** the query becomes empty,
   **Then** the full catalog is shown in browse mode — the empty table is not
   shown.
4. **Given** a query that matches catalog items, **When** the results are
   shown, **Then** the rows keep the current presentation — the empty-table
   structure is used only for the no-match state.

---

### User Story 2 - Section Titles Show Item Counters (Priority: P2)

Next to the title of each of the two sections, the user sees a counter showing
the total number of items in that section's current result set. The Search
section counter shows how many tests are currently listed (the full catalog in
browse mode, or the matching tests during a query). The Selected Items section
counter shows how many items are currently selected. The counters update as
the user searches, adds, deletes, or changes amounts.

**Why this priority**: Counters are the second half of the request. They
depend on the same two existing lists the user already works with, but they
add no search capability, so they rank below the empty-state table.

**Independent Test**: Can be fully tested by loading the app with the catalog
visible, noting the Search counter equals the full catalog size, typing a
query and confirming the counter equals the match count, then adding items and
confirming the Selected Items counter equals the number of added items.

**Acceptance Scenarios**:

1. **Given** the application is open with an empty search box, **When** the
   user views the Search section title, **Then** a counter next to it shows
   the number of tests in the full catalog.
2. **Given** a query that matches exactly 3 tests, **When** the user views the
   Search section title, **Then** the counter shows 3.
3. **Given** a query that matches no tests, **When** the user views the Search
   section title, **Then** the counter shows 0 and the empty table is shown.
4. **Given** 2 tests are selected, **When** the user views the Selected Items
   section title, **Then** the counter shows 2.
5. **Given** no tests are selected, **When** the user views the Selected Items
   section title, **Then** the counter shows 0.

---

### User Story 3 - Numeric Queries Return Exact Matches Only (Priority: P2)

A user types a number — for example a test code or part of one. The
application returns only tests whose name or description contains that number
exactly or as the start of a longer number, and never tests whose names merely
resemble it. Because no catalog item's name or description contains "1001",
typing "1001" shows the empty table instead of a list of unrelated tests.

**Why this priority**: This removes the confusing noise from numeric queries,
which users encounter when typing codes they see in the UI; it is a search
behavior fix, so it ranks below the core empty-table story but above the
counter-sync guarantee.

**Independent Test**: Can be fully tested by typing "1001" and confirming the
empty table is shown (no resemblance matches), and typing a number that does
occur in a test name (e.g., "25" for "Вітамін D загальний (25-OH)") and
confirming that test appears.

**Acceptance Scenarios**:

1. **Given** the user types "1001", **When** the search runs, **Then** only
   tests whose name or description contains "1001" (exactly or as a prefix)
   are returned; since none exist, the empty table with "Нічого не знайдено"
   is shown.
2. **Given** the user types "1001", **When** the search runs, **Then** no test
   whose name merely resembles the number (e.g., containing "1081", "1091",
   or "S-100") is returned.
3. **Given** the user types a number contained in a test name (e.g., "25"),
   **When** the search runs, **Then** the test containing that number (e.g.,
   "Вітамін D загальний (25-OH)(D2+D3)") appears in the results.
4. **Given** the user types a token mixing letters and digits (e.g., "D2"),
   **When** the search runs, **Then** it behaves as before — the numeric
   exact/prefix rule applies only to purely numeric tokens.

---

### User Story 4 - Counters Stay in Sync with the Visible Lists (Priority: P3)

After every user action that changes either list — typing or changing the
query, adding a test, deleting a test, changing an amount — the counters match
the number of rows actually visible in their sections, immediately, with no
page reload.

**Why this priority**: This is the quality guarantee for the counters: a
counter that lags behind the visible list would mislead the user. It adds no
new capability beyond User Story 2, so it ranks last.

**Independent Test**: Can be fully tested by performing a sequence of actions
(change query, add items, delete an item, increment an amount) and, after each
action, comparing both counters against the number of rows rendered in the
corresponding sections.

**Acceptance Scenarios**:

1. **Given** any application state, **When** the user changes the query, adds
   a test, deletes a test, or changes an amount, **Then** both counters
   reflect the visible row counts immediately, without a reload.
2. **Given** a counter value, **When** the user inspects the corresponding
   section's list, **Then** the counter equals the number of rows rendered in
   that list.

---

### Edge Cases

- A non-empty query that matches nothing → the empty table with "Нічого не
  знайдено" appears, and the Search counter shows 0.
- An empty or whitespace-only query → browse mode shows the full catalog; the
  empty table is not shown and the counter shows the full catalog size.
- The query changes from no-match to match → the empty table is replaced by
  the matching rows and the counter updates.
- The query changes from match to no-match → the rows are replaced by the
  empty table and the counter drops to 0.
- The user deletes the last selected item → the Selected Items counter shows 0
  and the section shows its existing empty-state message.
- The user adds an already-selected test again (amount increment) → the
  Selected Items counter does not change, because it counts distinct selected
  items, not quantities.
- Very long Ukrainian text in rows at narrow widths (down to ~320 px) → no
  horizontal page overflow; the lists keep their existing internal scrolling.
- A purely numeric query (e.g., "1001") → only exact/prefix numeric matches
  are returned; resemblance matches (e.g., "1081", "S-100") are not; with no
  exact/prefix match the empty table is shown.
- A query token mixing letters and digits (e.g., "D2", "M50") → the existing
  fuzzy rules still apply; the numeric restriction covers purely numeric
  tokens only.
- Page reload → the selection resets; the counters reflect the initial state
  (full catalog in the Search section, 0 in the Selected Items section).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: When the current query matches no catalog item, the system MUST
  render the search result area as an empty table — header row visible, no
  data rows — displaying the Ukrainian text "Нічого не знайдено".
- **FR-002**: The empty table MUST appear only for a non-empty query with zero
  matches; an empty or whitespace-only query MUST continue to show the full
  catalog in browse mode.
- **FR-003**: The system MUST display a counter adjacent to the Search section
  title showing the number of items in the current result set (the full
  catalog in browse mode, or the matching tests during a query).
- **FR-004**: The system MUST display a counter adjacent to the Selected Items
  section title showing the number of selected items.
- **FR-005**: Both counters MUST update immediately after every query change,
  add, delete, and amount-change action, without a page reload.
- **FR-006**: Each counter MUST equal the number of rows rendered in its
  section at all times (Search: matching or full-catalog rows; Selected Items:
  distinct selected items).
- **FR-007**: The empty-state text MUST be the Ukrainian phrase "Нічого не
  знайдено"; the change MUST NOT introduce any English UI text.
- **FR-008**: The layout MUST remain fully usable at mobile widths (down to
  ~320 px): counters visible, no horizontal page overflow, and the existing
  internal scrolling of the lists preserved.
- **FR-009**: Search matching MUST change ONLY for purely numeric query tokens
  (per FR-010); all other search behavior — and all selection, amount, and
  total-cost logic — MUST remain exactly as before.
- **FR-010**: When a query contains a token consisting only of digits, the
  system MUST return only catalog items whose name or description contains
  that number as a whole token or as the start of a longer number; catalog
  items whose name or description merely resembles the number MUST NOT be
  returned (e.g., "1001" MUST NOT return items containing "1081", "1091", or
  "S-100").
- **FR-011**: When a query matches catalog items, the result list MUST keep
  its current row presentation; the empty-table structure MUST be used only
  for the no-match state.

### Key Entities *(include if feature involves data)*

- **Laboratory Test** (existing): a catalog entry representing a test — unique
  ID, title, description, and price. Unchanged by this feature.
- **Result Set** (existing concept, newly surfaced): the collection of tests
  displayed in the Search section — the full catalog in browse mode, or the
  tests matching the current query. Its size feeds the Search counter and
  determines whether the empty table is shown.
- **Selection** (existing): the user's chosen tests with amounts, one row per
  distinct test. Its row count feeds the Selected Items counter; quantities
  are not counted.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of non-empty queries with no matches (verified over a fixed
  set of nonsense queries) render the empty table with the text "Нічого не
  знайдено" and no data rows.
- **SC-002**: The Search section counter equals the number of tests displayed
  in 100% of states — browse mode, query mode with matches, and the empty
  no-match state (counter 0).
- **SC-003**: The Selected Items counter equals the number of selected items
  in 100% of states, including 0 when nothing is selected.
- **SC-004**: After any query, add, delete, or amount-change action, both
  counters match their sections' visible row counts immediately, verified
  without a page reload.
- **SC-005**: At ~320 px width, both counters are fully visible and no
  horizontal page overflow occurs.
- **SC-006**: Non-numeric search, selection, and total-cost behavior is
  unchanged: the same non-numeric queries return the same matches, and totals
  are computed the same way (no regressions).
- **SC-007**: A fixed set of purely numeric queries (including "1001") returns
  only exact/prefix matches — for "1001" this is zero results and the empty
  table — with no resemblance-based matches, in 100% of cases.

## Assumptions

- "Nothing found" in Ukrainian is rendered as "Нічого не знайдено" — the same
  wording the application already uses today; no additional hint sentence is
  required inside the empty table.
- The "current result-set" for the Search section is the list of tests
  currently displayed: the full catalog when the query is empty (browse mode),
  or the matching tests otherwise.
- The "current result-set" for the Selected Items section is the list of
  distinct selected tests (one row per test), not the sum of quantities.
  Adding an already-selected test increments its amount but does not change
  the counter.
- The empty-table behavior applies to the Search result area only; the
  Selected Items section keeps its existing empty-state message ("Поки нічого
  не обрано.") and only gains the counter.
- Counters are shown next to the section titles in a compact form (for
  example, a parenthesized number or a small badge); the exact visual style is
  an implementation detail.
- The interface remains Ukrainian-only (per the ratified localization
  feature); no English UI text is introduced.
- The application remains frontend-only with its embedded catalog; no storage
  or backend changes are involved.
- "Empty table" (per clarification) means: the no-match state renders an empty
  table with the header row and the message; populated results keep the
  current list-row presentation. The result area is not converted to a table
  in the populated state.
- Purely numeric query tokens match exactly or by prefix only; fuzzy
  resemblance matching does not apply to them, so "1001" (which appears in no
  name or description) yields the empty table. Tokens mixing letters and
  digits keep the existing fuzzy rules.
- Searching by ID remains unsupported: IDs are presentational only, per the
  ratified 001 feature. A numeric query that equals a test's ID but not any
  name or description token returns the empty table.
