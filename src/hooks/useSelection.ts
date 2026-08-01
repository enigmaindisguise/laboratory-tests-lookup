import { useMemo, useState } from 'react';
import {
  add,
  decrement,
  increment,
  remove,
  calculateTotal,
  type Selection,
} from '../services/selection';
import catalog from '../data/laboratory-tests.json';
import type { SelectedLine } from '../types/laboratory-test';

export function useSelection() {
  const [selection, setSelection] = useState<Selection>({});

  const addTest = (testId: string, amount: number) =>
    setSelection((prev) => add(prev, testId, amount));
  const incrementTest = (testId: string) => setSelection((prev) => increment(prev, testId));
  const decrementTest = (testId: string) => setSelection((prev) => decrement(prev, testId));
  const removeTest = (testId: string) => setSelection((prev) => remove(prev, testId));

  const lines = useMemo<SelectedLine[]>(
    () =>
      Object.entries(selection)
        .map(([testId, amount]) => {
          const test = catalog.find((t) => t.id === testId);
          return test ? { testId, amount, test } : null;
        })
        .filter((line): line is SelectedLine => line !== null),
    [selection],
  );

  const total = useMemo(() => calculateTotal(selection, catalog), [selection]);

  return { selection, lines, total, addTest, incrementTest, decrementTest, removeTest };
}
