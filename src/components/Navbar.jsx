import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';
import { FiUpload, FiLogOut, FiUser } from 'react-icons/fi';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isAdmin = user && user.role === 'admin';

  return (
    <nav className="navbar glass-panel">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <span className="gradient-text">VTU Dump</span>
        </Link>
        <div className="nav-links">
          {user ? (
            <>
              {isAdmin && (
                <Link to="/admin" className="nav-item">Admin Dashboard</Link>
              )}
              <Link to="/upload" className="btn btn-primary">
                <FiUpload /> Upload
              </Link>
              <button onClick={handleLogout} className="btn btn-secondary">
                <FiLogOut /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary">
                <FiUser /> Login
              </Link>
              <Link to="/signup" className="btn btn-primary">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
