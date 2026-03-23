'use client';

import Link from 'next/link';
import { CalendarIcon, ListOrderedIcon, MapPinIcon, TicketIcon } from 'lucide-react';
import { useMyRegistrations } from '@/features/registrations/registrations.api';
import { useAuthStore } from '@/store/auth-store';

export default function MyRegistrationsPage() {
  const { user } = useAuthStore();
  const { data: registrations, isLoading, error } = useMyRegistrations();

  if (!user) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4 text-center">
        <h2 className="text-2xl font-bold">
          Please log in to view your registrations.
        </h2>
        <Link
          href="/login"
          className="font-medium text-amber-500 hover:text-amber-400"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex animate-pulse flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-r-amber-500 border-t-amber-500 border-b-transparent border-l-transparent"></div>
          <p className="text-sm text-muted-foreground">
            Loading your registrations...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-destructive/15 p-4 text-sm font-medium text-destructive">
        Failed to load your registrations.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          My Registrations
        </h1>
      </div>

      {!registrations || registrations.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <TicketIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold text-foreground">
            No registrations found
          </h3>
          <p className="mt-2 mb-6 text-sm text-muted-foreground">
            You have not joined any events or waitlists yet.
          </p>
          <Link
            href="/events"
            className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-8 text-sm font-medium text-foreground transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            Browse Events
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {registrations.map(({ id, state, createdAt, event }) => (
            <Link key={id} href={`/events/${event.id}`}>
              <div className="group relative flex h-full cursor-pointer flex-col justify-between overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:border-amber-500/50 hover:shadow-md">
                <div>
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <span className="inline-flex items-center rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-300">
                      Entry #{id.substring(0, 8)}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium uppercase tracking-wider ${
                        state === 'REGISTERED'
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : 'bg-amber-500/10 text-amber-500'
                      }`}
                    >
                      {state}
                    </span>
                  </div>
                  <h3 className="mb-2 text-xl font-bold tracking-tight text-foreground transition-colors group-hover:text-amber-500">
                    {event.title}
                  </h3>
                </div>

                <div className="mt-auto space-y-2 border-t border-border/50 pt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    <span>
                      {event.startDate
                        ? new Date(event.startDate).toLocaleDateString()
                        : 'TBD'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="h-4 w-4" />
                    <span className="truncate">{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ListOrderedIcon className="h-4 w-4" />
                    <span>
                      {state === 'REGISTERED'
                        ? 'Your spot is confirmed'
                        : 'You are currently in the waitlist'}
                    </span>
                  </div>
                </div>

                <div className="mt-4 border-t border-border/50 pt-4 text-xs text-muted-foreground">
                  <span>
                    Updated on {new Date(createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
