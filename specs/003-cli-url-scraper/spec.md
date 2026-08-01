# Feature Specification: CLI URL Scraper

**Feature Branch**: `003-cli-url-scraper`

**Created**: 2026-08-01

**Status**: Draft

**Input**: User description: "Let's create a script that can be run in CLI. It should receive an URL that should be scrapped as an argument."

## Clarifications

### Session 2026-08-01

- Q: What should the tool produce after scraping the page? → A: A data file in the application's catalog format — one entry per test.
- Q: What fields does the tool extract and how are selectors provided? → A: Each entry carries id, title, description, and price (validated against the attached example document: exactly 6 entries); selectors come from a developer-provided configuration file and may target the page's HTML structure only.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Scrape a Lab Price List into the Catalog Data (Priority: P1)

A developer wants to refresh the laboratory test catalog used by the
application. They run the command-line tool from their terminal, passing a
single URL of a laboratory price-list page as the argument. The tool fetches
the page, extracts one entry per laboratory test (name and price), and
produces a dataset in the same format the application's catalog uses. The
developer reviews the dataset and adds it to the application.

**Why this priority**: This is the core value of the feature — turning a web
page into catalog data automatically instead of typing each test by hand.
Without it the tool has no purpose.

**Independent Test**: Can be fully tested by running the tool with a known
laboratory price-list URL and confirming the output contains every test name
and price shown on the page, in the application's catalog format. Delivers
the value of automated catalog data extraction without any error-handling
features.

**Acceptance Scenarios**:

1. **Given** a valid price-list URL, **When** the tool is run with that URL
   as its only argument, **Then** it fetches the page and produces one entry
   per laboratory test listed on it.
2. **Given** the page lists 40 tests, **When** the tool finishes, **Then**
   the output contains exactly 40 entries with names and prices matching the
   page.
3. **Given** a produced dataset, **When** the application's catalog is
   updated with it, **Then** the application loads it without errors.

---

### User Story 2 - Clear Errors Instead of Silent Failures (Priority: P2)

A developer runs the tool incorrectly, or the URL is unreachable, or the page
contains no price list. In every failure case the tool reports a clear,
human-readable message and exits with a failure code — it never hangs
silently, crashes without explanation, or produces garbage output.

**Why this priority**: Error handling makes the tool trustworthy, but the
happy path (User Story 1) already delivers the core value on its own, so this
slice is second.

**Independent Test**: Can be fully tested by running the tool with no
argument, with a malformed URL, with an unreachable URL, and with a URL of a
page that has no extractable tests; each run must end with a readable
message and a non-zero exit code.

**Acceptance Scenarios**:

1. **Given** the tool is invoked with no argument, **When** it runs, **Then**
   it prints usage instructions (how to invoke it, what the argument is).
2. **Given** a malformed URL (no scheme, invalid syntax), **When** the tool
   is run, **Then** it prints a clear error and exits with a non-zero code.
3. **Given** a URL that cannot be reached, **When** the tool is run, **Then**
   it prints a clear error within a short time (it does not hang
   indefinitely) and exits with a non-zero code.
4. **Given** a reachable page that contains no extractable test data, **When**
   the tool is run, **Then** it reports that no test data was found and exits
   with a non-zero code.

---

### User Story 3 - Help and Run Summary (Priority: P3)

A developer wants to know how to use the tool, and after a successful run
wants a quick confirmation of what happened. Running the tool with a help
flag prints usage instructions. After a successful run the tool prints a
one-line summary stating how many entries were extracted and where the output
went.

**Why this priority**: Polishes the developer experience but adds no
extraction capability, so it ranks last.

**Independent Test**: Can be fully tested by running the tool with the help
flag (usage is printed) and by running a successful scrape (a summary line
with entry count and output location is printed).

**Acceptance Scenarios**:

1. **Given** the tool is run with the help flag, **When** it runs, **Then**
   usage instructions are printed.
2. **Given** a successful scrape, **When** the tool finishes, **Then** it
   prints a one-line summary with the number of entries extracted and the
   location of the output.

---

### Edge Cases

- No argument, more than one argument, or the help flag is passed.
- URL is malformed: missing scheme, invalid characters, empty string.
- Host is unreachable, connection times out, or the server returns an HTTP
  error status.
- Page loads but contains no list of tests with prices (e.g., a landing page,
  an article).
- A test name appears more than once on the page.
- Prices are formatted with currency symbols, thousands separators, decimals,
  or a comma as the decimal separator (e.g., "1 250,50 грн").
- A listed entry is missing one of its four fields (id, title, description,
  or price).
- The selector configuration matches no elements on the page.
- The page is very large (hundreds of tests) or slow to load.
- The URL redirects to another address before the content is served.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The tool MUST accept exactly one URL as its positional
  argument.
- **FR-002**: The tool MUST print usage instructions when invoked with no
  argument, with more than one argument, or with the help flag.
- **FR-003**: The tool MUST reject a malformed URL (missing scheme or invalid
  syntax) with a clear error message and a non-zero exit code.
- **FR-004**: When the page cannot be fetched (unreachable host, timeout, or
  HTTP error), the tool MUST report a clear error and exit with a non-zero
  code.
- **FR-005**: The tool MUST extract one entry per laboratory test listed on
  the page, each entry containing the test's id, name, description, and
  price.
- **FR-006**: The tool MUST interpret prices with common formatting (currency
  symbols, spaces, decimals) and record them as plain whole-number values in
  UAH, consistent with the application's catalog.
- **FR-007**: The tool MUST write the scraped results to a data file in the
  application's catalog format, with one entry per test containing the
  test's id, name, description, and price, extracted via the user-provided
  selectors.
- **FR-008**: When the page contains no extractable test data, the tool MUST
  report that no test data was found and exit with a non-zero code distinct
  from network/URL error codes.
- **FR-009**: The tool MUST NOT modify the application's catalog itself; the
  produced data is always for developer review before inclusion.
- **FR-010**: The tool MUST preserve every test listed on the page, including
  repeated names, as separate entries.
- **FR-011**: After a successful run the tool MUST print a one-line summary
  with the number of entries extracted and the location of the output.
- **FR-012**: The tool MUST read the extraction selectors from a
  user-provided configuration file; selectors MUST target the page's HTML
  structure (element types, classes, attributes) only.

### Key Entities *(include if feature involves data)*

- **LaboratoryTest** (existing): the catalog entry — `id` (unique), `price`
  (integer UAH ≥ 0), `title`, `description`. Scraped entries must map onto
  this entity so the application can consume them unchanged.
- **ScrapedEntry** (new): one extraction result per test listed on the
  page, with an `id`, `title`, `description`, and `price` — the same shape
  as the application's `LaboratoryTest` catalog entry. Page identifiers are
  used as entry ids.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Running the tool against the attached example document (or the
  live page it was captured from) yields exactly 6 entries with ids, names,
  descriptions, and prices matching the document, in the application's
  catalog format, within 1 minute.
- **SC-002**: A malformed or unreachable URL produces a clear error message
  and a non-zero exit code within 10 seconds of invocation.
- **SC-003**: A dataset produced by the tool loads directly as the
  application's catalog without errors (100% of records valid).
- **SC-004**: A developer can complete a full catalog refresh (run the tool,
  review the output, include it) without manually retyping a single test name
  or price.

## Assumptions

- The tool is developer authoring tooling: it runs on a developer's machine
  at authoring time and is not part of the deployed application. It never
  runs in the browser or on a server, so it does not conflict with the
  frontend-only principle of the constitution (which governs the application
  runtime).
- The primary target pages are laboratory price lists: a list of test names
  with prices in UAH. The tool may be pointed at any URL; extraction from
  pages that are not price lists is best-effort.
- Prices are recorded as whole hryvnias (integer UAH), consistent with the
  existing catalog.
- Produced data is reviewed by the developer before inclusion; the tool never
  writes into the application's catalog automatically.
- Extraction selectors are supplied by the developer in a configuration
  file; the tool does not hard-code page-specific knowledge beyond the
  structure described by those selectors.
- Page identifiers are reused as entry ids; the developer may remap them
  when merging scraped data into the application catalog.
