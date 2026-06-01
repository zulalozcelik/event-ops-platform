'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import { logout } from '@/features/auth/auth.api';

const publicLinks = [
  { href: '/', label: 'Home' },
  { href: '/events', label: 'Events' },
];

const guestLinks = [
  { href: '/login', label: 'Login' },
  { href: '/register', label: 'Register' },
];

function navClass(isActive: boolean) {
  return cn(
    'rounded-md px-3 py-2 text-text-muted transition-colors hover:bg-surface-muted hover:text-text',
    isActive && 'bg-surface-muted font-medium text-text',
  );
}

export function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated, user, clearAuth } = useAuthStore();

  async function handleLogout() {
    await logout();
    clearAuth();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface">
      <div className="mx-auto flex min-h-[72px] max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-sm font-bold text-accent-foreground">
            EO
          </div>
          <span className="truncate font-display text-sm font-semibold text-text">
            Event Ops Platform
          </span>
        </Link>

        <nav className="order-3 flex w-full items-center gap-1 overflow-x-auto text-sm md:order-2 md:w-auto md:gap-2 md:overflow-visible">
          {!isAuthenticated ? (
            publicLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={navClass(pathname === link.href)}
              >
                {link.label}
              </Link>
            ))
          ) : user?.role === 'ORGANIZER' || user?.role === 'ADMIN' ? (
            <>
              <Link
                href="/dashboard"
                className={navClass(pathname === '/dashboard')}
              >
                Dashboard
              </Link>
              <Link
                href="/events"
                className={navClass(pathname === '/events')}
              >
                Events
              </Link>
              <Link
                href="/notifications"
                className={navClass(pathname === '/notifications')}
              >
                Notifications
              </Link>
              <Link
                href="/events/create"
                className={navClass(pathname === '/events/create')}
              >
                Create Event
              </Link>
            </>
          ) : (
            <>
              <Link href="/events" className={navClass(pathname === '/events')}>
                Events
              </Link>
              <Link
                href="/notifications"
                className={navClass(pathname === '/notifications')}
              >
                Notifications
              </Link>
              <Link
                href="/registrations"
                className={navClass(pathname === '/registrations')}
              >
                My Registrations
              </Link>
            </>
          )}
        </nav>

        <div className="order-2 flex items-center gap-3 md:order-3">
          {isAuthenticated ? (
            <>
              <span className="hidden max-w-44 truncate rounded-md bg-surface-muted px-3 py-1.5 text-xs font-medium text-text-muted sm:inline">
                {user?.name} / {user?.role}
              </span>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <div className="flex gap-2">
              {guestLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <Button variant="outline" className="text-sm">
                    {link.label}
                  </Button>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
