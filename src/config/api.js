export const API_BASE_URL = import.meta.env.PROD ? '/api' : 'http://localhost:5000/api';

export const getAuthToken = () => {
  return localStorage.getItem('token');
};

export const setAuthToken = (token) => {
  localStorage.setItem('token', token);
};

export const removeAuthToken = () => {
  localStorage.removeItem('token');
};

export const getAuthHeader = () => {
  const token = getAuthToken();
  return {
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    'ngrok-skip-browser-warning': 'true'
  };
};

export const getDefaultHeaders = () => {
  return {
    'ngrok-skip-browser-warning': 'true'
  };
};
