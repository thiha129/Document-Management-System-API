const API_BASE_URL = 'http://localhost:4000/api';
const defaultHeaders = { 'Content-Type': 'application/json' };

// Document APIs
export const documentApi = {
  getAll: async (folderId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/folders/${folderId}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch documents');
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  },

  getById: async (documentId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/documents/${documentId}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch document');
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching document:', error);
      throw error;
    }
  },

  create: async (data: { title: string; content: string; folderId: string }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/documents`, {
        method: 'POST',
        headers: defaultHeaders,
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create document');
      }
      return response.json();
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  },

  update: async (documentId: string, data: { title: string; content: string }) => {
    const response = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update document');
    return response.json();
  },

  delete: async (documentId: string) => {
    const response = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete document');
  },
};

// Folder APIs
export const folderApi = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/folders`);
    if (!response.ok) throw new Error('Failed to fetch folders');
    return response.json();
  },

  create: async (data: { name: string }) => {
    const response = await fetch(`${API_BASE_URL}/folders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create folder');
    }
    return response.json();
  },

  delete: async (folderId: string) => {
    const response = await fetch(`${API_BASE_URL}/folders/${folderId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete folder');
  },
};

// History APIs
export const historyApi = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/history`);
    if (!response.ok) throw new Error('Failed to fetch history');
    return response.json();
  },

  create: async (data: { documentId: string }) => {
    const response = await fetch(`${API_BASE_URL}/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create history entry');
    return response.json();
  },
};

// Search APIs
export const searchApi = {
  search: async (query: string) => {
    const response = await fetch(
      `${API_BASE_URL}/search?query=${encodeURIComponent(query.trim())}`
    );
    if (!response.ok) throw new Error(`Search failed: ${response.statusText}`);
    return response.json();
  },
}; 