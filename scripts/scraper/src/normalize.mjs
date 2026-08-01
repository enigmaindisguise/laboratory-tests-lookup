// Field extraction helpers: raw value extraction + price normalization.
// Both are pure functions with no I/O (constitution IV).

/**
 * Extract a field's raw value from a matched element according to its config.
 *
 * When `fieldConfig.attr` is set, the value is read from that attribute;
 * otherwise the trimmed text content of the element is used. A missing
 * attribute or empty text yields `null` (treats the field as missing).
 *
 * @param {import('cheerio').Cheerio<Element>} el matched element
 * @param {{ selector: string, attr?: string }} fieldConfig extraction rule
 * @returns {string | null} raw value, or null when nothing was found
 */
export function extractField(el, fieldConfig) {
  if (fieldConfig.attr) {
    const attrValue = el.attr(fieldConfig.attr);
    return attrValue === undefined ? null : attrValue.trim();
  }
  const text = el.text();
  return text.trim() === '' ? null : text.trim();
}

/**
 * Normalize a price string to a non-negative integer (whole UAH).
 *
 * Everything from the last decimal separator (`,` or `.`) onward is the
 * decimal residue and is discarded; group separators and currency
 * residue (words/symbols) are stripped from the integer part. No digits
 * → null (missing field).
 *
 * @param {string | null} value raw price value
 * @returns {number | null} integer ≥ 0, or null when not numeric
 */
export function normalizePrice(value) {
  if (value == null) return null;
  const parts = String(value).split(/[,.]/);
  const integerPart = parts.length > 1 ? parts.slice(0, -1).join('') : parts[0];
  const digits = integerPart.replace(/\D/g, '');
  if (digits === '') return null;
  return Number(digits);
}
