'use client';

import { useEffect } from 'react';
import {
  ExpectedAuthError,
  getMe,
} from '@/features/auth/auth.api';
import { hasAuthSessionHint } from '@/features/auth/auth-session';
import { useAuthStore } from '@/store/auth-store';

export const useAuthBootstrap = () => {
  const { setAuth, clearAuth, initialized, setInitialized } = useAuthStore();

  useEffect(() => {
    if (initialized) return;

    const bootstrap = async () => {
      if (!hasAuthSessionHint()) {
        clearAuth();
        setInitialized();
        return;
      }

      try {
        const user = await getMe();
        setAuth(user);
      } catch (error) {
        if (!(error instanceof ExpectedAuthError)) {
          console.error('Auth bootstrap failed', error);
        }

        clearAuth();
      } finally {
        setInitialized();
      }
    };

    void bootstrap();
  }, [initialized, setAuth, clearAuth, setInitialized]);
};
