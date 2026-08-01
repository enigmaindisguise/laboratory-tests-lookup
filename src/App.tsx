import SearchBar from './components/SearchBar';
import TestResultList from './components/TestResultList';
import { useSearch } from './hooks/useSearch';

export default function App() {
  const { query, setQuery, results } = useSearch();

  // Stub handler for US1: full selection logic lands in User Story 2 (T026).
  const handleAdd = (testId: string, amount: number) => {
    void testId;
    void amount;
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <h1 className="text-xl font-semibold text-gray-800">Laboratory Tests Lookup</h1>

        <section className="rounded-lg bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-base font-semibold text-gray-700">Search &amp; Result Set</h2>
          <SearchBar query={query} onQueryChange={setQuery} />
          <div className="mt-3">
            <TestResultList tests={results} onAdd={handleAdd} />
          </div>
        </section>

        <section className="rounded-lg bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-base font-semibold text-gray-700">Selected Items</h2>
          <p className="text-sm text-gray-500">Selection coming soon…</p>
        </section>
      </div>
    </main>
  );
}
