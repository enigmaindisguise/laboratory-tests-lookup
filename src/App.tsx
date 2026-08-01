import SearchBar from './components/SearchBar';
import TestResultList from './components/TestResultList';
import SelectedItemsList from './components/SelectedItemsList';
import SummaryPanel from './components/SummaryPanel';
import { useSearch } from './hooks/useSearch';
import { useSelection } from './hooks/useSelection';

export default function App() {
  const { query, setQuery, results } = useSearch();
  const { lines, total, addTest, incrementTest, decrementTest, removeTest } = useSelection();

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <h1 className="text-xl font-semibold text-gray-800">Laboratory Tests Lookup</h1>

        <section className="rounded-lg bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-base font-semibold text-gray-700">Search &amp; Result Set</h2>
          <SearchBar query={query} onQueryChange={setQuery} />
          <div className="mt-3">
            <TestResultList tests={results} onAdd={addTest} />
          </div>
        </section>

        <section className="rounded-lg bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-base font-semibold text-gray-700">Selected Items</h2>
          <SelectedItemsList
            lines={lines}
            onIncrement={incrementTest}
            onDecrement={decrementTest}
            onDelete={removeTest}
          />
          <SummaryPanel total={total} />
        </section>
      </div>
    </main>
  );
}
