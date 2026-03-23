'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { register } from '@/features/auth/auth.api';
import { useAuthStore } from '@/store/auth-store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function RegisterForm() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [form, setForm] = useState({
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
    setIsLoading(true);

    try {
      const data = await register(form);
      setAuth(data.user);
      router.push('/');
    } catch {
      setError('Register failed');
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
