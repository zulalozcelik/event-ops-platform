'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { useDashboardSummary } from '@/features/registrations/registrations.api';
import {
  ArrowRightIcon,
  BellIcon,
  CalendarIcon,
  CalendarDaysIcon,
  MapPinIcon,
  PencilLineIcon,
  UsersIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils/format-date';

export default function DashboardPage() {
  const { initialized, isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const isOrganizer = user?.role === 'ORGANIZER' || user?.role === 'ADMIN';
  const { data: summary, isLoading, error } = useDashboardSummary(
    initialized && isAuthenticated && isOrganizer,
  );

  useEffect(() => {
    if (initialized && !isAuthenticated) {
      router.replace('/login');
    }
  }, [initialized, isAuthenticated, router]);

  if (!initialized || (isAuthenticated && !user)) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-8 w-8 rounded-full border-4 border-t-amber-500 border-r-amber-500 border-b-transparent border-l-transparent animate-spin"></div>
          <p className="text-sm text-muted-foreground">
            Restoring your session...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-8 w-8 rounded-full border-4 border-t-amber-500 border-r-amber-500 border-b-transparent border-l-transparent animate-spin"></div>
          <p className="text-sm text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  if (!isOrganizer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
        <h2 className="text-2xl font-bold text-destructive">Access Denied</h2>
        <p className="text-muted-foreground">
          Only organizers can access the dashboard.
        </p>
        <button
          onClick={() => router.push('/')}
          className="text-amber-500 hover:text-amber-400 font-medium"
        >
          Return to Home
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-8 w-8 rounded-full border-4 border-t-amber-500 border-r-amber-500 border-b-transparent border-l-transparent animate-spin"></div>
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="rounded-md bg-destructive/15 p-4 text-destructive text-sm font-medium">
        Failed to load dashboard data.
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Organizer Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track event volume, registrations, and next actions from one place.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/notifications">
            <Button variant="outline" className="gap-2">
              <BellIcon className="h-4 w-4" />
              Notifications
            </Button>
          </Link>
          <Link href="/events/create">
            <Button className="gap-2">
              <PencilLineIcon className="h-4 w-4" />
              Create Event
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_320px]">
        <section className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-muted-foreground">
                  Total Events
                </h3>
                <CalendarDaysIcon className="h-5 w-5 text-amber-500" />
              </div>
              <p className="mt-4 text-4xl font-bold text-foreground">
                {summary.totalEvents}
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-muted-foreground">
                  Total Registrations
                </h3>
                <UsersIcon className="h-5 w-5 text-emerald-500" />
              </div>
              <p className="mt-4 text-4xl font-bold text-foreground">
                {summary.totalRegistrations}
              </p>
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                Upcoming Events
              </h2>
              <Link
                href="/events"
                className="text-sm text-text-muted hover:text-text"
              >
                View all
              </Link>
            </div>

            {!summary.upcomingEvents || summary.upcomingEvents.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-surface-muted/40 p-8 text-center text-sm text-muted-foreground">
                You do not have any upcoming events yet.
              </div>
            ) : (
              <div className="grid gap-3">
                {summary.upcomingEvents.map((event) => (
                  <Link key={event.id} href={`/events/${event.id}`}>
                    <div className="group flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-colors hover:border-amber-500/50 cursor-pointer">
                      <div>
                        <h3 className="font-semibold text-foreground group-hover:text-amber-500 transition-colors">
                          {event.title}
                        </h3>
                        <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="h-3 w-3" />
                            {formatDate(event.startDate)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPinIcon className="h-3 w-3" />
                            {event.location}
                          </span>
                        </div>
                      </div>
                      <ArrowRightIcon className="h-4 w-4 text-text-muted transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-text">Quick actions</h2>
            <div className="mt-4 grid gap-2">
              <Link
                href="/events/create"
                className="rounded-lg border border-border px-3 py-3 text-sm text-text transition-colors hover:bg-surface-muted/40"
              >
                Create a new event
              </Link>
              <Link
                href="/notifications"
                className="rounded-lg border border-border px-3 py-3 text-sm text-text transition-colors hover:bg-surface-muted/40"
              >
                Review notifications
              </Link>
              <Link
                href="/events"
                className="rounded-lg border border-border px-3 py-3 text-sm text-text transition-colors hover:bg-surface-muted/40"
              >
                Browse event list
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-text">
              How to test data integrity
            </h2>
            <ol className="mt-4 space-y-3 text-sm text-text-muted">
              <li>
                1. Open one of your events and edit a field like location or
                capacity.
              </li>
              <li>
                2. Return to the event detail page and confirm a new change
                history entry.
              </li>
              <li>
                3. Sign in as a registered attendee and open notifications.
              </li>
            </ol>
          </div>
        </aside>
      </div>
    </div>
  );
}
