import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL, getAuthHeader } from '../config/api';
import { FiUploadCloud } from 'react-icons/fi';
import './Upload.css';

export default function Upload() {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [year, setYear] = useState('1st Year');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('subject', subject);
    formData.append('year', year);
    formData.append('file', file);

    try {
      const res = await fetch(`${API_BASE_URL}/documents`, {
        method: 'POST',
        headers: getAuthHeader(), // Note: don't set Content-Type, fetch will automatically set it to multipart/form-data with boundary
        body: formData
      });

      if (res.ok) {
        navigate('/');
      } else {
        const data = await res.json();
        setError('Upload failed: ' + data.error);
      }
    } catch (err) {
      setError('Upload failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="page-container upload-page">
      <div className="upload-container glass-panel animate-fade-in">
        <div className="upload-header text-center">
          <div className="upload-icon-wrapper">
            <FiUploadCloud />
          </div>
          <h2 className="gradient-text">Upload Document</h2>
          <p className="text-secondary">Share your knowledge with juniors</p>
        </div>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit} className="upload-form">
          <div className="form-group">
            <label>Document Title</label>
            <input 
              type="text" 
              className="input-field" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required 
            />
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <textarea 
              className="input-field" 
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required 
            />
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label>Subject / Topic</label>
              <input 
                type="text" 
                className="input-field" 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required 
              />
            </div>
            <div className="form-group flex-1">
              <label>Academic Year</label>
              <select 
                className="input-field" 
                value={year}
                onChange={(e) => setYear(e.target.value)}
              >
                <option>1st Year</option>
                <option>2nd Year</option>
                <option>3rd Year</option>
                <option>4th Year</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          <div className="form-group file-upload-group">
            <label>Select File (PDF, Word, Image)</label>
            <div className="file-input-wrapper">
              <input 
                type="file" 
                id="file" 
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                className="hidden-file-input"
              />
              <label htmlFor="file" className="btn btn-secondary w-100">
                {file ? file.name : 'Choose File...'}
              </label>
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-100 submit-btn" disabled={loading}>
            {loading ? 'Uploading...' : 'Publish Document'}
          </button>
        </form>
      </div>
    </div>
  );
}
