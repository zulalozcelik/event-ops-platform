'use client';

import { use, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EventForm } from '@/features/events/components/event-form';
import {
  getEventMutationErrorMessage,
  useDeleteEvent,
  useEventDetail,
  useUpdateEvent,
} from '@/features/events/events.api';
import {
  mapEventToFormValues,
  mapFormValuesToPayload,
  type EventFormValues,
} from '@/features/events/event-form.types';
import { useAuthStore } from '@/store/auth-store';

export default function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user, initialized } = useAuthStore();
  const { data: event, isLoading, error } = useEventDetail(id);
  const {
    mutate: updateEvent,
    isPending,
    error: updateError,
  } = useUpdateEvent(id);
  const {
    mutate: deleteEvent,
    isPending: isDeleting,
    error: deleteError,
  } = useDeleteEvent(id);
  const [formValues, setFormValues] = useState<EventFormValues | null>(null);

  const canEditEvent = useMemo(() => {
    if (!user || !event) {
      return false;
    }

    return user.role === 'ADMIN' || user.id === event.organizerId;
  }, [event, user]);

  const canDeleteEvent = useMemo(() => {
    if (!user || !event) {
      return false;
    }

    return user.id === event.organizerId;
  }, [event, user]);

  useEffect(() => {
    if (event) {
      setFormValues(mapEventToFormValues(event));
    }
  }, [event]);

  useEffect(() => {
    if (initialized && !user) {
      router.replace('/login');
    }
  }, [initialized, router, user]);

  function handleChange(
    currentEvent: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = currentEvent.target;

    setFormValues((current) =>
      current
        ? {
            ...current,
            [name]: name === 'capacity' ? Number(value) || 0 : value,
          }
        : current,
    );
  }

  function handleSubmit(currentEvent: React.FormEvent<HTMLFormElement>) {
    currentEvent.preventDefault();

    if (!formValues) {
      return;
    }

    updateEvent(mapFormValuesToPayload(formValues), {
      onSuccess: () => {
        router.push(`/events/${id}?updated=1`);
      },
    });
  }

  function handleDelete() {
    const isConfirmed = window.confirm(
      'Delete this event? Registered attendees will be notified and the event will be removed from active lists.',
    );

    if (!isConfirmed) {
      return;
    }

    deleteEvent(undefined, {
      onSuccess: () => {
        router.push('/dashboard?eventDeleted=1');
      },
    });
  }

  if (!initialized || isLoading || !formValues) {
    return (
      <div className="flex min-h-[50vh] w-full items-center justify-center">
        <div className="rounded-xl border border-border bg-surface px-8 py-6 text-sm text-text-muted shadow-sm">
          Loading event editor...
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="w-full space-y-6">
        <Link
          href="/events"
          className="inline-flex items-center text-sm font-medium text-text-muted transition-colors hover:text-text"
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to Events
        </Link>
        <div className="rounded-xl border border-border bg-surface p-5 text-sm text-destructive shadow-sm">
          Event could not be loaded.
        </div>
      </div>
    );
  }

  if (!canEditEvent) {
    return (
      <div className="flex min-h-[50vh] w-full items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-text">Access denied</h1>
          <p className="mt-2 text-sm text-text-muted">
            Only the event owner can edit this event.
          </p>
          <div className="mt-6">
            <Button
              variant="outline"
              onClick={() => router.push(`/events/${id}`)}
            >
              Back to event
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <Link
        href={`/events/${id}`}
        className="inline-flex items-center text-sm font-medium text-text-muted transition-colors hover:text-text"
      >
        <ArrowLeftIcon className="mr-2 h-4 w-4" />
        Back to Event
      </Link>

      <EventForm
        title="Edit Event"
        description="Update event details here. Saving this form should create change history entries and attendee notifications."
        values={formValues}
        submitLabel="Save Changes"
        isSubmitting={isPending || isDeleting}
        errorMessage={
          updateError
            ? getEventMutationErrorMessage(updateError)
            : deleteError
              ? getEventMutationErrorMessage(deleteError)
              : undefined
        }
        onChange={handleChange}
        onSubmit={handleSubmit}
      />

      {canDeleteEvent ? (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={isPending || isDeleting}
            onClick={handleDelete}
          >
            {isDeleting ? 'Deleting...' : 'Delete Event'}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
