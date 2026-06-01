'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthErrorMessage, register } from '@/features/auth/auth.api';
import {
  registerFormSchema,
  type RegisterFormValues,
} from '@/features/auth/auth-form.schema';
import { registerPasswordSchema } from '@/features/auth/auth-password.schema';
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

  const passwordValidation = useMemo(
    () => registerPasswordSchema.safeParse(form.password),
    [form.password],
  );

  const passwordError =
    form.password && !passwordValidation.success
      ? (passwordValidation.error.issues[0]?.message ?? '')
      : '';

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

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium text-text">
          Name
        </label>
        <Input
          id="name"
          type="text"
          name="name"
          placeholder="Your name"
          value={form.name}
          onChange={handleChange}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-text">
          Email
        </label>
        <Input
          id="email"
          type="email"
          name="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={handleChange}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-text">
          Password
        </label>
        <Input
          id="password"
          type="password"
          name="password"
          placeholder="Create a password"
          value={form.password}
          onChange={handleChange}
          aria-invalid={Boolean(passwordError)}
          aria-describedby={passwordError ? 'password-error' : undefined}
        />
        {passwordError ? (
          <p id="password-error" className="text-sm text-destructive">
            {passwordError}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-text">Account Type</label>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            {
              value: 'ATTENDEE' as const,
              label: 'Attendee',
              description: 'Register for events and receive updates.',
            },
            {
              value: 'ORGANIZER' as const,
              label: 'Organizer',
              description: 'Create events and manage registrations.',
            },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() =>
                setForm((prev) => ({ ...prev, role: option.value }))
              }
              className={`rounded-lg border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring ${
                form.role === option.value
                  ? 'border-accent bg-[#F3E4D5] text-text'
                  : 'border-border bg-surface text-text hover:bg-surface-muted'
              }`}
            >
              <span className="text-sm font-semibold">{option.label}</span>
              <span className="mt-1 block text-xs leading-5 text-text-muted">
                {option.description}
              </span>
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-[#EDC0B6] bg-destructive-muted px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <Button
        type="submit"
        disabled={isLoading || Boolean(passwordError)}
        className="w-full"
      >
        {isLoading ? 'Creating account...' : 'Register'}
      </Button>
    </form>
  );
}
