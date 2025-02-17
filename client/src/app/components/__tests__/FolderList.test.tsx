import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import FolderList from '../FolderList';
import { folderApi } from '../../services/api';

// Mock the API module
vi.mock('../../services/api', () => ({
  folderApi: {
    getAll: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('FolderList', () => {
  const mockFolders = [
    { id: '1', name: 'Folder 1' },
    { id: '2', name: 'Folder 2' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    // Correct way to mock resolved value
    vi.mocked(folderApi.getAll).mockResolvedValue(mockFolders);
  });

  it('should render folder list', async () => {
    render(<FolderList selectedFolderId={null} onFolderSelect={() => {}} />);

    // Check loading state
    expect(screen.getByTestId('loading')).toBeInTheDocument();

    // Wait for folders to load
    await waitFor(() => {
      mockFolders.forEach((folder) => {
        expect(screen.getByText(folder.name)).toBeInTheDocument();
      });
    });

    // Check if "New Folder" button is present
    expect(screen.getByText(/new folder/i)).toBeInTheDocument();
  });

  it('should show create folder form when clicking new folder button', async () => {
    render(<FolderList selectedFolderId={null} onFolderSelect={() => {}} />);

    // Wait for folders to load
    await waitFor(() => {
      expect(screen.getByText(/new folder/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/new folder/i));

    expect(screen.getByPlaceholderText(/new folder name/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
  });

  it('should create new folder successfully', async () => {
    const newFolder = { id: '3', name: 'New Test Folder' };
    vi.mocked(folderApi.create).mockResolvedValue(newFolder);

    render(<FolderList selectedFolderId={null} onFolderSelect={() => {}} />);

    // Wait for folders to load and click new folder button
    await waitFor(() => {
      fireEvent.click(screen.getByText(/new folder/i));
    });

    // Fill in the form
    fireEvent.change(screen.getByPlaceholderText(/new folder name/i), {
      target: { value: newFolder.name },
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /create/i }));

    // Verify API was called
    expect(folderApi.create).toHaveBeenCalledWith({ name: newFolder.name });

    // Wait for new folder to appear
    await waitFor(() => {
      expect(screen.getByText(newFolder.name)).toBeInTheDocument();
    });
  });
});
