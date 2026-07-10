import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';
import { getToken, clearAuth } from '../utils/storage';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Attach auth token if available
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
  return config;
});

// Global response handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      clearAuth();
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const getErrorMessage = (error) =>
  error?.response?.data?.message || error?.message || 'Something went wrong';

export default api;
