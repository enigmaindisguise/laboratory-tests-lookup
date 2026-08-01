interface AmountStepperProps {
  value: number;
  min?: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

export default function AmountStepper({
  value,
  min = 1,
  onIncrement,
  onDecrement,
}: AmountStepperProps) {
  const canDecrement = value > min;

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={onDecrement}
        disabled={!canDecrement}
        aria-label="Зменшити кількість"
        className="flex h-7 w-7 items-center justify-center rounded border border-gray-300 text-gray-700 enabled:hover:bg-gray-100 disabled:opacity-40"
      >
        −
      </button>
      <span className="w-6 text-center text-sm font-medium text-gray-800" data-testid="amount-value">
        {value}
      </span>
      <button
        type="button"
        onClick={onIncrement}
        aria-label="Збільшити кількість"
        className="flex h-7 w-7 items-center justify-center rounded border border-gray-300 text-gray-700 enabled:hover:bg-gray-100"
      >
        +
      </button>
    </div>
  );
}
