import { useState, useEffect, useRef } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { searchApi } from '../services/api';

interface SearchResult {
  id: string;
  title: string;
  snippet: string;
}

interface SearchBarProps {
  onDocumentSelect: (documentId: string) => void;
}

export default function SearchBar({ onDocumentSelect }: SearchBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchDocuments = async () => {
    if (!query.trim()) {
      setError('Please enter a search term');
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    setIsOpen(true);

    try {
      const data = await searchApi.search(query.trim());
      setResults(data);
    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'Failed to perform search');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (documentId: string) => {
    onDocumentSelect(documentId);
    resetState();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    setError(null);

    if (!newQuery.trim()) {
      resetState();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchDocuments();
  };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    resetState();
  };

  const resetState = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setError(null);
    setHasSearched(false);
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-xl">
      <form role="form" onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Search documents..."
            className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
            isLoading || !query.trim()
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          } text-white`}
        >
          <MagnifyingGlassIcon className="h-5 w-5" />
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {isOpen && hasSearched && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto z-50">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : results.length > 0 ? (
            <ul className="divide-y divide-gray-200" role="listbox">
              {results.map((result) => (
                <li key={result.id}>
                  <button
                    onClick={() => handleSelect(result.id)}
                    className="w-full text-left p-4 hover:bg-gray-50"
                  >
                    <h3 className="font-medium">{result.title}</h3>
                    <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                      {result.snippet}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-500">
                {query.trim()
                  ? `No documents found matching "${query.trim()}"`
                  : 'Please enter a search term'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
