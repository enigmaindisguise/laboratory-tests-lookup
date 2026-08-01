// Source loading: read HTML from a local file path or fetch an http(s) URL.
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const FETCH_TIMEOUT_MS = 10_000;

/**
 * Load the HTML source for scraping.
 *
 * Auto-detection: an existing local file path is read from disk (UTF-8);
 * anything else must be an http(s) URL and is fetched with a 10 s timeout.
 *
 * @param {string} source file path or URL
 * @returns {Promise<string>} the HTML document
 * @throws {Error} with a clear, user-facing message on any failure
 */
export async function loadSource(source) {
  if (existsSync(source)) {
    return readFile(source, 'utf8');
  }
  if (/^https?:\/\//i.test(source)) {
    return fetchUrl(source);
  }
  throw new Error(`invalid URL: ${source}`);
}

async function fetchUrl(url) {
  let response;
  try {
    response = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
  } catch (err) {
    if (err.name === 'TimeoutError' || err.name === 'AbortError') {
      throw new Error(`failed to fetch ${url} (fetch timed out)`);
    }
    throw new Error(`failed to fetch ${url} (${err.message})`);
  }
  if (!response.ok) {
    throw new Error(`failed to fetch ${url} (HTTP ${response.status})`);
  }
  return response.text();
}
