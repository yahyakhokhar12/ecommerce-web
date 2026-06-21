import axios from 'axios';

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const apiUrl = (path) => `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

axios.defaults.withCredentials = true;

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || '';
    const isAuthExpired =
      error.response?.status === 401 &&
      /invalid or expired access token|invalid refresh token|no refresh token/i.test(message);

    if (isAuthExpired) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');

      if (!window.location.pathname.startsWith('/login')) {
        window.location.assign('/login');
      }
    }

    return Promise.reject(error);
  }
);
