import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import SearchBar from '../SearchBar';
import { searchApi } from '../../services/api';

// Mock the API
vi.mock('../../services/api', () => ({
  searchApi: {
    search: vi.fn(),
  },
}));

describe('SearchBar', () => {
  const mockOnDocumentSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render search input and button', () => {
    render(<SearchBar onDocumentSelect={mockOnDocumentSelect} />);

    expect(
      screen.getByPlaceholderText(/search documents/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });

  it('should show error when searching with empty query', async () => {
    render(<SearchBar onDocumentSelect={mockOnDocumentSelect} />);

    // Find the search form and submit it with empty query
    const form = screen.getByRole('form');
    fireEvent.submit(form);

    // Check if error message is displayed
    expect(screen.getByText(/please enter a search term/i)).toBeInTheDocument();

    // Verify that API was not called
    expect(searchApi.search).not.toHaveBeenCalled();
  });

  it('should perform search with valid query', async () => {
    const mockResults = [
      { id: '1', title: 'Test Doc', snippet: 'Test content' },
    ];
    vi.mocked(searchApi.search).mockResolvedValue(mockResults);

    render(<SearchBar onDocumentSelect={mockOnDocumentSelect} />);

    // Type in search query
    const searchInput = screen.getByPlaceholderText(/search documents/i);
    fireEvent.change(searchInput, { target: { value: 'test' } });

    // Submit the search
    const form = screen.getByRole('form');
    fireEvent.submit(form);

    // Verify API was called with correct query
    expect(searchApi.search).toHaveBeenCalledWith('test');

    // Wait for and verify results
    const resultTitle = await screen.findByText('Test Doc');
    expect(resultTitle).toBeInTheDocument();
  });
});
