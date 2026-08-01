import type { SelectedLine } from '../types/laboratory-test';
import AmountStepper from './AmountStepper';
import { formatUah } from '../services/format';

interface SelectedItemsListProps {
  lines: SelectedLine[];
  onIncrement: (testId: string) => void;
  onDecrement: (testId: string) => void;
  onDelete: (testId: string) => void;
}

export default function SelectedItemsList({
  lines,
  onIncrement,
  onDecrement,
  onDelete,
}: SelectedItemsListProps) {
  if (lines.length === 0) {
    return <p className="text-sm text-gray-500">No items selected yet.</p>;
  }

  return (
    <ul className="max-h-80 divide-y divide-gray-100 overflow-y-auto">
      {lines.map(({ testId, amount, test }) => (
        <li key={testId} className="flex flex-wrap items-center gap-3 py-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-800">{test.title}</p>
            <p className="mt-1 text-sm text-gray-700">{formatUah(test.price)}</p>
          </div>
          <AmountStepper
            value={amount}
            onIncrement={() => onIncrement(testId)}
            onDecrement={() => onDecrement(testId)}
          />
          <button
            type="button"
            onClick={() => onDelete(testId)}
            className="rounded border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}
