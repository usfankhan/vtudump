import { createContext, useState, useEffect, useContext } from 'react';
import { API_BASE_URL, getAuthHeader, removeAuthToken } from '../config/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: getAuthHeader()
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          removeAuthToken();
        }
      } catch (err) {
        console.error('Failed to fetch user', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const login = (userData) => setUser(userData);
  const logout = () => {
    setUser(null);
    removeAuthToken();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
