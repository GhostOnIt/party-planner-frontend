import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  lastActivityAt: string | null;
  setAuth: (user: User, token: string) => void;
  setUser: (user: User) => void;
  touchActivity: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      lastActivityAt: null,

      setAuth: (user, token) => {
        localStorage.setItem('auth_token', token);
        set({
          user,
          token,
          isAuthenticated: true,
          lastActivityAt: new Date().toISOString(),
        });
      },

      setUser: (user) => {
        set({ user });
      },

      touchActivity: () => {
        set({ lastActivityAt: new Date().toISOString() });
      },

      logout: () => {
        localStorage.removeItem('auth_token');
        set({ user: null, token: null, isAuthenticated: false, lastActivityAt: null });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        lastActivityAt: state.lastActivityAt,
      }),
    }
  )
);
