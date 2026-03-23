'use client';

import { use, useEffect, useMemo, useState } from 'react';
import { isAxiosError } from 'axios';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeftIcon,
  CalendarIcon,
  CheckCircle2Icon,
  BellIcon,
  Clock3Icon,
  MapPinIcon,
  PencilLineIcon,
  UsersIcon,
  XCircleIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  useEventChangeLogs,
  useEventDetail,
  type EventDetail,
} from '@/features/events/events.api';
import {
  useCancelRegistration,
  useCreateRegistration,
  type CancelRegistrationActionResult,
  type RegistrationActionResult,
} from '@/features/registrations/registrations.api';
import { formatDate, formatDateTime } from '@/lib/utils/format-date';
import { useAuthStore } from '@/store/auth-store';
import {
  createEventCapacitySocket,
  type EventCapacityUpdatedPayload,
} from '@/lib/realtime/event-capacity-socket';

type ApiErrorResponse = {
  message?: string | string[];
};

const changeFieldLabels: Record<string, string> = {
  title: 'Title',
  description: 'Description',
  location: 'Location',
  startAt: 'Start date',
  endAt: 'End date',
  capacity: 'Capacity',
  status: 'Status',
};

function getActionErrorMessage(error: unknown): string {
  if (!isAxiosError<ApiErrorResponse>(error)) {
    return 'The action could not be completed.';
  }

  const message = error.response?.data?.message;

  if (Array.isArray(message)) {
    return message[0] ?? 'The action could not be completed.';
  }

  return message ?? 'The action could not be completed.';
}

function getRegistrationSuccessMessage(result: RegistrationActionResult): string {
  if (result.action === 'REGISTERED') {
    return 'You have been registered for this event.';
  }

  return 'This event is full. You have been added to the waitlist.';
}

function getCancelSuccessMessage(result: CancelRegistrationActionResult): string {
  if (result.action === 'REGISTRATION_CANCELLED') {
    return result.promotedRegistration
      ? 'Your registration was cancelled. The first person in the waitlist was moved into the event.'
      : 'Your registration was cancelled.';
  }

  return 'You left the waitlist.';
}

function formatChangedValue(
  field: string,
  value: string | number | null,
): string {
  if (value === null || value === '') {
    return 'Empty';
  }

  if ((field === 'startAt' || field === 'endAt') && typeof value === 'string') {
    return formatDateTime(value);
  }

  return String(value);
}

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const eventId = resolvedParams.id;
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const { data: event, isLoading, error } = useEventDetail(eventId);
  const {
    mutate: register,
    isPending: isRegistering,
    error: registerError,
  } = useCreateRegistration();
  const {
    mutate: cancelRegistration,
    isPending: isCancelling,
    error: cancelError,
  } = useCancelRegistration();

  const canManageEvent = Boolean(
    user && event && (user.role === 'ADMIN' || user.id === event.organizerId),
  );

  const {
    data: changeLogs,
    isLoading: isChangeLogsLoading,
    isError: isChangeLogsError,
  } = useEventChangeLogs(eventId, canManageEvent);

  useEffect(() => {
    let active = true;
    let disconnectSocket: (() => void) | null = null;

    void createEventCapacitySocket()
      .then((socket) => {
        if (!active) {
          socket.disconnect();
          return;
        }

        socket.emit('event.capacity.subscribe', { eventId });
        socket.on(
          'event.capacity.updated',
          (payload: EventCapacityUpdatedPayload) => {
            if (payload.eventId !== eventId) {
              return;
            }

            queryClient.setQueryData(
              ['events', eventId],
              (current: EventDetail | undefined) =>
                current
                  ? {
                      ...current,
                      eventId: payload.eventId,
                      registeredCount: payload.registeredCount,
                      waitlistCount: payload.waitlistCount,
                      remainingCapacity: payload.remainingCapacity,
                    }
                  : current,
            );
          },
        );

        disconnectSocket = () => {
          socket.emit('event.capacity.unsubscribe', { eventId });
          socket.disconnect();
        };
      })
      .catch(() => {
        return;
      });

    return () => {
      active = false;
      disconnectSocket?.();
    };
  }, [eventId, queryClient]);

  const handleRegister = () => {
    if (!user) {
      router.push('/login');
      return;
    }

    setFeedback(null);

    register(
      { eventId },
      {
        onSuccess: (result) => {
          setFeedback({
            type: 'success',
            message: getRegistrationSuccessMessage(result),
          });
        },
      },
    );
  };

  const handleCancel = () => {
    setFeedback(null);

    cancelRegistration(eventId, {
      onSuccess: (result) => {
        setFeedback({
          type: 'success',
          message: getCancelSuccessMessage(result),
        });
      },
    });
  };

  const actionErrorMessage = useMemo(() => {
    if (registerError) {
      return getActionErrorMessage(registerError);
    }

    if (cancelError) {
      return getActionErrorMessage(cancelError);
    }

    return null;
  }, [cancelError, registerError]);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="rounded-xl border border-border bg-surface px-8 py-6 text-sm text-text-muted shadow-sm">
          Loading event details...
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="space-y-6">
        <Link
          href="/events"
          className="inline-flex items-center text-sm font-medium text-text-muted transition-colors hover:text-text"
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to Events
        </Link>
        <div className="rounded-xl border border-border bg-surface p-5 text-sm text-destructive shadow-sm">
          Failed to load event or event not found.
        </div>
      </div>
    );
  }

  const isOrganizer = user?.id === event.organizerId;
  const wasUpdated = searchParams.get('updated') === '1';
  const isFull = event.remainingCapacity === 0;
  const changeEntries = changeLogs?.flatMap((log) =>
    Object.entries(log.changedFields).map(([field, detail]) => ({
      id: `${log.id}-${field}`,
      field,
      detail,
      createdAt: log.createdAt,
    })),
  );

  const renderRegistrationAction = () => {
    if (isOrganizer) {
      return (
        <div className="rounded-lg border border-border bg-surface px-4 py-4 text-sm text-text-muted">
          You are the organizer of this event.
        </div>
      );
    }

    if (event.status === 'CANCELLED') {
      return (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
          This event has been cancelled.
        </div>
      );
    }

    if (event.currentUserRegistrationState === 'REGISTERED') {
      return (
        <div className="space-y-3">
          <Button
            className="w-full"
            variant="outline"
            disabled={isCancelling}
            onClick={handleCancel}
          >
            {isCancelling ? 'Cancelling...' : 'Cancel registration'}
          </Button>
          <p className="text-sm text-text-muted">
            Your spot is confirmed for this event.
          </p>
        </div>
      );
    }

    if (event.currentUserRegistrationState === 'WAITLISTED') {
      return (
        <div className="space-y-3">
          <Button
            className="w-full"
            variant="outline"
            disabled={isCancelling}
            onClick={handleCancel}
          >
            {isCancelling ? 'Leaving...' : 'Leave waitlist'}
          </Button>
          <p className="text-sm text-text-muted">
            You are currently waiting for an available spot.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <Button
          className="w-full"
          disabled={isRegistering}
          onClick={handleRegister}
        >
          {isRegistering
            ? 'Submitting...'
            : isFull
              ? 'Join waitlist'
              : 'Join event'}
        </Button>
        <p className="text-sm text-text-muted">
          {isFull
            ? 'The event is full. New requests will be added to the waitlist.'
            : 'Spots are available right now.'}
        </p>
      </div>
    );
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 pb-10">
      {wasUpdated ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Event updated successfully. Change history is listed below for quick
          verification.
        </div>
      ) : null}

      <Link
        href="/events"
        className="inline-flex items-center text-sm font-medium text-text-muted transition-colors hover:text-text"
      >
        <ArrowLeftIcon className="mr-2 h-4 w-4" />
        Back to Events
      </Link>

      <article className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
        <div className="border-b border-border px-6 py-6 md:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                  event.status === 'PUBLISHED'
                    ? 'bg-emerald-50 text-emerald-700'
                    : event.status === 'DRAFT'
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-red-50 text-red-700'
                }`}
              >
                {event.status}
              </span>
              <span className="text-sm text-text-muted">
                Current state: {event.currentUserRegistrationState}
              </span>
            </div>

            {canManageEvent ? (
              <div className="flex flex-wrap gap-2">
                <Link href={`/events/${event.id}/edit`}>
                  <Button variant="outline" className="gap-2">
                    <PencilLineIcon className="h-4 w-4" />
                    Edit Event
                  </Button>
                </Link>
                <Link href="/notifications">
                  <Button variant="ghost" className="gap-2">
                    <BellIcon className="h-4 w-4" />
                    Notifications
                  </Button>
                </Link>
              </div>
            ) : null}
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-text md:text-4xl">
            {event.title}
          </h1>

          <div className="mt-6 grid gap-3 text-sm text-text-muted md:grid-cols-4">
            <div className="flex items-center gap-2 rounded-lg bg-surface-muted px-3 py-3">
              <CalendarIcon className="h-4 w-4 text-accent" />
              <span>
                {formatDate(event.startDate)} - {formatDate(event.endDate)}
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-surface-muted px-3 py-3">
              <MapPinIcon className="h-4 w-4 text-accent" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-surface-muted px-3 py-3">
              <UsersIcon className="h-4 w-4 text-accent" />
              <span>{event.registeredCount} registered</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-surface-muted px-3 py-3">
              <Clock3Icon className="h-4 w-4 text-accent" />
              <span>{event.remainingCapacity} spots left</span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 px-6 py-6 md:grid-cols-[minmax(0,1fr)_320px] md:px-8">
          <section className="space-y-4">
            <div className="rounded-xl border border-border bg-surface p-5">
              <h2 className="text-lg font-semibold text-text">
                About this event
              </h2>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-text-muted">
                {event.description}
              </p>
            </div>

            {canManageEvent ? (
              <div className="rounded-xl border border-border bg-surface-muted/40 p-5">
                <h2 className="text-base font-semibold text-text">
                  Organizer workflow
                </h2>
                <p className="mt-2 text-sm text-text-muted">
                  Edit the event, then check this page for new change history
                  entries. Sign in as an attendee to verify that a notification
                  was generated.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link href={`/events/${event.id}/edit`}>
                    <Button className="gap-2">
                      <PencilLineIcon className="h-4 w-4" />
                      Edit Event
                    </Button>
                  </Link>
                  <Link href="/notifications">
                    <Button variant="outline">Open Notifications</Button>
                  </Link>
                </div>
              </div>
            ) : null}
          </section>

          <aside className="space-y-4">
            <div className="rounded-xl border border-border bg-surface-muted/40 p-5">
              <h2 className="text-base font-semibold text-text">
                Registration
              </h2>
              <p className="mt-2 text-sm text-text-muted">
                Capacity changes are updated in real time for this event.
              </p>

              <div className="mt-5 space-y-3 rounded-lg border border-border bg-surface px-4 py-4 text-sm text-text-muted">
                <div className="flex items-center justify-between">
                  <span>Registered</span>
                  <span className="font-medium text-text">
                    {event.registeredCount}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Waitlist</span>
                  <span className="font-medium text-text">
                    {event.waitlistCount}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Remaining capacity</span>
                  <span className="font-medium text-text">
                    {event.remainingCapacity}
                  </span>
                </div>
              </div>

              <div className="mt-5">{renderRegistrationAction()}</div>

              {actionErrorMessage ? (
                <div className="mt-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <XCircleIcon className="h-4 w-4" />
                  <span>{actionErrorMessage}</span>
                </div>
              ) : null}

              {feedback?.type === 'success' ? (
                <div className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  <CheckCircle2Icon className="h-4 w-4" />
                  <span>{feedback.message}</span>
                </div>
              ) : null}
            </div>
          </aside>
        </div>
      </article>

      {canManageEvent ? (
        <section className="rounded-2xl border border-border bg-surface shadow-sm">
          <div className="border-b border-border px-6 py-4">
            <h2 className="text-lg font-semibold text-text">Change History</h2>
            <p className="mt-1 text-sm text-text-muted">
              Recent updates made to this event.
            </p>
          </div>

          <div className="px-6 py-5">
            {isChangeLogsLoading ? (
              <p className="text-sm text-text-muted">
                Loading change history...
              </p>
            ) : isChangeLogsError ? (
              <p className="text-sm text-destructive">
                Change history could not be loaded.
              </p>
            ) : !changeEntries || changeEntries.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-surface-muted/50 px-4 py-8 text-center text-sm text-text-muted">
                No event updates have been recorded yet.
              </div>
            ) : (
              <div className="space-y-3">
                {changeEntries.map(({ id, field, detail, createdAt }) => (
                  <div
                    key={id}
                    className="rounded-xl border border-border bg-surface-muted/40 px-4 py-4"
                  >
                    <p className="text-sm font-medium text-text">
                      {changeFieldLabels[field] ?? field}:{' '}
                      <span className="font-normal text-text-muted">
                        {formatChangedValue(field, detail.before)}
                      </span>
                      <span className="px-2 text-text-muted">-&gt;</span>
                      <span className="font-normal text-text">
                        {formatChangedValue(field, detail.after)}
                      </span>
                    </p>
                    <p className="mt-1 text-xs text-text-muted">
                      {formatDateTime(createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      ) : null}
    </div>
  );
}
