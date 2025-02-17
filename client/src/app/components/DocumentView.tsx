import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  FolderIcon,
} from '@heroicons/react/24/outline';
import { DocumentIcon } from '@heroicons/react/24/outline';
import { documentApi, historyApi } from '../services/api';

interface Document {
  id: string;
  title: string;
  content: string;
  folderId: string;
}

interface DocumentViewProps {
  folderId: string | null;
  documentId: string | null;
  onDocumentSelect: (documentId: string | null) => void;
  onFolderChange?: (folderId: string) => void;
}

export default function DocumentView({
  folderId,
  documentId,
  onDocumentSelect,
  onFolderChange,
}: DocumentViewProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (folderId) {
      loadDocuments(folderId);
    } else {
      resetState();
    }
  }, [folderId]);

  useEffect(() => {
    if (documentId) {
      loadDocument(documentId);
    }
  }, [documentId]);

  const loadDocuments = async (folderId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await documentApi.getAll(folderId);
      setDocuments(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch documents'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const loadDocument = async (docId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const doc = await documentApi.getById(docId);

      if (doc.folderId !== folderId && onFolderChange) {
        onFolderChange(doc.folderId);
        await loadDocuments(doc.folderId);
      }

      setSelectedDoc(doc);
      await historyApi.create({ documentId: docId });
    } catch (err) {
      handleFetchError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetState = () => {
    setDocuments([]);
    setSelectedDoc(null);
    setIsEditing(false);
    setIsCreating(false);
    setTitle('');
    setContent('');
    setError(null);
    onDocumentSelect(null);
  };

  const handleFetchError = (err: unknown) => {
    setError(err instanceof Error ? err.message : 'Failed to fetch document');
    setSelectedDoc(null);
    onDocumentSelect(null);
  };

  const createDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderId || !title.trim()) return;

    try {
      const response = await fetch('http://localhost:4000/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          folderId,
        }),
      });

      if (!response.ok) throw new Error('Failed to create document');

      const newDoc = await response.json();
      setDocuments([...documents, newDoc]);
      setIsCreating(false);
      setTitle('');
      setContent('');
      onDocumentSelect(newDoc.id);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to create document'
      );
    }
  };

  const updateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoc) return;

    try {
      const response = await fetch(
        `http://localhost:4000/api/documents/${selectedDoc.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title.trim(),
            content: content.trim(),
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to update document');

      const updatedDoc = await response.json();
      setSelectedDoc(updatedDoc);
      setDocuments(
        documents.map((doc) => (doc.id === updatedDoc.id ? updatedDoc : doc))
      );
      setIsEditing(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to update document'
      );
    }
  };

  const deleteDocument = async (docId: string) => {
    if (!window.confirm('Are you sure you want to delete this document?'))
      return;

    try {
      const response = await fetch(
        `http://localhost:4000/api/documents/${docId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) throw new Error('Failed to delete document');

      setDocuments(documents.filter((doc) => doc.id !== docId));
      if (selectedDoc?.id === docId) {
        setSelectedDoc(null);
        onDocumentSelect(null);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to delete document'
      );
    }
  };

  const startEditing = () => {
    if (selectedDoc) {
      setTitle(selectedDoc.title);
      setContent(selectedDoc.content);
      setIsEditing(true);
    }
  };

  if (!folderId) {
    return (
      <div className="text-center p-8 text-gray-500">
        Please select a folder to view documents
      </div>
    );
  }

  if (isLoading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden h-full">
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center w-full sm:w-auto">
          <FolderIcon className="h-5 w-5 text-gray-400 mr-2" />
          <h2 className="text-lg font-semibold text-gray-800">
            {folderId ? 'Documents' : 'Select a Folder'}
          </h2>
        </div>
        {folderId && !isCreating && !isEditing && (
          <button
            onClick={() => setIsCreating(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            <PlusIcon className="h-5 w-5 mr-1.5" />
            New Document
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-b border-red-100">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {!folderId ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <FolderIcon className="h-12 w-12 text-gray-400 mb-4" />
          <p>Please select a folder to view documents</p>
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : isCreating || isEditing ? (
        <form
          onSubmit={isCreating ? createDocument : updateDocument}
          className="p-6 space-y-6"
        >
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label
              htmlFor="content"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Content
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-64 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              {isCreating ? 'Create' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsCreating(false);
                setIsEditing(false);
                setTitle('');
                setContent('');
              }}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-200 h-full">
          <div className="col-span-1 overflow-y-auto max-h-[50vh] md:max-h-[calc(100vh-12rem)]">
            {documents.length === 0 ? (
              <div className="flex flex-col h-full p-4 text-center text-gray-500 justify-center items-center">
                <DocumentIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>No documents in this folder</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {documents.map((doc) => (
                  <li key={doc.id}>
                    <button
                      onClick={() => onDocumentSelect(doc.id)}
                      className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                        selectedDoc?.id === doc.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start">
                        <DocumentIcon
                          className={`h-5 w-5 mt-0.5 mr-2 ${
                            selectedDoc?.id === doc.id
                              ? 'text-blue-500'
                              : 'text-gray-400'
                          }`}
                        />
                        <h3
                          className={`font-medium ${
                            selectedDoc?.id === doc.id
                              ? 'text-blue-600'
                              : 'text-gray-900'
                          }`}
                        >
                          {doc.title}
                        </h3>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="col-span-1 md:col-span-3 p-4 md:p-6 overflow-y-auto max-h-[50vh] md:max-h-[calc(100vh-12rem)]">
            {selectedDoc ? (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {selectedDoc.title}
                  </h1>
                  <div className="flex gap-2">
                    <button
                      onClick={startEditing}
                      className="p-2 text-gray-400 hover:text-blue-500 rounded-full hover:bg-blue-50 transition-colors"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => deleteDocument(selectedDoc.id)}
                      className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div className="prose prose-blue max-w-none">
                  <ReactMarkdown>{selectedDoc.content}</ReactMarkdown>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <DocumentIcon className="h-12 w-12 text-gray-400 mb-4" />
                <p>Select a document to view its content</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
