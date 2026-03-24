'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getAuthErrorMessage,
  register,
} from '@/features/auth/auth.api';
import {
  registerFormSchema,
  type RegisterFormValues,
} from '@/features/auth/auth-form.schema';
import { useAuthStore } from '@/store/auth-store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function RegisterForm() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [form, setForm] = useState<RegisterFormValues>({
    name: '',
    email: '',
    password: '',
    role: 'ATTENDEE' as 'ATTENDEE' | 'ORGANIZER',
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    const parsed = registerFormSchema.safeParse(form);

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Register failed');
      return;
    }

    setIsLoading(true);

    try {
      const data = await register(parsed.data);
      setAuth(data.user);
      router.push(
        data.user.role === 'ORGANIZER' || data.user.role === 'ADMIN'
          ? '/dashboard'
          : '/',
      );
    } catch (error) {
      setError(getAuthErrorMessage(error, 'Register failed'));
    } finally {
      setIsLoading(false);
    }
  }

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1">
        <label className="text-xs font-medium text-text-muted">Name</label>
        <Input
          type="text"
          name="name"
          placeholder="Your name"
          value={form.name}
          onChange={handleChange}
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-text-muted">Email</label>
        <Input
          type="email"
          name="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={handleChange}
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-text-muted">Password</label>
        <Input
          type="password"
          name="password"
          placeholder="••••••••"
          value={form.password}
          onChange={handleChange}
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="role" className="text-xs font-medium text-text-muted">
          Account Type
        </label>
        <select
          id="role"
          name="role"
          value={form.role}
          onChange={handleChange}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="ATTENDEE">Attendee</option>
          <option value="ORGANIZER">Organizer</option>
        </select>
      </div>

      {error ? <p className="text-xs text-red-400">{error}</p> : null}

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Creating account…' : 'Register'}
      </Button>
    </form>
  );
}
