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

export function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated, user, clearAuth } = useAuthStore();

  async function handleLogout() {
    await logout();
    clearAuth();
  }

  return (
    <header className="border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-surface text-sm font-bold">
            EO
          </div>
          <span className="text-sm font-medium text-text-muted">
            Event Ops Platform
          </span>
        </Link>

        <nav className="flex items-center gap-6 text-sm">
          {!isAuthenticated ? (
            publicLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-text-muted hover:text-text transition-colors',
                  pathname === link.href && 'text-text font-medium',
                )}
              >
                {link.label}
              </Link>
            ))
          ) : (
            <>
              {user?.role === 'ORGANIZER' || user?.role === 'ADMIN' ? (
                <>
                  <Link
                    href="/dashboard"
                    className={cn(
                      'text-text-muted hover:text-text transition-colors',
                      pathname === '/dashboard' && 'text-text font-medium',
                    )}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/events"
                    className={cn(
                      'text-text-muted hover:text-text transition-colors',
                      pathname === '/events' && 'text-text font-medium',
                    )}
                  >
                    Events
                  </Link>
                  <Link
                    href="/notifications"
                    className={cn(
                      'text-text-muted hover:text-text transition-colors',
                      pathname === '/notifications' && 'text-text font-medium',
                    )}
                  >
                    Notifications
                  </Link>
                  <Link
                    href="/events/create"
                    className={cn(
                      'text-text-muted hover:text-text transition-colors',
                      pathname === '/events/create' && 'text-text font-medium',
                    )}
                  >
                    Create Event
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/events"
                    className={cn(
                      'text-text-muted hover:text-text transition-colors',
                      pathname === '/events' && 'text-text font-medium',
                    )}
                  >
                    Events
                  </Link>
                  <Link
                    href="/notifications"
                    className={cn(
                      'text-text-muted hover:text-text transition-colors',
                      pathname === '/notifications' && 'text-text font-medium',
                    )}
                  >
                    Notifications
                  </Link>
                  <Link
                    href="/registrations"
                    className={cn(
                      'text-text-muted hover:text-text transition-colors',
                      pathname === '/registrations' && 'text-text font-medium',
                    )}
                  >
                    My Registrations
                  </Link>
                </>
              )}
            </>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <span className="hidden text-xs text-text-muted sm:inline">
                {user?.name} ({user?.role})
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
