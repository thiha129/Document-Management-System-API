import { useState, useEffect } from 'react';
import { ClockIcon, DocumentIcon } from '@heroicons/react/24/outline';
import { historyApi, documentApi } from '../services/api';

// Interfaces
interface HistoryRecord {
  id: string;
  documentId: string;
  timestamp: number;
}

interface Document {
  id: string;
  title: string;
  content: string;
}

interface RecentDocument {
  id: string; // ID của history record
  documentId: string; // ID của document
  title: string; // Tiêu đề document
  viewedAt: string; // Thời gian xem
  snippet?: string; // Đoạn trích nội dung
}

interface RecentDocumentsProps {
  onDocumentSelect: (documentId: string) => void; // Callback khi chọn document
  currentDocumentId?: string | null; // ID của document đang xem
}

export default function RecentDocuments({
  onDocumentSelect,
  currentDocumentId,
}: RecentDocumentsProps) {
  // State Management
  const [recentDocs, setRecentDocs] = useState<RecentDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Effects
  useEffect(() => {
    fetchRecentDocuments();
  }, [currentDocumentId]);

  // API Functions
  const fetchRecentDocuments = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Lấy history records
      const historyData: HistoryRecord[] = await historyApi.getAll();

      // 2. Lọc unique document IDs và lấy record mới nhất cho mỗi document
      const latestHistoryByDoc = historyData.reduce((acc, curr) => {
        if (
          !acc[curr.documentId] ||
          acc[curr.documentId].timestamp < curr.timestamp
        ) {
          acc[curr.documentId] = curr;
        }
        return acc;
      }, {} as Record<string, HistoryRecord>);

      // 3. Fetch thông tin documents
      const docsPromises = Object.values(latestHistoryByDoc).map(
        async (history) => {
          try {
            const doc = await documentApi.getById(history.documentId);
            return {
              id: history.id,
              documentId: doc.id,
              title: doc.title,
              viewedAt: new Date(history.timestamp).toISOString(),
              snippet:
                doc.content.length > 150
                  ? `${doc.content.substring(0, 150)}...`
                  : doc.content,
            };
          } catch (err) {
            console.error(
              `Failed to fetch document ${history.documentId}:`,
              err
            );
            return null;
          }
        }
      );

      // 4. Xử lý kết quả và sắp xếp
      const docs = (await Promise.all(docsPromises))
        .filter((doc): doc is RecentDocument => doc !== null)
        .sort(
          (a, b) =>
            new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime()
        )
        .slice(0, 10);

      setRecentDocs(docs);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch recent documents'
      );
      console.error('Failed to fetch recent documents:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper Functions
  const getTimeAgo = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (isNaN(date.getTime())) return 'Invalid date';

      const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60,
      };

      for (const [unit, seconds] of Object.entries(intervals)) {
        const interval = Math.floor(diffInSeconds / seconds);
        if (interval >= 1) {
          return interval === 1 ? `1 ${unit} ago` : `${interval} ${unit}s ago`;
        }
      }

      return 'Just now';
    } catch {
      return 'Invalid date';
    }
  };

  // Render
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
          <ClockIcon className="h-5 w-5 mr-2 text-blue-500" />
          Recent Documents
        </h2>
      </div>

      <div className="overflow-y-auto max-h-[50vh] md:max-h-[calc(100vh-16rem)]">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        ) : recentDocs.length === 0 ? (
          <div className="p-8 text-center">
            <div className="rounded-full bg-gray-100 p-3 mx-auto w-fit mb-4">
              <ClockIcon className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-gray-500">No recently viewed documents</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200" role="list">
            {recentDocs.map((doc) => (
              <li key={doc.id}>
                <button
                  onClick={() => onDocumentSelect(doc.documentId)}
                  className="w-full p-4 text-left hover:bg-gray-50"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="flex items-start flex-1 min-w-0">
                      <DocumentIcon className="h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{doc.title}</h3>
                        {doc.snippet && (
                          <p className="mt-1 text-sm text-gray-500 line-clamp-2 hidden sm:block">
                            {doc.snippet}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="sm:flex-shrink-0">
                      <span className="inline-block px-2 py-1 text-xs font-medium text-gray-500 bg-gray-100 rounded-full">
                        {getTimeAgo(doc.viewedAt)}
                      </span>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
