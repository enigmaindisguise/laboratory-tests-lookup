// Pure page-range helpers: deriving the inclusive start/end pages from the
// CLI arguments and advancing a URL's page parameter. No I/O (constitution
// IV) — the CLI layer owns file/network access.
const HTTP_SOURCE = /^https?:\/\//i;
const WHOLE_NUMBER = /^\d+$/;

/**
 * Parse the two positional arguments into an inclusive page range.
 *
 * The start page is read from the URL's `page` query parameter (default 1
 * when absent); the last page must be a positive whole number ≥ start.
 * Range mode requires an http(s) URL source (FR-004).
 *
 * @param {string} source http(s) URL carrying the start page
 * @param {string} lastPageArg inclusive last page as given on the CLI
 * @returns {{ start: number, end: number }}
 * @throws {Error} describing the first invalid aspect
 */
export function parsePageRange(source, lastPageArg) {
  if (!HTTP_SOURCE.test(source)) {
    throw new Error(`range mode requires an http(s) URL: ${source}`);
  }
  let url;
  try {
    url = new URL(source);
  } catch {
    throw new Error(`invalid URL: ${source}`);
  }
  const start = parseStartPage(url);
  const end = parseLastPage(lastPageArg);
  if (end < start) {
    throw new Error(`inverted range: last page ${end} is before start page ${start}`);
  }
  return { start, end };
}

function parseStartPage(url) {
  const raw = url.searchParams.get('page');
  if (raw === null) return 1;
  if (!WHOLE_NUMBER.test(raw)) {
    throw new Error(`invalid page parameter in ${url.href}: "${raw}" (expected a whole number)`);
  }
  const start = Number(raw);
  if (start < 1) {
    throw new Error(`invalid page parameter in ${url.href}: "${raw}" (expected a page number ≥ 1)`);
  }
  return start;
}

function parseLastPage(arg) {
  const raw = String(arg).trim();
  if (!WHOLE_NUMBER.test(raw)) {
    throw new Error(`invalid last page: "${arg}" (expected a positive whole number)`);
  }
  const end = Number(raw);
  if (end < 1) {
    throw new Error(`invalid last page: "${arg}" (expected a positive whole number)`);
  }
  return end;
}

/**
 * Return the URL with its `page` query parameter set to `page`, preserving
 * every other part of the URL (scheme, host, path, other query params).
 *
 * @param {string} source base URL
 * @param {number} page page number to advance to
 * @returns {string} advanced URL
 */
export function pageUrl(source, page) {
  const url = new URL(source);
  url.searchParams.set('page', String(page));
  return url.toString();
}
