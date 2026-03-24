'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { EventForm } from '@/features/events/components/event-form';
import {
  getEventMutationErrorMessage,
  useCreateEvent,
} from '@/features/events/events.api';
import {
  createDefaultEventFormValues,
  mapFormValuesToPayload,
  type EventFormValues,
} from '@/features/events/event-form.types';
import { useAuthStore } from '@/store/auth-store';

export default function CreateEventPage() {
  const router = useRouter();
  const { initialized, isAuthenticated, user } = useAuthStore();
  const { mutate: createEvent, isPending, error } = useCreateEvent();
  const [formValues, setFormValues] = useState<EventFormValues>(
    createDefaultEventFormValues(),
  );

  useEffect(() => {
    if (initialized && !isAuthenticated) {
      router.replace('/login');
    }
  }, [initialized, isAuthenticated, router]);

  if (!initialized || (isAuthenticated && !user)) {
    return (
      <div className="flex min-h-[50vh] w-full items-center justify-center">
        <div className="rounded-xl border border-border bg-surface px-8 py-6 text-sm text-text-muted shadow-sm">
          Restoring your session...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[50vh] w-full items-center justify-center">
        <div className="rounded-xl border border-border bg-surface px-8 py-6 text-sm text-text-muted shadow-sm">
          Redirecting to login...
        </div>
      </div>
    );
  }

  if (!user || (user.role !== 'ORGANIZER' && user.role !== 'ADMIN')) {
    return (
      <div className="flex min-h-[50vh] w-full items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-text">Access denied</h1>
          <p className="mt-2 text-sm text-text-muted">
            Only organizers can create events.
          </p>
          <div className="mt-6">
            <Button variant="outline" onClick={() => router.push('/events')}>
              Back to events
            </Button>
          </div>
        </div>
      </div>
    );
  }

  function handleChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    const { name, value } = event.target;

    setFormValues((current) => ({
      ...current,
      [name]: name === 'capacity' ? Number(value) || 0 : value,
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    createEvent(mapFormValuesToPayload(formValues), {
      onSuccess: (createdEvent) => {
        router.push(`/events/${createdEvent.id}`);
      },
    });
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <EventForm
        title="Create Event"
        description="Set the details once, then update them later from the event page if plans change."
        values={formValues}
        submitLabel="Create Event"
        isSubmitting={isPending}
        errorMessage={error ? getEventMutationErrorMessage(error) : undefined}
        onChange={handleChange}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
