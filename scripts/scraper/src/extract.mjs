// Extraction: pure `extract(html, config) → entries[]` via cheerio.
// No I/O — the CLI layer owns file/network access (constitution IV).
import * as cheerio from 'cheerio';
import { extractField, normalizePrice } from './normalize.mjs';

const REQUIRED_FIELDS = ['id', 'title', 'description', 'price'];

/**
 * Validate a selector configuration against the data contract.
 *
 * `fields` must contain exactly `id`, `title`, `description`, `price`;
 * unknown keys are rejected (invalid config → exit 1 in the CLI).
 *
 * @param {unknown} config parsed selectors.json value
 * @returns {void}
 * @throws {Error} describing the first invalid aspect
 */
export function validateSelectors(config) {
  if (config == null || typeof config !== 'object' || Array.isArray(config)) {
    throw new Error('selectors config must be an object');
  }
  if (typeof config.item !== 'string' || config.item.trim() === '') {
    throw new Error('selectors config requires a non-empty "item" selector');
  }
  if (config.fields == null || typeof config.fields !== 'object' || Array.isArray(config.fields)) {
    throw new Error('selectors config requires a "fields" object');
  }
  const keys = Object.keys(config.fields);
  for (const key of keys) {
    if (!REQUIRED_FIELDS.includes(key)) {
      throw new Error(`unknown field key "${key}" in selectors config`);
    }
  }
  for (const key of REQUIRED_FIELDS) {
    if (!keys.includes(key)) {
      throw new Error(`selectors config is missing required field "${key}"`);
    }
    const field = config.fields[key];
    if (field == null || typeof field !== 'object' || typeof field.selector !== 'string' || field.selector.trim() === '') {
      throw new Error(`field "${key}" requires a non-empty "selector"`);
    }
    if (field.attr !== undefined && typeof field.attr !== 'string') {
      throw new Error(`field "${key}" "attr" must be a string`);
    }
  }
}

/**
 * Extract catalog entries from HTML using a selector configuration.
 *
 * Each `config.item` match becomes one entry; field selectors are resolved
 * relative to the item. Every matched item is emitted: missing fields fall
 * back to `''` (text) or `null` (price) instead of dropping the entry, so
 * a row that lacks, say, a description still lands in the catalog.
 * Returns `[]` only when no items match (caller reports "no test data found").
 *
 * @param {string} html source document
 * @param {{ item: string, fields: Record<string, { selector: string, attr?: string }> }} config
 * @returns {Array<{ id: string, title: string, description: string, price: number | null }>}
 */
export function extract(html, config) {
  validateSelectors(config);
  const $ = cheerio.load(html);
  const items = $(config.item);
  if (items.length === 0) return [];

  const entries = [];
  items.each((_, itemEl) => {
    const $item = $(itemEl);
    const entry = {};
    for (const key of REQUIRED_FIELDS) {
      const fieldConfig = config.fields[key];
      const raw = extractField($item.find(fieldConfig.selector).first(), fieldConfig);
      const value = key === 'price' ? normalizePrice(raw) : raw;
      entry[key] = value ?? (key === 'price' ? null : '');
    }
    entries.push(entry);
  });
  return entries;
}
