import { useState } from 'react';

const DocumentManager = ({ recentDocuments }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingDocumentId, setEditingDocumentId] = useState(null);

  const API_URL = 'http://localhost:4000/api'; // Địa chỉ API

  const handleCreateDocument = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, folderId: 'javascript' }),
      });
      if (!response.ok) throw new Error('Failed to create document');
      const newDocument = await response.json();
      setDocuments((prev) => [...prev, newDocument]);
      setTitle('');
      setContent('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = async (id) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/documents/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete document');
      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/search?query=${searchQuery}`);
      if (!response.ok) throw new Error('Failed to fetch documents');
      const results = await response.json();
      setDocuments(results);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditDocument = (doc) => {
    setTitle(doc.title);
    setContent(doc.content);
    setEditingDocumentId(doc.id);
  };

  const handleUpdateDocument = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(
        `${API_URL}/documents/${editingDocumentId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, content }),
        }
      );
      if (!response.ok) throw new Error('Failed to update document');
      const updatedDocument = await response.json();
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === updatedDocument.id ? updatedDocument : doc
        )
      );
      setTitle('');
      setContent('');
      setEditingDocumentId(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4">
        {editingDocumentId ? 'Edit Document' : 'Create Document'}
      </h2>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        className="border border-gray-300 p-3 rounded mb-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Content"
        className="border border-gray-300 p-3 rounded mb-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        onClick={
          editingDocumentId ? handleUpdateDocument : handleCreateDocument
        }
        className="bg-blue-600 text-white p-3 rounded hover:bg-blue-700 transition duration-200"
      >
        {editingDocumentId ? 'Update' : 'Create'}
      </button>

      {loading && <p className="text-blue-500">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <h2 className="text-2xl font-semibold mt-6 mb-4">Search Documents</h2>
      <input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search..."
        className="border border-gray-300 p-3 rounded mb-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        onClick={handleSearch}
        className="bg-green-600 text-white p-3 rounded hover:bg-green-700 transition duration-200"
      >
        Search
      </button>

      <h2 className="text-2xl font-semibold mt-6 mb-4">Recent Documents</h2>
      <ul className="list-disc pl-5">
        {recentDocuments.map((doc) => (
          <li key={doc.id} className="flex justify-between items-center mb-2">
            <span className="text-gray-800">{doc.title}</span>
            <div>
              <button
                onClick={() => handleEditDocument(doc)}
                className="bg-yellow-500 text-white p-1 rounded hover:bg-yellow-600 transition duration-200 mr-2"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteDocument(doc.id)}
                className="bg-red-600 text-white p-1 rounded hover:bg-red-700 transition duration-200"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DocumentManager;
