'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BellRingIcon, ExternalLinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  getReadableNotificationMessage,
  getNotificationsErrorMessage,
  useMarkNotificationAsRead,
  useMyNotifications,
} from '@/features/notifications/notifications.api';
import { formatDateTime } from '@/lib/utils/format-date';
import { useAuthStore } from '@/store/auth-store';

export default function NotificationsPage() {
  const router = useRouter();
  const { initialized, isAuthenticated, user } = useAuthStore();
  const { data, isLoading, isError, error } = useMyNotifications(
    user?.id,
    initialized && isAuthenticated,
  );
  const { mutate: markAsRead, isPending: isMarkingRead } =
    useMarkNotificationAsRead();

  useEffect(() => {
    if (initialized && !isAuthenticated) {
      router.replace('/login');
    }
  }, [initialized, isAuthenticated, router]);

  if (!initialized || !isAuthenticated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-text-muted">Loading your notifications...</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-semibold text-text">
            Notifications
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Updates related to your events and registrations.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-10 text-center text-sm text-text-muted shadow-sm">
          Loading notifications...
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-semibold text-text">
            Notifications
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Updates related to your events and registrations.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-10 text-center text-sm text-destructive shadow-sm">
          {getNotificationsErrorMessage(error)}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div>
        <Badge variant="default" className="mb-3">
          Notification center
        </Badge>
        <h1 className="text-3xl font-semibold text-text">
          Notifications
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Updates related to your events and registrations. Edit an event as an
          organizer, then sign in as an attendee to verify new notifications
          here.
        </p>
      </div>

      {!data || data.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-surface px-6 py-12 text-center shadow-sm">
          <BellRingIcon className="mx-auto h-10 w-10 text-text-muted/70" />
          <h2 className="mt-4 text-lg font-semibold text-text">
            No notifications yet
          </h2>
          <p className="mt-2 text-sm text-text-muted">
            Event updates will appear here when organizers make changes.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((notification) => (
            <article
              key={notification.id}
              className={`rounded-xl border bg-surface p-6 shadow-sm transition-colors ${
                notification.isRead
                  ? 'border-border'
                  : 'border-[#D2B59D] bg-[#F3E4D5]'
              }`}
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h2 className="text-base font-semibold text-text">
                      {notification.title}
                    </h2>
                    <Badge variant={notification.isRead ? 'slate' : 'default'}>
                      {notification.isRead ? 'Read' : 'Unread'}
                    </Badge>
                  </div>
                  <p className="text-sm leading-6 text-text-muted">
                    {getReadableNotificationMessage(notification.message)}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted">
                    <span>{formatDateTime(notification.createdAt)}</span>
                    {notification.eventId ? (
                      <Link
                        href={`/events/${notification.eventId}`}
                        className="inline-flex items-center gap-1 text-text hover:text-accent"
                      >
                        View event
                        <ExternalLinkIcon className="h-3 w-3" />
                      </Link>
                    ) : null}
                  </div>
                </div>

                {!notification.isRead ? (
                  <Button
                    variant="outline"
                    className="shrink-0"
                    disabled={isMarkingRead}
                    onClick={() => markAsRead(notification.id)}
                  >
                    Mark as read
                  </Button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
