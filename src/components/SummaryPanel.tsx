import { formatUah } from '../services/format';

interface SummaryPanelProps {
  total: number;
}

export default function SummaryPanel({ total }: SummaryPanelProps) {
  return (
    <div className="flex items-center justify-between border-t border-gray-200 pt-3">
      <span className="text-sm font-medium text-gray-700">Загальна вартість</span>
      <span className="text-base font-semibold text-gray-900">{formatUah(total)}</span>
    </div>
  );
}
