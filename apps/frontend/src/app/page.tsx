'use client';

import Link from 'next/link';
import { CalendarDaysIcon, HistoryIcon, UsersIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth-store';

export default function HomePage() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="w-full space-y-10">
      <section className="grid items-start gap-8 py-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="max-w-3xl">
          <Badge variant="slate" className="mb-4">
            Event Ops Platform
          </Badge>
          <h1 className="font-display text-4xl font-bold leading-tight text-text md:text-[36px]">
            Manage campus events with less confusion.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-text-muted">
            Create events, track registrations, manage waitlists, and keep
            event updates visible for attendees.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/events">
              <Button>Browse events</Button>
            </Link>
            <Link href={isAuthenticated ? '/dashboard' : '/register'}>
              <Button variant="outline">
                {isAuthenticated ? 'Go to dashboard' : 'Create account'}
              </Button>
            </Link>
          </div>
        </div>

        <aside className="rounded-xl border border-border bg-surface p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-text">
                Workshop Planning Session
              </p>
              <p className="mt-1 text-sm text-text-muted">
                Main campus, Room B
              </p>
            </div>
            <Badge variant="success">Published</Badge>
          </div>
          <dl className="mt-6 grid gap-3 text-sm">
            <div className="flex items-center justify-between border-t border-border pt-3">
              <dt className="text-text-muted">Capacity</dt>
              <dd className="font-medium text-text">24 of 40</dd>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-3">
              <dt className="text-text-muted">Waitlist</dt>
              <dd className="font-medium text-text">3 people</dd>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-3">
              <dt className="text-text-muted">Last update</dt>
              <dd className="font-medium text-text">Room changed</dd>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-3">
              <dt className="text-text-muted">Notification</dt>
              <dd className="font-medium text-text">Sent</dd>
            </div>
          </dl>
        </aside>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          {
            icon: CalendarDaysIcon,
            title: 'Event management',
            text: 'Create, edit, and organize events without changing backend workflows.',
          },
          {
            icon: UsersIcon,
            title: 'Registration tracking',
            text: 'Show attendees, remaining capacity, and waitlist state in one place.',
          },
          {
            icon: HistoryIcon,
            title: 'Change history',
            text: 'Keep a readable record of updates for the graduation presentation.',
          },
        ].map((feature) => (
          <article
            key={feature.title}
            className="rounded-xl border border-border bg-surface p-6"
          >
            <feature.icon className="h-5 w-5 text-accent" />
            <h2 className="mt-4 font-display text-lg font-semibold text-text">
              {feature.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-text-muted">
              {feature.text}
            </p>
          </article>
        ))}
      </section>

      <section className="rounded-xl border border-border bg-surface p-6 md:p-8">
        <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <Badge variant="info">Data integrity</Badge>
            <h2 className="mt-4 font-display text-2xl font-semibold text-text">
              Every event change is recorded.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-text-muted">
              When an organizer edits an event, the system stores the change
              and notifies registered attendees.
            </p>
          </div>
          <ol className="space-y-3 text-sm text-text">
            {[
              'Organizer updates event',
              'Change log is saved',
              'Attendees receive notification',
            ].map((item, index) => (
              <li
                key={item}
                className="flex items-center gap-3 rounded-lg border border-border bg-background px-4 py-3"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-surface-muted text-xs font-semibold text-text">
                  {index + 1}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
