'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthErrorMessage, login } from '@/features/auth/auth.api';
import {
  loginFormSchema,
  type LoginFormValues,
} from '@/features/auth/auth-form.schema';
import { useAuthStore } from '@/store/auth-store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function LoginForm() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [form, setForm] = useState<LoginFormValues>({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    const parsed = loginFormSchema.safeParse(form);

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Login failed');
      return;
    }

    setIsLoading(true);

    try {
      const data = await login(parsed.data);
      setAuth(data.user);
      router.push(
        data.user.role === 'ORGANIZER' || data.user.role === 'ADMIN'
          ? '/dashboard'
          : '/',
      );
    } catch (error) {
      setError(getAuthErrorMessage(error, 'Login failed'));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-text">
          Email
        </label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, email: e.target.value }))
          }
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-text">
          Password
        </label>
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
          value={form.password}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, password: e.target.value }))
          }
        />
      </div>

      {error ? (
        <div className="rounded-lg border border-[#EDC0B6] bg-destructive-muted px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Signing in...' : 'Login'}
      </Button>
    </form>
  );
}
