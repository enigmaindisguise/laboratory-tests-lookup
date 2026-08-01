import { describe, it, expect } from 'vitest';
import { add, increment, decrement, remove, calculateTotal } from './selection';
import catalog from '../data/laboratory-tests.json';

describe('selection service', () => {
  it('add creates an entry with amount N', () => {
    expect(add({}, 't-001', 2)).toEqual({ 't-001': 2 });
  });

  it('re-adding an existing test increments its amount instead of duplicating', () => {
    const once = add({}, 't-001', 1);
    expect(add(once, 't-001', 1)).toEqual({ 't-001': 2 });
  });

  it('increment adds one to the amount', () => {
    expect(increment({ 't-001': 2 }, 't-001')).toEqual({ 't-001': 3 });
  });

  it('decrement reduces the amount by one', () => {
    expect(decrement({ 't-001': 3 }, 't-001')).toEqual({ 't-001': 2 });
  });

  it('decrement never goes below 1', () => {
    expect(decrement({ 't-001': 1 }, 't-001')).toEqual({ 't-001': 1 });
  });

  it('delete removes the entry entirely regardless of amount', () => {
    expect(remove({ 't-001': 5, 't-002': 1 }, 't-001')).toEqual({ 't-002': 1 });
  });

  it('calculateTotal sums price x amount across the selection', () => {
    const selection = add(add({}, 't-001', 2), 't-002', 1);
    expect(calculateTotal(selection, catalog)).toBe(2 * 150 + 1 * 320);
  });

  it('calculateTotal returns 0 for an empty selection', () => {
    expect(calculateTotal({}, catalog)).toBe(0);
  });
});
