// Uncomment this line to use CSS modules
// import styles from './app.module.css';
import { useEffect, useState } from 'react';
import DocumentManager from './DocumentManager';

export function App() {
  const [recentDocuments, setRecentDocuments] = useState([]);

  useEffect(() => {
    const fetchRecentDocuments = async () => {
      const response = await fetch('/api/history');
      const data = await response.json();
      setRecentDocuments(data);
    };
    fetchRecentDocuments();
  }, []);

  return (
    <div>
      <h1>Document Management</h1>
      <DocumentManager recentDocuments={recentDocuments} />
    </div>
  );
}

export default App;
