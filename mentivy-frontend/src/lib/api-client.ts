import axios from 'axios';
import { API_BASE_URL } from '@/lib/config';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Crucial for sending the HttpOnly refresh token cookie
});

// In-memory access token storage
let currentAccessToken: string | null = null;

export const setAccessToken = (token: string) => {
  currentAccessToken = token;
};

export const getAccessToken = () => currentAccessToken;

// Request Interceptor: Attach access token if available
apiClient.interceptors.request.use((config) => {
  if (currentAccessToken) {
    config.headers.Authorization = `Bearer ${currentAccessToken}`;
  } else if (typeof window !== 'undefined') {
    // Fallback: Check persisted token from localStorage
    try {
      const stored = localStorage.getItem('auth-storage');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.state?.accessToken) {
          currentAccessToken = parsed.state.accessToken;
          config.headers.Authorization = `Bearer ${currentAccessToken}`;
        }
      }
    } catch (e) {
      // ignore
    }
  }
  return config;
});

// Response Interceptor: Handle 401 Unauthorized for silent refresh without infinite loop
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is 401 and we haven't retried yet and not hitting auth endpoints
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/')) {
      originalRequest._retry = true;
      try {
        // Attempt to hit the refresh endpoint
        const res = await axios.post(
          `${apiClient.defaults.baseURL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        
        const newAccessToken = res.data?.data?.accessToken;
        if (newAccessToken) {
          setAccessToken(newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token failed, reject promise without forced page reload loop
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
