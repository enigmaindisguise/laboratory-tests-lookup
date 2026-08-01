# Feature Specification: Laboratory Test Search & Selection

**Feature Branch**: `001-lab-test-search-select`

**Created**: 2026-08-01

**Status**: Draft

**Input**: User description: "Front-end web application that allows user to search for items stored in app and then select them. Selection allows user to see result set that also supports summary of specific fields. UI: Two sections that are stacked: 1) Search and result set 2) Selected items + summary. 1) Search and result set with buttons for each item. Internal scroll supported. Buttons: Add. 2) Selected items from the previous section + summary section that shows total cost. Buttons: Delete (should remove this item from 'selected items'). Storage: Hardcoded json object of laboratory tests. Search: fuzzy search that seeks for items in that json objects. Example: 'blood sugar' would return 'Test for levels of sugar in blood'. Formulas: Currently only sum is supported. It should read total of each item in the 'selected items' section and calculate total."

## Clarifications

### Session 2026-08-01

- Q: When the search box is empty and the user hasn't typed anything yet, what should the result area show? → A: Show the full catalog (browse mode).
- Q: When a test is already in the Selected Items section, what should happen if the user clicks "Add" on it again? → A: Each test has a unique ID; selecting it again increments its amount (quantity) instead of adding a duplicate line. Both sections show up/down arrows so the user can control the amount.
- Q: Which currency should the costs be displayed in? → A: Ukrainian Hryvnia (UAH).
- Q: On larger desktop screens, should the two sections stay stacked one above the other, or switch to a side-by-side layout? → A: Stacked everywhere — identical layout at all screen sizes; mobile-first, comfortable on desktop.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Search for Laboratory Tests (Priority: P1)

A user opens the application and wants to find a specific laboratory test. They
type a phrase into the search box — which may be loosely worded, partial, or
contain words in a different order than the test's name — and the application
returns matching tests. Each match is shown in a scrollable result list with an
"Add" button. The user scans the results and identifies the test they need.

**Why this priority**: Search is the entry point of the entire application.
Without the ability to find tests, nothing else in the app can be used. It is
the first slice that delivers standalone value: a user can already look up
whether a test exists in the catalog.

**Independent Test**: Can be fully tested by loading the app, typing a query
such as "blood sugar", and confirming the test "Test for levels of sugar in
blood" appears in the result list. Delivers the value of catalog lookup without
any selection features.

**Acceptance Scenarios**:

1. **Given** the application is open with an empty search box, **When** the
   user types "blood sugar", **Then** the result list shows "Test for levels of
   sugar in blood" among the matches.
2. **Given** the application is open, **When** the user types a query with no
   matching tests, **Then** the result list shows a clear "no results" message.
3. **Given** the search box is empty, **When** the user has not typed anything,
   **Then** the full catalog is shown in the scrollable result list (browse
   mode).
4. **Given** the result list is longer than the visible area, **When** the user
   scrolls, **Then** the list scrolls internally without moving the rest of the
   page layout.

---

### User Story 2 - Build a Selection and View Total Cost (Priority: P2)

A user has found the tests they need and builds a selection. For each test in
the result list they click "Add", and the test appears in the second, stacked
section — Selected Items — along with a summary that shows the total cost of
everything selected. Each item carries an amount: adding the same test again
increments its amount rather than creating a duplicate line. Up/down arrows in
both sections let the user control the amount, the user can remove any item by
clicking "Delete" on it, and the total updates immediately.

**Why this priority**: Selection and summary are the second half of the core
flow. Combined with User Story 1 it produces the full end-to-end value: find
tests, pick them, and know the combined cost. It builds on the search slice
rather than replacing it.

**Independent Test**: Can be fully tested by adding several tests from the
result list and confirming each appears in Selected Items, the total equals the
sum of their costs, and clicking "Delete" on an item removes it and adjusts the
total. Delivers cost-estimation value as soon as the selection exists.

**Acceptance Scenarios**:

1. **Given** one or more tests are visible in the result list, **When** the
   user clicks "Add" on a test, **Then** that test appears in the Selected
   Items section.
2. **Given** several tests are selected with their amounts, **When** the user
   views the summary, **Then** the total cost shown equals the sum of each
   item's cost times its amount.
3. **Given** a test is present in Selected Items, **When** the user clicks
   "Delete" on it, **Then** that item is removed from Selected Items.
4. **Given** the user deletes an item from Selected Items, **When** the summary
   is displayed, **Then** the total cost reflects the remaining items only.
5. **Given** the user adds the same test more than once, **When** the summary
   is displayed, **Then** the test shows an incremented amount and its cost
   times its amount counts toward the total.
6. **Given** a selected item is shown with its amount, **When** the user clicks
   the up or down arrow, **Then** the amount changes by one and the total cost
   updates immediately.
7. **Given** a selected item has an amount greater than one, **When** the user
   clicks "Delete" on it, **Then** the item is removed entirely, not just
   decremented.

### Edge Cases

- What happens when the search query contains only spaces or special
  characters? → The application treats it as an empty query and shows the full
  catalog.
- How does the system handle a query that matches nothing? → A clear "no
  results" message is shown; the user can edit the query.
- What happens when the user clicks "Delete" on the last remaining selected
  item? → The Selected Items section becomes empty and the total cost shows
  zero.
- How are costs with different numbers of decimal places handled? → All costs
  are summed numerically and displayed with consistent currency formatting.
- What happens on page reload? → The selection is cleared; the catalog remains
  available (data is embedded in the application, not fetched).
- Can the same test appear more than once in the selection? → Not as separate
  lines; each "Add" click increments the test's amount, and the total includes
  cost × amount.
- How low can the amount go with the down arrow? → In the Selected Items
  section, down to 1; "Delete" removes the item entirely. In the Search
  section, the amount to add can be set from 1 upward.
- How does the app behave on narrow (mobile) screens? → The layout stays
  stacked; result and selected lists scroll internally; all buttons remain
  tappable with no horizontal page overflow.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a search input at the top of the first
  section.
- **FR-002**: System MUST match catalog items using fuzzy search that tolerates
  word order, partial words, and minor typos — e.g., the query "blood sugar"
  MUST return the item "Test for levels of sugar in blood".
- **FR-003**: System MUST display matching items in a result list with an
  "Add" button on every item.
- **FR-004**: System MUST support internal scrolling when the result list
  exceeds the visible area.
- **FR-005**: System MUST show the full catalog when the search query is empty.
- **FR-006**: System MUST show a "no results" message when no item matches the
  query.
- **FR-007**: System MUST add the clicked item to the Selected Items section
  when "Add" is pressed; selecting an already-selected test again MUST
  increment its amount instead of creating a duplicate line.
- **FR-008**: System MUST display every selected item in the second section,
  each with a "Delete" button and its current amount.
- **FR-009**: System MUST remove the clicked item from Selected Items when
  "Delete" is pressed (removing the item entirely, regardless of its amount).
- **FR-010**: System MUST display a summary showing the total cost, computed as
  the sum of (cost × amount) for every item in Selected Items.
- **FR-011**: System MUST update the total cost immediately after every add,
  delete, or amount-change action, without a page refresh.
- **FR-012**: System MUST keep the laboratory test catalog available entirely
  within the application (embedded data); no external data source or server
  interaction is required.
- **FR-013**: System MUST initialize with an empty Selected Items section and a
  total cost of zero.
- **FR-014**: System MUST show a zero total when Selected Items is empty.

- **FR-015**: System MUST display costs with consistent currency formatting
  in Ukrainian Hryvnia (UAH), two decimal places.
- **FR-016**: System MUST show up/down arrows for the amount on every item in
  the Search result list, letting the user set how many of that test to add.
- **FR-017**: System MUST show up/down arrows for the amount on every item in
  the Selected Items section; the amount MUST NOT decrement below 1.
- **FR-018**: System MUST render the two sections stacked at all screen sizes,
  with a mobile-first layout that is fully usable on small screens (down to
  ~320 px wide) and comfortable on large desktop screens.

### Key Entities *(include if feature involves data)*

- **Laboratory Test**: A catalog entry representing a test a user can look up
  and select. Key attributes: a unique ID, a short name, a free-text
  description (used for matching), and a numeric cost.
- **Selection**: The user's chosen tests, built from the catalog, each tracked
  by its unique ID with an amount (quantity). A test appears at most once; its
  amount is incremented by "Add" and adjusted with the up/down arrows. The
  summary operates on this entity.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of a fixed set of representative queries (including "blood
  sugar" → "Test for levels of sugar in blood") return the expected catalog
  item in the result list.
- **SC-002**: Users can complete the full flow — search for a test, add three
  tests to the selection, and read the total cost — in under 1 minute on first
  use.
- **SC-003**: The displayed total cost equals the sum of (cost × amount) of
  the selected items in 100% of add/delete/amount-change sequences, verified
  immediately after each action.
- **SC-004**: After any add or delete action, the updated total cost is visible
  without reloading or navigating away (verified as immediate by the user).
- **SC-005**: 100% of "Delete" clicks remove exactly the item the button
  belongs to and no other item.
- **SC-006**: The application loads and runs entirely in the browser without
  any network service; a user with a static copy of the app can use all
  features offline.
- **SC-007**: At mobile widths (down to ~320 px), the app is fully usable:
  sections stay stacked, all controls are reachable, and no horizontal page
  overflow occurs.

## Assumptions

- The laboratory test catalog is stored as a hardcoded JSON object embedded in
  the application (per the project constitution: frontend-only, no backend).
- Each laboratory test has four attributes: unique ID, name, description, and
  cost; the cost is the only numeric field used by the summary today.
- "Summary of specific fields" is interpreted as: the summary section displays
  the total cost, and the design must allow additional summary fields to be
  added later without reworking the section.
- The selection tracks an amount per test ID instead of allowing duplicate
  lines; adding an already-selected test increments its amount.
- Every item row in both sections shows up/down arrows for its amount: in the
  Search section they set how many to add, in the Selected Items section they
  adjust the amount down to a minimum of 1.
- The selection is not persisted; refreshing the page resets it to empty.
- No authentication, accounts, or multi-user features are in scope; the app is
  a single-user tool.
- The catalog is small (tens to low hundreds of items), so results are shown
  instantly and the full catalog can be listed when the query is empty.
- Costs are displayed with standard currency formatting (two decimal places)
  in Ukrainian Hryvnia (UAH).
- Target environment is modern evergreen browsers on desktop and mobile. The
  layout is mobile-first: sections stay stacked at every screen size, usable
  on small screens (~320 px and up) and comfortable on desktop (constrained
  content width).
- Search matches against both the name and the description of each test.
