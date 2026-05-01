import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { setAccessToken, apiClient } from '@/lib/api-client';

export interface User {
  id: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean; // Useful for initial check
  setAuth: (user: User, accessToken: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true, // Start as loading until we check local storage
      setAuth: (user, accessToken) => {
        setAccessToken(accessToken);
        set({ user, isAuthenticated: true, isLoading: false });
      },
      logout: async () => {
        try {
          await apiClient.post('/auth/logout');
        } catch (err) {
          // Ignore error, we still want to logout locally
        }
        setAccessToken(''); // Clear token in axios
        set({ user: null, isAuthenticated: false, isLoading: false });
      },
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'auth-storage', // name of the item in the storage (must be unique)
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }), // Only persist user and auth state
      onRehydrateStorage: () => (state) => {
        if (state) {
           state.setLoading(false); // Done hydrating
        }
      }
    }
  )
);
