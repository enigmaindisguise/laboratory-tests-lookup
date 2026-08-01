import { describe, it, expect } from 'vitest';
import { formatUah } from './format';

describe('formatUah', () => {
  it('formats 0 as "0,00 ₴"', () => {
    expect(formatUah(0)).toBe('0,00\u00a0₴');
  });

  it('formats 150 as "150,00 ₴"', () => {
    expect(formatUah(150)).toBe('150,00\u00a0₴');
  });

  it('formats 1234 with a thousands separator as "1 234,00 ₴"', () => {
    expect(formatUah(1234)).toBe('1\u00a0234,00\u00a0₴');
  });

  it('formats a large amount with grouped thousands', () => {
    expect(formatUah(1234567)).toBe('1\u00a0234\u00a0567,00\u00a0₴');
  });

  it('formats negative input with a leading minus sign', () => {
    expect(formatUah(-150)).toBe('-150,00\u00a0₴');
  });
});
