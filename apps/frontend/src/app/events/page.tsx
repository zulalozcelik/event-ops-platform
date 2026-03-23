'use client';

import Link from 'next/link';
import { useEvents } from '@/features/events/events.api';
import { CalendarIcon, MapPinIcon, UsersIcon } from 'lucide-react';

export default function EventsPage() {
  const { data: events, isLoading, error } = useEvents();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-8 w-8 rounded-full border-4 border-t-amber-500 border-r-amber-500 border-b-transparent border-l-transparent animate-spin"></div>
          <p className="text-sm text-muted-foreground">Loading events...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-destructive/15 p-4 text-destructive text-sm">
        Failed to load events. Please try again later.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Events
        </h1>
      </div>

      {!events || events.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold text-foreground">
            No events found
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            There are no active events at the moment. Check back later.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Link key={event.id} href={`/events/${event.id}`}>
              <div className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:border-amber-500/50 hover:shadow-md h-full cursor-pointer">
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium uppercase tracking-wider ${
                        event.status === 'PUBLISHED'
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : event.status === 'DRAFT'
                            ? 'bg-amber-500/10 text-amber-500'
                            : 'bg-destructive/10 text-destructive'
                      }`}
                    >
                      {event.status}
                    </span>
                  </div>
                  <h3 className="mb-2 text-xl font-bold tracking-tight text-foreground group-hover:text-amber-500 transition-colors">
                    {event.title}
                  </h3>
                  <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
                    {event.description}
                  </p>
                </div>

                <div className="mt-auto space-y-2 text-sm text-muted-foreground pt-4 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    <span>
                      {new Date(event.startDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="h-4 w-4" />
                    <span className="truncate">{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UsersIcon className="h-4 w-4" />
                    <span>Capacity: {event.capacity}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
