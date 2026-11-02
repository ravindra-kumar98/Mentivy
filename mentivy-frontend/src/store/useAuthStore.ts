import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { setAccessToken, apiClient } from '@/lib/api-client';

export interface User {
  id: string;
  fullName?: string;
  email: string;
  role: 'STUDENT' | 'ADMIN' | 'SUPER_ADMIN' | string;
  assignedFields?: string[];
  avatarUrl?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, accessToken: string) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: true,
      setAuth: (user, accessToken) => {
        setAccessToken(accessToken);
        set({ user, accessToken, isAuthenticated: true, isLoading: false });
      },
      updateUser: (updatedFields) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedFields } : null
        }));
      },
      logout: async () => {
        try {
          await apiClient.post('/auth/logout');
        } catch (err) {
          // Ignore error, we still want to logout locally
        }
        setAccessToken(''); // Clear token in axios
        set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });

        if (typeof window !== 'undefined') {
          // Explicitly clear cookies on client side
          document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
          document.cookie = 'needsOnboarding=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
          try {
            localStorage.removeItem('auth-storage');
          } catch (e) {
            // ignore
          }
        }
      },
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated,
        accessToken: state.accessToken 
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (state.accessToken) {
            setAccessToken(state.accessToken);
          }
          state.setLoading(false);
        }
      }
    }
  )
);
