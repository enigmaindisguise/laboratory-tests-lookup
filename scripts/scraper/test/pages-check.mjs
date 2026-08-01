// Page-range unit tests (node:test, zero dependencies).
// File name deliberately avoids the *.test.* glob so the app's root Vitest
// suite never discovers it (plan.md, Constitution Check II).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parsePageRange, pageUrl } from '../src/pages.mjs';

const BASE = 'https://example.org/analize';

test('parsePageRange reads the start page from the page query parameter', () => {
  assert.deepEqual(parsePageRange(`${BASE}?page=2`, '3'), { start: 2, end: 3 });
});

test('parsePageRange defaults the start page to 1 when page is absent', () => {
  assert.deepEqual(parsePageRange(BASE, '2'), { start: 1, end: 2 });
});

test('parsePageRange accepts a one-page range (end === start)', () => {
  assert.deepEqual(parsePageRange(`${BASE}?page=2`, '2'), { start: 2, end: 2 });
});

test('parsePageRange rejects a non-http(s) source', () => {
  assert.throws(() => parsePageRange('fixtures/example.html', '3'), /http/);
  assert.throws(() => parsePageRange('ftp://example.org/analize', '3'), /http/);
});

test('parsePageRange rejects a non-numeric page parameter', () => {
  assert.throws(() => parsePageRange(`${BASE}?page=abc`, '3'), /invalid page parameter/);
});

test('parsePageRange rejects a zero last page', () => {
  assert.throws(() => parsePageRange(BASE, '0'), /invalid last page/);
});

test('parsePageRange rejects a negative last page', () => {
  assert.throws(() => parsePageRange(BASE, '-1'), /invalid last page/);
});

test('parsePageRange rejects a fractional last page', () => {
  assert.throws(() => parsePageRange(BASE, '1.5'), /invalid last page/);
});

test('parsePageRange rejects a non-numeric last page', () => {
  assert.throws(() => parsePageRange(BASE, 'abc'), /invalid last page/);
});

test('parsePageRange rejects an inverted range (end < start)', () => {
  assert.throws(() => parsePageRange(`${BASE}?page=2`, '1'), /inverted range/);
});

test('pageUrl advances only the page parameter', () => {
  assert.equal(pageUrl(`${BASE}?page=2`, 3), `${BASE}?page=3`);
});

test('pageUrl preserves other query parameters', () => {
  assert.equal(pageUrl(`${BASE}?category=x&page=2`, 4), `${BASE}?category=x&page=4`);
});

test('pageUrl appends ?page=N when the URL has no query string', () => {
  assert.equal(pageUrl(BASE, 3), `${BASE}?page=3`);
});
