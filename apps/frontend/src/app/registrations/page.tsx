'use client';

import Link from 'next/link';
import {
  CalendarIcon,
  ListOrderedIcon,
  MapPinIcon,
  TicketIcon,
} from 'lucide-react';
import { useMyRegistrations } from '@/features/registrations/registrations.api';
import { useAuthStore } from '@/store/auth-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function MyRegistrationsPage() {
  const { user } = useAuthStore();
  const { data: registrations, isLoading, error } = useMyRegistrations();

  if (!user) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4 text-center">
        <h2 className="text-2xl font-bold">
          Please log in to view your registrations.
        </h2>
        <Link href="/login">
          <Button>Go to Login</Button>
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full space-y-6">
        <div className="h-24 rounded-xl border border-border bg-surface shadow-sm" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="h-56 rounded-xl border border-border bg-surface shadow-sm" />
          <div className="h-56 rounded-xl border border-border bg-surface shadow-sm" />
          <div className="h-56 rounded-xl border border-border bg-surface shadow-sm" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border border-[#EDC0B6] bg-destructive-muted p-4 text-sm font-medium text-destructive">
        Failed to load your registrations.
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div>
        <Badge variant="default" className="mb-3">
          Attendee workspace
        </Badge>
        <h1 className="text-3xl font-semibold text-foreground">
          My Registrations
        </h1>
        <p className="mt-2 text-sm text-text-muted">
          Track confirmed events and waitlist positions from one place.
        </p>
      </div>

      {!registrations || registrations.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-surface p-12 text-center shadow-sm">
          <TicketIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold text-foreground">
            No registrations found
          </h3>
          <p className="mt-2 mb-6 text-sm text-muted-foreground">
            You have not joined any events or waitlists yet.
          </p>
          <Link href="/events">
            <Button variant="outline">Browse Events</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {registrations.map(({ id, state, createdAt, event }) => (
            <Link key={id} href={`/events/${event.id}`}>
              <div className="group flex h-full cursor-pointer flex-col justify-between rounded-xl border border-border bg-card p-6 shadow-sm transition-colors hover:border-accent">
                <div>
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <Badge variant="slate">
                      Entry #{id.substring(0, 8)}
                    </Badge>
                    <Badge variant={state === 'REGISTERED' ? 'success' : 'warning'}>
                      {state}
                    </Badge>
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-foreground transition-colors group-hover:text-accent">
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
