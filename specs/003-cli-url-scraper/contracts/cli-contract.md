# CLI Contract: scraper

The command-line interface of the scraping tool (`scripts/scraper/scrape.mjs`).
Source of truth for invocation, arguments, output, and exit codes (spec
FR-001…FR-004, FR-008, FR-011).

## Invocation

```text
node scrape.mjs <source> [--selectors <path>] [--output <path>] [--help]
```

### Positional argument: `<source>`

Exactly one source is required (FR-001):

- If `<source>` is a path to an **existing local file**, its HTML is read
  from disk (used for offline validation, e.g. the fixture).
- Otherwise `<source>` must be an **http(s) URL**; the page is fetched with
  Node's built-in `fetch` and a 10-second timeout.

### Options

| Option | Default | Description |
|--------|---------|-------------|
| `--selectors <path>` | `./selectors.json` | Selector configuration file (see [data-contract.md](./data-contract.md)) |
| `--output <path>` | `./catalog.json` | Output JSON file (app catalog format) |
| `--help` | — | Print usage and exit 0 |

More than one positional argument is a usage error (FR-002).

## Exit codes

| Code | Meaning |
|------|---------|
| 0 | Success — output file written, summary printed |
| 1 | Usage error (missing/extra arguments, invalid `--selectors` JSON, malformed URL), network/fetch failure (unreachable host, timeout, HTTP error), or internal error |
| 2 | Source fetched/read successfully but no extractable test data found (FR-008 — distinct from code 1) |

## Output

- **stdout**: on success, a one-line summary
  `Extracted N entries → <output path>`; on `--help`, usage text. Nothing
  else is printed to stdout (so `> file` piping stays clean).
- **stderr**: all error messages, prefixed with `Error:`.
- **Output file**: pretty-printed JSON array of entries, one per test
  (FR-007):
  ```json
  [
    {
      "id": "5520",
      "title": "ПЛР РНК до коронавірусу SARS-CoV-2 (COVID-19), якісне визначення",
      "description": "Діагностичний маркер інфікування COVID-19",
      "price": 630
    }
  ]
  ```

## Error messages (examples)

| Scenario | stderr | Exit |
|----------|--------|------|
| No argument | `Error: usage: node scrape.mjs <url-or-file> [--selectors <path>] [--output <path>]` | 1 |
| Malformed URL | `Error: invalid URL: not-a-url` | 1 |
| Unreachable host / timeout / HTTP error | `Error: failed to fetch <url> (HTTP 404)` / `… (fetch timed out)` | 1 |
| Selector config invalid | `Error: invalid selectors file: <path>` | 1 |
| No matches | `Error: no test data found in <source>` | 2 |
| Missing fields (warning, not error) | `Warning: skipped 1 entry(s)` | 0 |

## Examples

```bash
# Validate offline against the attached example document (expect 6 entries)
node scrape.mjs fixtures/example.html

# Scrape a live price-list URL, custom config and output path
node scrape.mjs https://example.org/prices --selectors my-selectors.json --output out/catalog.json

# Custom output location
node scrape.mjs https://example.org/prices --output data/tests.json
```

## Contract notes

- The tool NEVER writes into the application catalog automatically
  (FR-009); it only writes the file given by `--output`.
- Auto-detection of file vs. URL is intentional (research.md §5): a URL can
  never be an existing local file path, so the behavior is unambiguous.
