'use client';

import Link from 'next/link';
import { CalendarDaysIcon, LayoutDashboardIcon, BellIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth-store';

export default function HomePage() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <div className="grid w-full gap-6 lg:grid-cols-[minmax(0,1.4fr)_360px]">
      <section className="space-y-6">
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm md:p-8">
          <p className="text-xs uppercase tracking-[0.18em] text-accent">
            Event operations workspace
          </p>
          <h1 className="mt-3 max-w-2xl text-3xl font-semibold leading-tight text-text md:text-5xl">
            Create events, manage changes, and track attendee activity in one
            place.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-text-muted">
            A focused MVP for organizers who need registrations, change history,
            and notification visibility without extra setup.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard">
                  <Button>Open dashboard</Button>
                </Link>
                <Link href="/events">
                  <Button variant="outline">Browse events</Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/register">
                  <Button>Create organizer account</Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline">Sign in</Button>
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
            <CalendarDaysIcon className="h-5 w-5 text-accent" />
            <p className="mt-4 text-sm font-semibold text-text">
              Event planning
            </p>
            <p className="mt-2 text-sm text-text-muted">
              Create and update event details from one organizer flow.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
            <BellIcon className="h-5 w-5 text-accent" />
            <p className="mt-4 text-sm font-semibold text-text">
              Notification testing
            </p>
            <p className="mt-2 text-sm text-text-muted">
              Verify that attendee notifications are generated after event
              edits.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
            <LayoutDashboardIcon className="h-5 w-5 text-accent" />
            <p className="mt-4 text-sm font-semibold text-text">
              Organizer overview
            </p>
            <p className="mt-2 text-sm text-text-muted">
              Review registrations, upcoming events, and recent activity.
            </p>
          </div>
        </div>
      </section>

      <aside className="space-y-4">
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-text-muted">
            Snapshot
          </p>
          <div className="mt-4 grid gap-3">
            <div className="rounded-xl bg-surface-muted/40 p-4">
              <p className="text-xs text-text-muted">What you can test</p>
              <p className="mt-1 text-lg font-semibold text-text">
                Edit {'->'} Change log {'->'} Notification
              </p>
            </div>
            <div className="rounded-xl bg-surface-muted/40 p-4">
              <p className="text-xs text-text-muted">Best demo flow</p>
              <p className="mt-1 text-sm text-text">
                Organizer updates event, attendee checks notifications.
              </p>
            </div>
            {isAuthenticated && user ? (
              <div className="rounded-xl border border-border p-4 text-sm text-text-muted">
                Signed in as{' '}
                <span className="font-medium text-text">{user.name}</span>.
                {user.role === 'ORGANIZER' || user.role === 'ADMIN'
                  ? ' Start from the dashboard or edit one of your events.'
                  : ' Open Events or Notifications to test attendee flows.'}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border p-4 text-sm text-text-muted">
                Sign in as organizer to edit an event, then switch to an
                attendee account to verify notifications.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <p className="text-sm font-semibold text-text">Quick links</p>
          <div className="mt-4 grid gap-2">
            <Link
              href="/events"
              className="rounded-lg border border-border px-3 py-3 text-sm text-text transition-colors hover:bg-surface-muted/40"
            >
              Browse events
            </Link>
            <Link
              href="/notifications"
              className="rounded-lg border border-border px-3 py-3 text-sm text-text transition-colors hover:bg-surface-muted/40"
            >
              Open notifications
            </Link>
            <Link
              href="/dashboard"
              className="rounded-lg border border-border px-3 py-3 text-sm text-text transition-colors hover:bg-surface-muted/40"
            >
              Organizer dashboard
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
}
