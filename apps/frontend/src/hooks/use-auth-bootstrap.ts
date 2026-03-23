'use client';

import { useEffect } from 'react';
import { getMe } from '@/features/auth/auth.api';
import { useAuthStore } from '@/store/auth-store';

export const useAuthBootstrap = () => {
  const { setAuth, clearAuth, initialized, setInitialized } = useAuthStore();

  useEffect(() => {
    if (initialized) return;

    const bootstrap = async () => {
      try {
        const user = await getMe();
        setAuth(user);
      } catch {
        clearAuth();
      } finally {
        setInitialized();
      }
    };

    void bootstrap();
  }, [initialized, setAuth, clearAuth, setInitialized]);
};
