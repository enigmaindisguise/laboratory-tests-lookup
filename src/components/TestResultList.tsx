import { useState } from 'react';
import type { LaboratoryTest } from '../types/laboratory-test';
import AmountStepper from './AmountStepper';
import { formatUah } from '../services/format';

interface TestResultListProps {
  tests: LaboratoryTest[];
  onAdd: (testId: string, amount: number) => void;
}

export default function TestResultList({ tests, onAdd }: TestResultListProps) {
  const [amounts, setAmounts] = useState<Record<string, number>>({});

  if (tests.length === 0) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-xs font-medium uppercase tracking-wide text-gray-500">
              <th className="px-3 py-2">Назва</th>
              <th className="px-3 py-2">Опис</th>
              <th className="px-3 py-2">Ціна</th>
              <th className="px-3 py-2">Кількість</th>
              <th className="px-3 py-2">Дія</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={5} className="px-3 py-6 text-center text-sm text-gray-500">
                Нічого не знайдено
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <ul className="max-h-80 divide-y divide-gray-100 overflow-y-auto">
      {tests.map((test, index) => {
        const amount = amounts[test.id] ?? 1;
        return (
          <li key={`${test.id}-${index}`} className="flex flex-wrap items-center gap-3 py-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-800">
                {test.id} – {test.title}
              </p>
              <p className="text-xs text-gray-500">{test.description}</p>
              <p className="mt-1 text-sm text-gray-700">{formatUah(test.price)}</p>
            </div>
            <AmountStepper
              value={amount}
              onIncrement={() =>
                setAmounts((prev) => ({ ...prev, [test.id]: (prev[test.id] ?? 1) + 1 }))
              }
              onDecrement={() =>
                setAmounts((prev) => ({ ...prev, [test.id]: Math.max(1, (prev[test.id] ?? 1) - 1) }))
              }
            />
            <button
              type="button"
              onClick={() => onAdd(test.id, amount)}
              className="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              Додати
            </button>
          </li>
        );
      })}
    </ul>
  );
}
