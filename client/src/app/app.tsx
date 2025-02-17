// Uncomment this line to use CSS modules
// import styles from './app.module.css';
import { useState } from 'react';
import FolderList from './components/FolderList';
import DocumentView from './components/DocumentView';
import RecentDocuments from './components/RecentDocuments';
import SearchBar from './components/SearchBar';

export default function App() {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
    null
  );

  const handleDocumentSelect = (documentId: string, docFolderId: string) => {
    setSelectedFolderId(docFolderId); // Cập nhật folder ID
    setSelectedDocumentId(documentId); // Cập nhật document ID
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">
              Document Management System
            </h1>
            <SearchBar
              onDocumentSelect={handleDocumentSelect}
              folderId={selectedFolderId}
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <FolderList
              selectedFolderId={selectedFolderId}
              onFolderSelect={setSelectedFolderId}
            />
            <div className="mt-6">
              <RecentDocuments onDocumentSelect={setSelectedDocumentId} />
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1">
            <DocumentView
              folderId={selectedFolderId}
              documentId={selectedDocumentId}
              onDocumentSelect={setSelectedDocumentId}
              onFolderChange={setSelectedFolderId}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
