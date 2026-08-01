// Extraction unit tests (node:test, zero dependencies).
// File name deliberately avoids the *.test.* glob so the app's root Vitest
// suite never discovers it (plan.md, Constitution Check II).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { extract } from '../src/extract.mjs';
import { normalizePrice } from '../src/normalize.mjs';

const fixtureHtml = await readFile(new URL('../fixtures/example.html', import.meta.url), 'utf8');
const discountHtml = await readFile(new URL('../fixtures/discount.html', import.meta.url), 'utf8');
const defaultConfig = JSON.parse(await readFile(new URL('../selectors.json', import.meta.url), 'utf8'));

test('extracts exactly 6 entries from the example fixture', () => {
  const entries = extract(fixtureHtml, defaultConfig);
  assert.equal(entries.length, 6);
});

test('maps the first entry fields via the default selectors', () => {
  const entries = extract(fixtureHtml, defaultConfig);
  assert.deepEqual(entries[0], {
    id: '5520',
    title: 'ПЛР РНК до коронавірусу SARS-CoV-2 (COVID-19), якісне визначення',
    description: 'Діагностичний маркер інфікування COVID-19',
    price: 630,
  });
});

test('extracts all expected ids in document order', () => {
  const entries = extract(fixtureHtml, defaultConfig);
  assert.deepEqual(
    entries.map((e) => e.id),
    ['5520', '5521', '5523', '5527а', '9075', '9079'],
  );
});

test('extracts all expected prices as integers', () => {
  const entries = extract(fixtureHtml, defaultConfig);
  assert.deepEqual(
    entries.map((e) => e.price),
    [630, 560, 250, 370, 190, 470],
  );
});

test('normalizes price strings to whole UAH integers', () => {
  assert.equal(normalizePrice('630'), 630);
  assert.equal(normalizePrice('630 грн'), 630);
  assert.equal(normalizePrice('1 250,50'), 1250);
  assert.equal(normalizePrice('0'), 0);
  assert.equal(normalizePrice('007'), 7);
  assert.equal(normalizePrice(''), null);
  assert.equal(normalizePrice('немає'), null);
  assert.equal(normalizePrice(null), null);
});

test('returns [] when the item selector matches nothing', () => {
  const noMatch = {
    item: '.does-not-exist',
    fields: {
      id: { selector: '[itemprop="url"] b' },
      title: { selector: '[itemprop="name"]' },
      description: { selector: '[itemprop="description"]' },
      price: { selector: '[itemprop="price"]', attr: 'content' },
    },
  };
  assert.deepEqual(extract(fixtureHtml, noMatch), []);
});

test('emits an entry with empty string for a missing field', () => {
  const html = `
    <table>
      <tr class="row">
        <td itemprop="url"><b>1</b></td>
        <td itemprop="name">Повний тест</td>
        <td itemprop="description">Опис</td>
        <td><meta itemprop="price" content="100"></td>
      </tr>
      <tr class="row">
        <td itemprop="url"><b>2</b></td>
        <td itemprop="name">Тест без опису</td>
        <td><meta itemprop="price" content="200"></td>
      </tr>
    </table>`;
  const config = {
    item: 'tr.row',
    fields: {
      id: { selector: '[itemprop="url"] b' },
      title: { selector: '[itemprop="name"]' },
      description: { selector: '[itemprop="description"]' },
      price: { selector: '[itemprop="price"]', attr: 'content' },
    },
  };
  const entries = extract(html, config);
  assert.equal(entries.length, 2);
  assert.deepEqual(entries[0], { id: '1', title: 'Повний тест', description: 'Опис', price: 100 });
  assert.deepEqual(entries[1], { id: '2', title: 'Тест без опису', description: '', price: 200 });
});

test('keeps entries whose fields are all missing', () => {
  const html = `
    <table>
      <tr class="row"><td>пусто</td></tr>
    </table>`;
  const config = {
    item: 'tr.row',
    fields: {
      id: { selector: '[itemprop="url"] b' },
      title: { selector: '[itemprop="name"]' },
      description: { selector: '[itemprop="description"]' },
      price: { selector: '[itemprop="price"]', attr: 'content' },
    },
  };
  const entries = extract(html, config);
  assert.equal(entries.length, 1);
  assert.deepEqual(entries[0], { id: '', title: '', description: '', price: null });
});

test('uses the regular price and ignores the discounted one', () => {
  const entries = extract(discountHtml, defaultConfig);
  assert.equal(entries.length, 2);
  assert.deepEqual(
    entries.map((e) => ({ id: e.id, price: e.price })),
    [
      { id: '1034', price: 900 },
      { id: '1035', price: 1000 },
    ],
  );
});

test('rejects a selectors config with an unknown field key', () => {
  const badConfig = {
    item: 'tr.row',
    fields: {
      id: { selector: '[itemprop="url"] b' },
      title: { selector: '[itemprop="name"]' },
      description: { selector: '[itemprop="description"]' },
      price: { selector: '[itemprop="price"]', attr: 'content' },
      extra: { selector: '.extra' },
    },
  };
  assert.throws(() => extract(fixtureHtml, badConfig), /unknown field key "extra"/);
});

test('rejects a selectors config missing a required field', () => {
  const badConfig = {
    item: 'tr.row',
    fields: {
      id: { selector: '[itemprop="url"] b' },
      title: { selector: '[itemprop="name"]' },
      description: { selector: '[itemprop="description"]' },
    },
  };
  assert.throws(() => extract(fixtureHtml, badConfig), /missing required field "price"/);
});
