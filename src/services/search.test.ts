import { describe, it, expect } from 'vitest';
import { searchTests } from './search';
import catalog from '../data/laboratory-tests.json';

describe('searchTests', () => {
  it('returns Глюкоза (8013) as the top match for "глюкоза"', () => {
    const results = searchTests('глюкоза', catalog);
    expect(results[0]?.id).toBe('8013');
  });

  it('returns all items for an empty query (browse mode)', () => {
    expect(searchTests('', catalog)).toHaveLength(catalog.length);
  });

  it('treats a whitespace-only query as empty', () => {
    expect(searchTests('   ', catalog)).toHaveLength(catalog.length);
  });

  it('returns no items for a query with no matches', () => {
    expect(searchTests('zzzz', catalog)).toHaveLength(0);
  });

  it('tolerates small typos ("глукоза" finds Глюкоза 8013)', () => {
    const results = searchTests('глукоза', catalog);
    expect(results.map((r) => r.id)).toContain('8013');
  });

  it('is tolerant to word order ("холестерин загальний" finds 8032)', () => {
    const results = searchTests('холестерин загальний', catalog);
    expect(results[0]?.id).toBe('8032');
  });

  it('matches partial words ("холесте" finds 8032)', () => {
    const results = searchTests('холесте', catalog);
    expect(results.map((r) => r.id)).toContain('8032');
  });

  it('matches against the description text ("запалення" finds 8025)', () => {
    const results = searchTests('запалення', catalog);
    expect(results.map((r) => r.id)).toContain('8025');
  });

  it('ranks items matching all query tokens above partial matches', () => {
    const results = searchTests('аналіз крові', catalog);
    expect(results[0]?.id).toBe('9028');
  });

  it('keeps catalog order for equal scores', () => {
    const results = searchTests('кров', catalog);
    const ids = results.map((r) => r.id);
    const order = ids.map((id) => catalog.findIndex((c) => c.id === id));
    expect(order).toEqual([...order].sort((a, b) => a - b));
  });
});

describe('numeric query tokens', () => {
  it('returns no items for a purely numeric query with no exact/prefix match ("1001")', () => {
    expect(searchTests('1001', catalog)).toHaveLength(0);
  });

  it('does not return resemblance matches for numeric queries (no "1081"/"1091"/"100")', () => {
    const results = searchTests('1001', catalog);
    const text = results.map((r) => `${r.title} ${r.description}`).join(' ');
    expect(text).not.toMatch(/\b(1081|1091|100)\b/);
  });

  it('matches numeric queries exactly ("25" finds the 25-OH vitamin D test 8052)', () => {
    const results = searchTests('25', catalog);
    expect(results.map((r) => r.id)).toContain('8052');
  });

  it('keeps fuzzy behavior for tokens mixing letters and digits ("D2")', () => {
    expect(searchTests('D2', catalog).length).toBeGreaterThan(0);
  });
});
