import { create } from 'zustand';
import type { AuthUser } from '@/types/auth';
import {
  clearAuthSessionHint,
  setAuthSessionHint,
} from '@/features/auth/auth-session';

type AuthState = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  initialized: boolean;
  setAuth: (user: AuthUser) => void;
  clearAuth: () => void;
  setInitialized: () => void;
};

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,
  initialized: false,

  setAuth: (user) =>
    set(() => {
      setAuthSessionHint();

      return {
        user,
        isAuthenticated: true,
      };
    }),

  clearAuth: () =>
    set(() => {
      clearAuthSessionHint();

      return {
        user: null,
        isAuthenticated: false,
      };
    }),

  setInitialized: () =>
    set({
      initialized: true,
    }),
}));
