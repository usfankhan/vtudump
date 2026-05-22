import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL, getDefaultHeaders } from '../config/api';
import DocumentCard from '../components/DocumentCard';
import AdBanner from '../components/AdBanner';
import { FiSearch } from 'react-icons/fi';
import './Home.css';

export default function Home() {
  const [documents, setDocuments] = useState([]);
  const [ads, setAds] = useState([]);
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [docsRes, adsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/documents`, { headers: getDefaultHeaders() }),
          fetch(`${API_BASE_URL}/ads`, { headers: getDefaultHeaders() })
        ]);

        if (docsRes.ok) {
          const docsData = await docsRes.json();
          setDocuments(docsData);
        }

        if (adsRes.ok) {
          const adsData = await adsRes.json();
          // Filter only active ads for the public home page
          setAds(adsData.filter(ad => ad.active === 1));
        }
      } catch (err) {
        console.error('Failed to fetch data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredDocs = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    doc.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-container home-page">
      <header className="hero-section text-center animate-fade-in">
        <h1 className="gradient-text text-5xl font-bold mb-4">VTU Dump</h1>
        <p className="text-secondary text-lg mb-8 max-w-2xl mx-auto">
          Access study materials, project reports, and lab manuals shared by your seniors. 
          Sign up to download files directly from your local network.
        </p>

        <div className="search-bar-wrapper mx-auto max-w-xl">
          <FiSearch className="search-icon" />
          <input 
            type="text" 
            className="input-field search-input" 
            placeholder="Search for subjects, topics, or titles..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      <div className="content-grid mt-12">
        <main className="documents-section">
          <div className="section-header mb-6">
            <h2 className="text-2xl font-bold">Recent Uploads</h2>
            <span className="text-secondary">{filteredDocs.length} documents found</span>
          </div>
          
          {loading ? (
            <div className="loading-state">Loading documents...</div>
          ) : (
            <div className="documents-grid">
              {filteredDocs.map(doc => (
                <DocumentCard key={doc.id} document={doc} user={user} />
              ))}
            </div>
          )}
        </main>

        <aside className="sidebar">
          <div className="sticky-sidebar">
            <h3 className="text-lg font-bold mb-4 text-secondary uppercase tracking-wider text-sm">Sponsored</h3>
            <div className="ads-container flex flex-col gap-4">
              {ads.map(ad => (
                <AdBanner key={ad.id} ad={ad} />
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
