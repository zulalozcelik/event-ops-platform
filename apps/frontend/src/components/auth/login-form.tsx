'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/features/auth/auth.api';
import { useAuthStore } from '@/store/auth-store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function LoginForm() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const data = await login(form);
      setAuth(data.user);
      router.push('/');
    } catch {
      setError('Login failed');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1">
        <label className="text-xs font-medium text-text-muted">Email</label>
        <Input
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, email: e.target.value }))
          }
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-text-muted">Password</label>
        <Input
          type="password"
          placeholder="••••••••"
          value={form.password}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, password: e.target.value }))
          }
        />
      </div>

      {error ? <p className="text-xs text-red-400">{error}</p> : null}

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Signing in…' : 'Login'}
      </Button>
    </form>
  );
}
