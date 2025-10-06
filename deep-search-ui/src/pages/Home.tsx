import { useState } from 'react';

interface SearchResult {
  id: number;
  content: string;
  score: number;
  metadata: Record<string, any>;
}

interface SearchResponse {
  results: SearchResult[];
  query: string;
  total: number;
}

const API_BASE_URL = import.meta.env.VITE_API || 'http://localhost:8000/api/v1';

export default function Home() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchPerformed, setSearchPerformed] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }

    setLoading(true);
    setError(null);
    setSearchPerformed(true);

    try {
      const response = await fetch(`${API_BASE_URL}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          top_k: 10,
        }),
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const data: SearchResponse = await response.json();
      setResults(data.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-slate-800 mb-3">
            🔍 Deep Search
          </h1>
          <p className="text-slate-600 text-lg">
            Semantic search powered by AI embeddings
          </p>
        </div>

        {/* Search Box */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex gap-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter your search query..."
              className="flex-1 px-6 py-4 text-lg border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
              disabled={loading}
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}
        </div>

        {/* Results */}
        {searchPerformed && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-slate-800">
                Results
              </h2>
              {results.length > 0 && (
                <span className="text-slate-600">
                  Found {results.length} result{results.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {results.length === 0 && !loading && (
              <div className="text-center py-12 bg-white rounded-xl shadow">
                <p className="text-slate-500 text-lg">
                  No results found. Try a different query.
                </p>
              </div>
            )}

            {results.map((result) => (
              <div
                key={result.id}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">
                      Document #{result.id}
                    </h3>
                    <p className="text-slate-700 leading-relaxed">
                      {result.content}
                    </p>
                  </div>
                  <div className="ml-4">
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      Score: {result.score.toFixed(3)}
                    </span>
                  </div>
                </div>

                {Object.keys(result.metadata).length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(result.metadata).map(([key, value]) => (
                        <span
                          key={key}
                          className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs"
                        >
                          {key}: {String(value)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
