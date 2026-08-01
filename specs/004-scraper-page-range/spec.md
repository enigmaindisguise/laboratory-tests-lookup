# Feature Specification: Scraper Page Range

**Feature Branch**: `004-scraper-page-range`

**Created**: 2026-08-01

**Status**: Draft

**Input**: User description: "Let's extends scraper feature. I want to add support for pages. I'll provide a link like \"https://foo.ua/analize?page=2\" with page from which I want to start scraping data. Second argument will be last page that should be scraped. Don't change anything outside ./scripts/scraper."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Scrape a Range of Pages into One Dataset (Priority: P1)

A developer needs the laboratory price list that is split across several
pages of a website. They run the command-line tool from their terminal,
passing the URL of the page where scraping should start (for example,
`https://foo.ua/analize?page=2`) as the first argument and the number of the
last page to scrape (for example, `5`) as the second argument. The tool
fetches every page from the start page through the last page, extracts one
entry per laboratory test from each page, merges all entries into a single
dataset in the application's catalog format, and reports what it did.

**Why this priority**: This is the core value of the extension — one run
covers the whole price list instead of one run per page. Without it the
extension has no purpose.

**Independent Test**: Can be fully tested by running the tool with a
known multi-page price-list URL and a last-page number, and confirming the
output contains every test name and price from every page in the range, in
the application's catalog format. Delivers the value of automated
multi-page catalog extraction without any error-handling refinements.

**Acceptance Scenarios**:

1. **Given** the URL `https://foo.ua/analize?page=2` and the last-page
   argument `5`, **When** the tool is run, **Then** it fetches pages 2, 3,
   4, and 5 and produces one entry per laboratory test listed on each page.
2. **Given** each of pages 2–5 lists 40 tests, **When** the tool finishes,
   **Then** the output contains exactly 160 entries, with names and prices
   matching the pages.
3. **Given** a dataset produced from multiple pages, **When** the
   application's catalog is updated with it, **Then** the application loads
   it without errors.

---

### User Story 2 - Single-Page Usage Still Works (Priority: P2)

A developer who does not need pagination keeps using the tool exactly as
before: one URL (or one local HTML file) as the single argument. The
extension must not change this behavior — same extraction, same output
format, same summary, same exit codes.

**Why this priority**: Backward compatibility protects existing usage and
existing validation flows (e.g., offline checks against a local file), but
it adds no new capability, so it ranks below the core range-scraping story.

**Independent Test**: Can be fully tested by running the tool with a single
URL argument and with a single local file argument, and confirming the
behavior matches the pre-extension behavior (extraction, output file,
summary line, exit codes).

**Acceptance Scenarios**:

1. **Given** a single URL argument, **When** the tool is run, **Then** it
   behaves exactly as before this extension: fetches that one page, extracts
   one entry per test, writes the output file, prints the summary, and exits
   with the same codes.
2. **Given** a single local file argument, **When** the tool is run, **Then**
   it reads the file from disk and behaves exactly as before this extension.

---

### User Story 3 - Clear Errors for Invalid Ranges and Failed Pages (Priority: P2)

A developer supplies an unusable page range, or one of the pages in the
range cannot be scraped. In every failure case the tool reports a clear,
human-readable message naming the offending page or argument and exits with
a failure code — it never silently scrapes a partial range or writes a
misleading output file.

**Why this priority**: A range scrape that silently stops early would
produce an incomplete catalog without the developer noticing, so clear
failure reporting is essential; it still ranks after the happy path.

**Independent Test**: Can be fully tested by running the tool with a
non-numeric last page, an inverted range (last page smaller than the start
page), a local file combined with a last page, a range containing an
unreachable page, and a range containing a page with no extractable tests;
each run must end with a readable message and a non-zero exit code.

**Acceptance Scenarios**:

1. **Given** a last-page argument that is not a positive whole number,
   **When** the tool is run, **Then** it prints usage instructions and exits
   with a non-zero code.
2. **Given** a last-page argument smaller than the page indicated in the URL
   (e.g., URL `?page=5`, last page `2`), **When** the tool is run, **Then**
   it prints a clear error and exits with a non-zero code.
3. **Given** a local file path as the source together with a last-page
   argument, **When** the tool is run, **Then** it prints a clear error and
   exits with a non-zero code.
4. **Given** a range in which one page cannot be fetched (unreachable host,
   timeout, HTTP error), **When** the tool is run, **Then** it prints a
   clear error naming that page, exits with a non-zero code, and does not
   write the output file.
5. **Given** a range in which one page contains no extractable test data,
   **When** the tool is run, **Then** it prints a clear error naming that
   page and exits with the dedicated "no data" code, without writing the
   output file.

---

### User Story 4 - Run Summary Covers the Whole Range (Priority: P3)

After a successful range scrape, a developer sees a one-line summary stating
how many entries were extracted in total, which pages were covered, and
where the merged output went.

**Why this priority**: Polishes the developer experience but adds no
scraping capability, so it ranks last.

**Independent Test**: Can be fully tested by running a successful range
scrape and confirming the summary line contains the total entry count, the
page range, and the output location.

**Acceptance Scenarios**:

1. **Given** a successful scrape of pages 2–5 yielding 160 entries, **When**
   the tool finishes, **Then** it prints a one-line summary with the total
   entry count, the page range covered, and the output location.

---

### Edge Cases

- The last-page argument equals the start page (a range of exactly one
  page — must scrape only that page).
- The last-page argument is smaller than the start page (inverted range).
- The last-page argument is not a positive whole number (zero, negative,
  fractional, or non-numeric).
- The URL has no page indicator (treated as page 1).
- The URL's page indicator has a non-numeric value (e.g., `?page=abc`).
- The URL's page indicator is combined with other query parameters (e.g.,
  `?category=x&page=2`) — the other parameters must be preserved when
  advancing to the next page.
- A page in the middle of the range fails to fetch while earlier pages
  succeeded.
- A page in the middle of the range contains no extractable test data.
- A local file path is combined with a last-page argument.
- The same test appears on more than one page (entries are preserved, not
  merged).
- A very large range (dozens of pages).
- The site's actual last page comes before the requested last page, so the
  tail of the range consists of empty or error pages.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The tool MUST accept one or two positional arguments: a source
  (an http(s) URL or a local file path) and, when provided, the number of
  the last page to scrape.
- **FR-002**: The tool MUST print usage instructions and exit with a non-zero
  code when invoked with no argument, with more than two arguments, or with
  a last-page argument that is not a positive whole number.
- **FR-003**: When the last page number is smaller than the start page, the
  tool MUST report a clear error and exit with a non-zero code.
- **FR-004**: Pagination (a provided last-page argument) requires the source
  to be an http(s) URL; a local file path combined with a last-page argument
  MUST be rejected as a usage error.
- **FR-005**: The start page MUST be taken from the page indicator in the
  provided URL (e.g., `?page=2` means start at page 2); a URL without a page
  indicator MUST be treated as page 1.
- **FR-006**: The tool MUST fetch every page from the start page through the
  last page, inclusive, deriving each next page by advancing the page
  indicator by one while preserving all other parts of the URL (scheme,
  host, path, and any other query parameters).
- **FR-007**: For each fetched page, the tool MUST extract one entry per
  laboratory test listed on that page (id, name, description, price), using
  the same extraction behavior as single-page mode.
- **FR-008**: The tool MUST write a single output file containing the merged
  entries of all fetched pages, in the application's catalog format.
- **FR-009**: When any page in the range cannot be fetched (unreachable
  host, timeout, or HTTP error), the tool MUST report a clear error naming
  that page, exit with a non-zero code, and NOT write the output file.
- **FR-010**: When a page in the range contains no extractable test data,
  the tool MUST report a clear error naming that page, exit with the
  dedicated "no data" code (distinct from fetch and usage error codes), and
  NOT write the output file.
- **FR-011**: The tool MUST preserve every entry of every page, including
  entries that appear on more than one page, without merging or
  deduplication.
- **FR-012**: After a successful range scrape, the tool MUST print a one-line
  summary with the total number of entries, the page range covered, and the
  output location.
- **FR-013**: Invoking the tool with a single argument MUST behave exactly as
  before this extension: same extraction, same output format, same summary,
  same exit codes.
- **FR-014**: The change MUST be fully contained within the
  `scripts/scraper` directory; no file outside that directory MAY require
  modification for this feature to work.

### Key Entities *(include if feature involves data)*

- **LaboratoryTest** (existing): the catalog entry — `id` (unique), `price`
  (integer UAH ≥ 0), `title`, `description`. Scraped entries must map onto
  this entity so the application can consume them unchanged.
- **ScrapedEntry** (existing): one extraction result per test listed on a
  page, with an `id`, `title`, `description`, and `price` — the same shape
  as the application's `LaboratoryTest` catalog entry.
- **PageRange** (new): the ordered set of pages to scrape — a start page
  derived from the provided URL's page indicator (default 1) and an
  inclusive last page given as the second argument. A valid range always
  contains at least one page.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Running the tool against a price list split across pages 2–5
  (40 tests per page) yields exactly 160 entries, with ids, names,
  descriptions, and prices matching the pages, in the application's catalog
  format, within 2 minutes.
- **SC-002**: Every single-argument invocation produces behavior identical
  to the pre-extension version (no regressions in single-page scraping).
- **SC-003**: Invalid range inputs (non-numeric last page, inverted range,
  file path combined with a last page) produce a clear error message and a
  non-zero exit code within 10 seconds of invocation.
- **SC-004**: A dataset produced from multiple pages loads directly as the
  application's catalog without errors (100% of records valid).
- **SC-005**: A developer can refresh the catalog from a multi-page price
  list in a single run, without manually merging page outputs or retyping a
  single test name or price.

## Assumptions

- The start page is encoded in the URL's `page` query parameter, as in the
  user's example (`https://foo.ua/analize?page=2`); a URL without a page
  parameter is treated as page 1.
- The page indicator is named `page` in every URL of the range; all other
  parts of the URL (including other query parameters) are preserved
  unchanged when advancing to the next page.
- Pagination applies only to http(s) URLs; local files remain single-source
  sources, matching current behavior.
- The user-provided last page is authoritative: the tool fetches exactly the
  requested range and does not probe for an earlier end of pagination.
- Any page in the range that yields no extractable data is treated as an
  error naming that page, consistent with the existing single-page "no data"
  behavior.
- Entries are preserved exactly as extracted; tests appearing on more than
  one page are kept as separate entries, consistent with existing behavior.
- Pages are fetched sequentially with no artificial delay between requests;
  a failed page aborts the whole run and no output file is written (the
  tool writes output only after the entire range succeeds).
- **Scope**: all implementation changes are confined to `scripts/scraper`
  (including its tests); no other files in the repository are modified by
  this feature. Contract documentation living outside that directory is
  updated separately, if at all, outside this feature's change set.
- The extraction selector configuration is reused unchanged from the
  existing `--selectors` option.
- The tool remains developer authoring tooling running on a developer's
  machine; it is not part of the deployed application and does not conflict
  with the frontend-only principle of the constitution.
