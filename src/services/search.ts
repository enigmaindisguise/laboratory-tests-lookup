import type { LaboratoryTest } from '../types/laboratory-test';

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ');
}

function tokenize(text: string): string[] {
  return normalize(text).split(/\s+/).filter(Boolean);
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const dp: number[][] = Array.from({ length: a.length + 1 }, () =>
    Array(b.length + 1).fill(0),
  );
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost,
      );
    }
  }
  return dp[a.length][b.length];
}

function matches(queryToken: string, itemTokens: Set<string>): boolean {
  for (const token of itemTokens) {
    if (token === queryToken) return true;
    if (queryToken.length >= 3 && token.startsWith(queryToken)) return true;
    if (queryToken.length >= 4 && levenshtein(queryToken, token) <= 1) return true;
  }
  return false;
}

// Pure token-overlap fuzzy matcher: normalizes, tokenizes the query and each
// item's title + description, and scores items by the fraction of query tokens
// that match (exact, prefix, or edit distance <= 1). Ties keep catalog order.
export function searchTests(query: string, catalog: LaboratoryTest[]): LaboratoryTest[] {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return catalog;

  const scored = catalog.map((test) => {
    const itemTokens = new Set(tokenize(`${test.title} ${test.description}`));
    const matched = queryTokens.filter((q) => matches(q, itemTokens)).length;
    return { test, score: matched / queryTokens.length };
  });

  return scored
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.test);
}
