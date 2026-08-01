import { useMemo, useState } from 'react';
import { searchTests } from '../services/search';
import catalog from '../data/laboratory-tests.json';

export function useSearch() {
  const [query, setQuery] = useState('');
  const results = useMemo(() => searchTests(query, catalog), [query]);

  return { query, setQuery, results };
}
