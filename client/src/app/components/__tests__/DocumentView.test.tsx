import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import DocumentView from '../DocumentView';
import { documentApi, historyApi } from '../../services/api';

// Mock the API module
vi.mock('../../services/api', () => ({
  documentApi: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  historyApi: {
    create: vi.fn(),
  },
}));

describe('DocumentView', () => {
  const mockDocuments = [
    { id: '1', title: 'Doc 1', content: 'Content 1', folderId: 'folder1' },
    { id: '2', title: 'Doc 2', content: 'Content 2', folderId: 'folder1' },
  ];

  const mockDocument = {
    id: '1',
    title: 'Test Document',
    content: 'Test Content',
    folderId: 'folder1',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(documentApi.getAll).mockResolvedValue(mockDocuments);
    vi.mocked(documentApi.getById).mockResolvedValue(mockDocument);
    vi.mocked(historyApi.create).mockResolvedValue({});
  });

  it('should show loading state initially', () => {
    render(
      <DocumentView
        folderId="folder1"
        documentId={null}
        onDocumentSelect={() => {}}
      />
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should fetch and display documents for a folder', async () => {
    render(
      <DocumentView
        folderId="folder1"
        documentId={null}
        onDocumentSelect={() => {}}
      />
    );

    await waitFor(() => {
      mockDocuments.forEach((doc) => {
        expect(screen.getByText(doc.title)).toBeInTheDocument();
      });
    });
  });

  it('should fetch and display a single document when documentId is provided', async () => {
    render(
      <DocumentView
        folderId="folder1"
        documentId="1"
        onDocumentSelect={() => {}}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(mockDocument.title)).toBeInTheDocument();
      expect(screen.getByText(mockDocument.content)).toBeInTheDocument();
    });

    expect(historyApi.create).toHaveBeenCalledWith({ documentId: '1' });
  });

  it('should show create document form when clicking new document button', async () => {
    render(
      <DocumentView
        folderId="folder1"
        documentId={null}
        onDocumentSelect={() => {}}
      />
    );

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText(/new document/i)).toBeInTheDocument();
    });

    // Click new document button
    fireEvent.click(screen.getByText(/new document/i));

    // Check if form elements are present
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/content/i)).toBeInTheDocument();
  });

  it('should create new document successfully', async () => {
    const newDoc = {
      id: '3',
      title: 'New Document',
      content: 'New Content',
      folderId: 'folder1',
    };
    vi.mocked(documentApi.create).mockResolvedValue(newDoc);

    const onDocumentSelect = vi.fn();
    render(
      <DocumentView
        folderId="folder1"
        documentId={null}
        onDocumentSelect={onDocumentSelect}
      />
    );

    // Wait for initial load and click new document
    await waitFor(() => {
      fireEvent.click(screen.getByText(/new document/i));
    });

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: newDoc.title },
    });
    fireEvent.change(screen.getByLabelText(/content/i), {
      target: { value: newDoc.content },
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /create/i }));

    // Verify API was called and document was selected
    await waitFor(() => {
      expect(documentApi.create).toHaveBeenCalledWith({
        title: newDoc.title,
        content: newDoc.content,
        folderId: 'folder1',
      });
      expect(onDocumentSelect).toHaveBeenCalledWith(newDoc.id);
    });
  });

  it('should handle errors when fetching documents', async () => {
    const errorMessage = 'Failed to fetch documents';
    vi.mocked(documentApi.getAll).mockRejectedValue(new Error(errorMessage));

    render(
      <DocumentView
        folderId="folder1"
        documentId={null}
        onDocumentSelect={() => {}}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });
});
