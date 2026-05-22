import './DocumentCard.css';
import { FiDownload, FiFileText, FiImage, FiFile } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

export default function DocumentCard({ document, user, onDelete, isAdmin }) {
  const navigate = useNavigate();

  const handleDownload = () => {
    if (!user) {
      // Must be logged in to download
      navigate('/login');
      return;
    }
    // Proceed to open download URL
    window.open(document.url, '_blank');
  };

  const getIcon = () => {
    const type = document.type || '';
    if (type.includes('pdf')) return <FiFileText />;
    if (type.includes('image')) return <FiImage />;
    return <FiFile />;
  };

  return (
    <div className="document-card glass-panel animate-fade-in">
      <div className="card-header">
        <div className="icon-wrapper">{getIcon()}</div>
        {isAdmin && (
          <button className="btn btn-danger btn-sm" onClick={() => onDelete(document.id)}>
            Delete
          </button>
        )}
      </div>
      <div className="card-body">
        <h3 className="card-title">{document.title}</h3>
        <p className="card-desc">{document.description}</p>
        <div className="card-meta">
          <span className="badge">{document.subject}</span>
          <span className="badge">{document.year}</span>
        </div>
      </div>
      <div className="card-footer">
        <button className="btn btn-primary w-100" onClick={handleDownload}>
          <FiDownload /> Download
        </button>
      </div>
    </div>
  );
}
