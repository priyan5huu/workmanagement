import axios, { AxiosResponse, AxiosError } from 'axios';
import { config } from '../config';

// Create axios instance
const api = axios.create({
  baseURL: config.api.baseUrl,
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('workflow-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('workflow-refresh-token');
        if (refreshToken) {
          const response = await axios.post(`${config.api.baseUrl}/auth/refresh`, {
            refreshToken,
          });

          const { token } = response.data;
          localStorage.setItem('workflow-token', token);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('workflow-token');
        localStorage.removeItem('workflow-refresh-token');
        localStorage.removeItem('workflow-user');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
