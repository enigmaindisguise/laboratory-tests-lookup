import type { LaboratoryTest } from '../types/laboratory-test';

// Selection state: testId -> amount. A test appears at most once (unique-ID model).
export type Selection = Record<string, number>;

export function add(selection: Selection, testId: string, amount: number): Selection {
  return { ...selection, [testId]: (selection[testId] ?? 0) + amount };
}

export function increment(selection: Selection, testId: string): Selection {
  return { ...selection, [testId]: (selection[testId] ?? 0) + 1 };
}

export function decrement(selection: Selection, testId: string): Selection {
  const current = selection[testId] ?? 1;
  return { ...selection, [testId]: Math.max(1, current - 1) };
}

export function remove(selection: Selection, testId: string): Selection {
  const next = { ...selection };
  delete next[testId];
  return next;
}

export function calculateTotal(selection: Selection, catalog: LaboratoryTest[]): number {
  return Object.entries(selection).reduce((sum, [testId, amount]) => {
    const test = catalog.find((t) => t.id === testId);
    return test ? sum + test.price * amount : sum;
  }, 0);
}
