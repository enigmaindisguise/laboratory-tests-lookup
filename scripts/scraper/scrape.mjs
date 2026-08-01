// CLI entry point: node scrape.mjs <source> [--selectors <path>] [--output <path>]
import { readFile, writeFile } from 'node:fs/promises';
import { loadSource } from './src/load-source.mjs';
import { extract, validateSelectors } from './src/extract.mjs';
import { parsePageRange, pageUrl } from './src/pages.mjs';

const DEFAULT_SELECTORS = './selectors.json';
const DEFAULT_OUTPUT = './catalog.json';

const USAGE = 'usage: node scrape.mjs <url-or-file> [<lastPage>] [--selectors <path>] [--output <path>]';

const HELP = `${USAGE}

Arguments:
  <url-or-file>  existing local HTML file path or http(s) URL; in range mode
                 an http(s) URL whose ?page=N query parameter sets the start page
  <lastPage>     optional inclusive last page to scrape (range mode)

Options:
  --selectors <path>  selector configuration file (default: ${DEFAULT_SELECTORS})
  --output <path>     output JSON file (default: ${DEFAULT_OUTPUT})
  --help              print this help and exit`;

class UsageError extends Error {}

function parseArgs(argv) {
  const positional = [];
  let selectorsPath = DEFAULT_SELECTORS;
  let outputPath = DEFAULT_OUTPUT;
  let help = false;
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') {
      help = true;
    } else if (arg === '--selectors') {
      const value = argv[i + 1];
      if (value === undefined) throw new UsageError(`missing value for --selectors`);
      selectorsPath = value;
      i += 1;
    } else if (arg === '--output') {
      const value = argv[i + 1];
      if (value === undefined) throw new UsageError(`missing value for --output`);
      outputPath = value;
      i += 1;
    } else if (arg.startsWith('--')) {
      throw new UsageError(`unknown option: ${arg}`);
    } else {
      positional.push(arg);
    }
  }
  return { positional, selectorsPath, outputPath, help };
}

async function loadSelectors(path) {
  const raw = await readFile(path, 'utf8');
  const config = JSON.parse(raw);
  validateSelectors(config);
  return config;
}

const SLEEP_MIN_MS = 5_000;
const SLEEP_MAX_MS = 10_000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Random delay in [SLEEP_MIN_MS, SLEEP_MAX_MS] to be polite to the site. */
async function randomSleep() {
  const ms = SLEEP_MIN_MS + Math.random() * (SLEEP_MAX_MS - SLEEP_MIN_MS);
  const rounded = Math.round(ms / 1000);
  console.log(`sleeping ${rounded}s…`);
  await sleep(ms);
}

/**
 * Range mode: scrape every page from the URL's start page through the
 * inclusive last page, strictly sequentially, appending each page's entries
 * to one in-memory array, and write the merged catalog once all pages
 * succeeded (FR-001…FR-012).
 *
 * @param {string} source http(s) URL carrying the start page
 * @param {string} lastPageArg inclusive last page as given on the CLI
 * @param {object} config validated selectors config
 * @param {string} outputPath merged output file
 * @returns {Promise<number>} process exit code
 */
async function scrapeRange(source, lastPageArg, config, outputPath) {
  let range;
  try {
    range = parsePageRange(source, lastPageArg);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    console.error(`Error: ${USAGE}`);
    return 1;
  }

  const entries = [];
  for (let page = range.start; page <= range.end; page += 1) {
    const url = pageUrl(source, page);
    console.log(`[page ${page}] fetched ${url}`);
    let html;
    try {
      html = await loadSource(url);
    } catch (err) {
      console.error(`Error: ${err.message}`);
      return 1;
    }
    const pageEntries = extract(html, config);
    if (pageEntries.length === 0) {
      console.error(`Error: no test data found in ${url}`);
      return 2;
    }
    for (const entry of pageEntries) {
      entries.push(entry);
      console.log(`[page ${page}] + ${entry.id} | ${entry.title} | ${entry.price} грн`);
    }
    console.log(`[page ${page}] appended ${pageEntries.length} entries (total ${entries.length})`);

    if (page < range.end) {
      await randomSleep();
    }
  }

  try {
    await writeFile(outputPath, `${JSON.stringify(entries, null, 2)}\n`);
  } catch (err) {
    console.error(`Error: failed to write ${outputPath} (${err.message})`);
    return 1;
  }

  console.log(`Extracted ${entries.length} entries (pages ${range.start}-${range.end}) → ${outputPath}`);
  return 0;
}

async function main() {
  let parsed;
  try {
    parsed = parseArgs(process.argv.slice(2));
  } catch (err) {
    console.error(`Error: ${err.message}`);
    console.error(`Error: ${USAGE}`);
    return 1;
  }

  const { positional, selectorsPath, outputPath, help } = parsed;

  if (help) {
    console.log(HELP);
    return 0;
  }

  if (positional.length < 1 || positional.length > 2) {
    console.error(`Error: ${USAGE}`);
    return 1;
  }
  const [source, lastPageArg] = positional;

  let config;
  try {
    config = await loadSelectors(selectorsPath);
  } catch {
    console.error(`Error: invalid selectors file: ${selectorsPath}`);
    return 1;
  }

  if (lastPageArg !== undefined) {
    return scrapeRange(source, lastPageArg, config, outputPath);
  }

  let html;
  try {
    html = await loadSource(source);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    return 1;
  }

  const entries = extract(html, config);
  if (entries.length === 0) {
    console.error(`Error: no test data found in ${source}`);
    return 2;
  }

  try {
    await writeFile(outputPath, `${JSON.stringify(entries, null, 2)}\n`);
  } catch (err) {
    console.error(`Error: failed to write ${outputPath} (${err.message})`);
    return 1;
  }

  console.log(`Extracted ${entries.length} entries → ${outputPath}`);
  return 0;
}

process.exit(await main());
