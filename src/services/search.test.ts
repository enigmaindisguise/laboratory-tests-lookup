import { describe, it, expect } from 'vitest';
import { searchTests } from './search';
import catalog from '../data/laboratory-tests.json';

describe('searchTests', () => {
  it('returns t-001 as the top match for "blood sugar"', () => {
    const results = searchTests('blood sugar', catalog);
    expect(results[0]?.id).toBe('t-001');
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

  it('tolerates small typos ("glocose" finds t-001)', () => {
    const results = searchTests('glocose', catalog);
    expect(results.map((r) => r.id)).toContain('t-001');
  });

  it('is tolerant to word order ("sugar blood" finds t-001)', () => {
    const results = searchTests('sugar blood', catalog);
    expect(results[0]?.id).toBe('t-001');
  });

  it('matches partial words ("chol" finds t-003)', () => {
    const results = searchTests('chol', catalog);
    expect(results.map((r) => r.id)).toContain('t-003');
  });

  it('matches against the description text ("inflammation marker" finds t-008)', () => {
    const results = searchTests('inflammation marker', catalog);
    expect(results.map((r) => r.id)).toContain('t-008');
  });

  it('ranks items matching all query tokens above partial matches', () => {
    const results = searchTests('blood count', catalog);
    expect(results[0]?.id).toBe('t-002');
  });

  it('keeps catalog order for equal scores', () => {
    const results = searchTests('blood', catalog);
    const ids = results.map((r) => r.id);
    const order = ids.map((id) => catalog.findIndex((c) => c.id === id));
    expect(order).toEqual([...order].sort((a, b) => a - b));
  });
});
