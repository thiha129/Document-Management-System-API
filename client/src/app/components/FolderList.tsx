import { useState, useEffect } from 'react';
import { PlusIcon, FolderIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Folder {
  id: string;
  name: string;
}

interface FolderListProps {
  selectedFolderId: string | null;
  onFolderSelect: (folderId: string) => void;
}

export default function FolderList({
  selectedFolderId,
  onFolderSelect,
}: FolderListProps) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    fetchFolders();
  }, []);

  const fetchFolders = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/folders');
      if (!response.ok) throw new Error('Failed to fetch folders');
      const data = await response.json();
      setFolders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch folders');
    } finally {
      setIsLoading(false);
    }
  };

  const createFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newFolderName.trim();

    if (!trimmedName) {
      setFormError('Folder name cannot be empty');
      return;
    }

    const existingFolder = folders.find(
      (folder) => folder.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (existingFolder) {
      setFormError('A folder with this name already exists');
      return;
    }

    setFormError(null);

    try {
      const response = await fetch('http://localhost:4000/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmedName }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create folder');
      }

      const newFolder = await response.json();
      setFolders([...folders, newFolder]);
      setNewFolderName('');
      setIsCreating(false);
      setFormError(null);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'Failed to create folder'
      );
    }
  };

  const deleteFolder = async (folderId: string) => {
    if (!window.confirm('Are you sure you want to delete this folder?')) return;

    try {
      const response = await fetch(
        `http://localhost:4000/api/folders/${folderId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) throw new Error('Failed to delete folder');

      setFolders(folders.filter((folder) => folder.id !== folderId));
      if (selectedFolderId === folderId) {
        onFolderSelect(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete folder');
    }
  };

  if (isLoading) return <div className="p-4">Loading folders...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
          <FolderIcon className="h-5 w-5 mr-2 text-blue-500" />
          Folders
        </h2>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-b border-red-100">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <ul className="divide-y divide-gray-200">
        {folders.map((folder) => (
          <li
            key={folder.id}
            className="hover:bg-gray-50 transition-colors duration-150"
          >
            <button
              onClick={() => onFolderSelect(folder.id)}
              className={`flex items-center justify-between w-full p-4 ${
                selectedFolderId === folder.id
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700'
              }`}
            >
              <div className="flex items-center">
                <FolderIcon
                  className={`h-5 w-5 mr-2 ${
                    selectedFolderId === folder.id
                      ? 'text-blue-500'
                      : 'text-gray-400'
                  }`}
                />
                <span className="font-medium">{folder.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteFolder(folder.id);
                  }}
                  className="p-1 rounded-full hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </button>
          </li>
        ))}
      </ul>

      {/* Create Folder Form */}
      {isCreating ? (
        <div className="border-t border-gray-200 bg-white p-5">
          <form onSubmit={createFolder} className="space-y-4 max-w-xl mx-auto">
            <div>
              <label
                htmlFor="folderName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                New Folder Name
              </label>
              <input
                id="folderName"
                type="text"
                value={newFolderName}
                onChange={(e) => {
                  setNewFolderName(e.target.value);
                  setFormError(null);
                }}
                placeholder="Enter folder name"
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                autoFocus
              />
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{formError}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mt-6">
              <button
                type="submit"
                className="w-full px-1 py-1 bg-blue-500 text-white text-base font-medium rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
              >
                Create Folder
              </button>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="w-full px-1 py-1 bg-white border border-gray-300 text-gray-700 text-base font-medium rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setIsCreating(true)}
          className="w-full p-4 text-left text-blue-500 hover:bg-gray-50 flex items-center transition-colors border-t border-gray-200"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          <span className="font-medium">New Folder</span>
        </button>
      )}
    </div>
  );
}
