'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useEvents } from '@/features/events/events.api';
import { CalendarIcon, MapPinIcon, SearchIcon, UsersIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

function getEventStatusVariant(status: string) {
  if (status === 'PUBLISHED') {
    return 'success' as const;
  }

  if (status === 'DRAFT') {
    return 'slate' as const;
  }

  return 'danger' as const;
}

function EventsLoadingGrid() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <div className="h-64 rounded-xl border border-border bg-surface shadow-sm" />
      <div className="h-64 rounded-xl border border-border bg-surface shadow-sm" />
      <div className="h-64 rounded-xl border border-border bg-surface shadow-sm" />
    </div>
  );
}

export default function EventsPage() {
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [location, setLocation] = useState('');
  const [debouncedLocation, setDebouncedLocation] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [searchText]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedLocation(location);
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [location]);

  const filters = useMemo(
    () => ({
      search: debouncedSearch.trim() || undefined,
      location: debouncedLocation.trim() || undefined,
      date: date || undefined,
    }),
    [date, debouncedLocation, debouncedSearch],
  );

  const { data: events, isLoading, error } = useEvents(filters);

  const hasFilters = Boolean(searchText.trim() || location.trim() || date);
  const hasAppliedFilters = Boolean(
    filters.search || filters.location || filters.date,
  );

  const handleClearFilters = () => {
    setSearchText('');
    setDebouncedSearch('');
    setLocation('');
    setDebouncedLocation('');
    setDate('');
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-2">
        <Badge variant="default" className="w-fit">
          Browse events
        </Badge>
        <h1 className="text-3xl font-semibold text-foreground">
          Find the right event to join.
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-text-muted">
          Search upcoming events, check capacity, and open the detail page to
          register or join a waitlist.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 shadow-sm md:p-6">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="md:col-span-2">
            <label
              htmlFor="search"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Search
            </label>
            <Input
              id="search"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Search by event name or description"
            />
          </div>
          <div>
            <label
              htmlFor="location"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Location
            </label>
            <Input
              id="location"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Filter by location"
            />
          </div>
          <div>
            <label
              htmlFor="date"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Date
            </label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={handleClearFilters}
            disabled={!hasFilters}
          >
            Clear filters
          </Button>
        </div>
      </div>

      {isLoading ? (
        <EventsLoadingGrid />
      ) : error ? (
        <div className="rounded-md border border-[#EDC0B6] bg-destructive-muted p-4 text-destructive text-sm">
          Failed to load events. Please try again later.
        </div>
      ) : !events || events.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-surface p-12 text-center shadow-sm">
          <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold text-foreground">
            No events found
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {hasAppliedFilters
              ? 'No events matched your filters. Try changing or clearing the filters.'
              : 'There are no active events at the moment. Check back later.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Link key={event.id} href={`/events/${event.id}`}>
              <div className="group flex h-full cursor-pointer flex-col justify-between rounded-xl border border-border bg-card p-6 shadow-sm transition-colors hover:border-accent">
                <div>
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <Badge variant={getEventStatusVariant(event.status)}>
                      {event.status}
                    </Badge>
                    <Badge variant="slate">{event.capacity} seats</Badge>
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-foreground transition-colors group-hover:text-accent">
                    {event.title}
                  </h3>
                  <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
                    {event.description}
                  </p>
                </div>

                <div className="mt-auto space-y-2 border-t border-border pt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-accent" />
                    <span>
                      {new Date(event.startDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="h-4 w-4 text-accent" />
                    <span className="truncate">{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UsersIcon className="h-4 w-4 text-accent" />
                    <span>Capacity: {event.capacity}</span>
                  </div>
                  <div className="pt-3">
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-accent">
                      <SearchIcon className="h-4 w-4" />
                      View details
                    </span>
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
