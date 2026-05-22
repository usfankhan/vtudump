import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL, getAuthHeader } from '../config/api';
import DocumentCard from '../components/DocumentCard';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [ads, setAds] = useState([]);
  const [activeTab, setActiveTab] = useState('documents');
  const navigate = useNavigate();

  // Ad form state
  const [adTitle, setAdTitle] = useState('');
  const [adDesc, setAdDesc] = useState('');
  const [adLink, setAdLink] = useState('');
  const [adImage, setAdImage] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }

    const fetchAdminData = async () => {
      try {
        const [docsRes, adsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/documents`, { headers: getAuthHeader() }),
          fetch(`${API_BASE_URL}/ads`, { headers: getAuthHeader() })
        ]);

        if (docsRes.ok) setDocuments(await docsRes.json());
        if (adsRes.ok) setAds(await adsRes.json());
      } catch (error) {
        console.error("Failed to fetch admin data", error);
      }
    };

    fetchAdminData();
  }, [user, navigate]);

  const handleDeleteDocument = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/documents/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      });
      if (res.ok) {
        setDocuments(documents.filter(d => d.id !== id));
      } else {
        alert("Failed to delete document");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddAd = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/ads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({
          title: adTitle,
          description: adDesc,
          link: adLink,
          imageUrl: adImage
        })
      });

      if (res.ok) {
        const newAd = await res.json();
        setAds([...ads, newAd]);
        setAdTitle(''); setAdDesc(''); setAdLink(''); setAdImage('');
      } else {
        alert("Failed to create ad");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const toggleAdActive = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 1 ? 0 : 1;
      const res = await fetch(`${API_BASE_URL}/ads/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({ active: newStatus })
      });

      if (res.ok) {
        setAds(ads.map(ad => ad.id === id ? { ...ad, active: newStatus } : ad));
      } else {
        alert("Failed to update ad");
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="page-container admin-page">
      <div className="admin-header text-center animate-fade-in">
        <h1 className="gradient-text text-4xl font-bold mb-4">Admin Dashboard</h1>
        <p className="text-secondary">Manage documents and platform advertisements</p>
      </div>

      <div className="admin-tabs glass-panel">
        <button 
          className={`tab-btn ${activeTab === 'documents' ? 'active' : ''}`}
          onClick={() => setActiveTab('documents')}
        >
          Manage Documents
        </button>
        <button 
          className={`tab-btn ${activeTab === 'ads' ? 'active' : ''}`}
          onClick={() => setActiveTab('ads')}
        >
          Manage Advertisements
        </button>
      </div>

      <div className="admin-content mt-12 animate-fade-in">
        {activeTab === 'documents' ? (
          <div>
            <h2 className="text-2xl font-bold mb-6">All Documents ({documents.length})</h2>
            <div className="documents-grid">
              {documents.map(doc => (
                <DocumentCard 
                  key={doc.id} 
                  document={doc} 
                  user={user} 
                  isAdmin={true} 
                  onDelete={handleDeleteDocument} 
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="ads-manager-layout">
            <div className="add-ad-panel glass-panel">
              <h3 className="text-xl font-bold mb-6">Create New Advertisement</h3>
              <form onSubmit={handleAddAd} className="upload-form">
                <div className="form-group">
                  <label>Title</label>
                  <input type="text" className="input-field" value={adTitle} onChange={e => setAdTitle(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea className="input-field" value={adDesc} onChange={e => setAdDesc(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Image URL</label>
                  <input type="url" className="input-field" value={adImage} onChange={e => setAdImage(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Target Link</label>
                  <input type="url" className="input-field" value={adLink} onChange={e => setAdLink(e.target.value)} required />
                </div>
                <button type="submit" className="btn btn-primary w-100">Publish Ad</button>
              </form>
            </div>
            <div className="current-ads-panel glass-panel">
              <h3 className="text-xl font-bold mb-6">Active Advertisements</h3>
              <div className="admin-ads-list flex flex-col gap-4">
                {ads.map(ad => (
                  <div key={ad.id} className={`admin-ad-item ${!ad.active ? 'opacity-50' : ''}`}>
                    <div className="ad-info">
                      <h4>{ad.title}</h4>
                      <p className="text-secondary text-sm">{ad.description}</p>
                    </div>
                    <button 
                      className={`btn btn-sm ${ad.active ? 'btn-danger' : 'btn-primary'}`}
                      onClick={() => toggleAdActive(ad.id, ad.active)}
                    >
                      {ad.active ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
