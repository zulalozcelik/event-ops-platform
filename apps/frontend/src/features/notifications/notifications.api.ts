import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { isAxiosError } from 'axios';

export interface Notification {
  id: string;
  userId: string;
  eventId: string | null;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export async function fetchMyNotifications(): Promise<Notification[]> {
  const response = await api.get<Notification[]>('/notifications/my');
  return response.data;
}

export async function markNotificationAsRead(id: string): Promise<void> {
  await api.patch(`/notifications/${id}/read`);
}

export function useMyNotifications(userId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['notifications', 'my', userId],
    queryFn: fetchMyNotifications,
    enabled: enabled && Boolean(userId),
    retry: false,
    throwOnError: false,
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'my'] });
    },
  });
}

const legacyFieldLabels: Record<string, string> = {
  title: 'title',
  description: 'description',
  location: 'location',
  capacity: 'capacity',
  startAt: 'start time',
  endAt: 'end time',
  startDate: 'start time',
  endDate: 'end time',
  status: 'status',
};

function getFriendlyLegacyFields(fields: string[]): string[] {
  const hasStartChange =
    fields.includes('startAt') || fields.includes('startDate');
  const hasEndChange = fields.includes('endAt') || fields.includes('endDate');
  const readableFields: string[] = [];

  if (hasStartChange && hasEndChange) {
    readableFields.push('schedule');
  } else {
    if (hasStartChange) {
      readableFields.push('start time');
    }

    if (hasEndChange) {
      readableFields.push('end time');
    }
  }

  fields.forEach((field) => {
    if (
      field === 'startAt' ||
      field === 'startDate' ||
      field === 'endAt' ||
      field === 'endDate'
    ) {
      return;
    }

    const label = legacyFieldLabels[field];

    if (label) {
      readableFields.push(label);
    }
  });

  return readableFields;
}

export function getReadableNotificationMessage(message: string): string {
  const legacyPrefix = 'Changed fields:';
  const legacyPrefixIndex = message.indexOf(legacyPrefix);

  if (legacyPrefixIndex === -1) {
    return message;
  }

  const messageStart = message.slice(0, legacyPrefixIndex).trim();
  const fields = message
    .slice(legacyPrefixIndex + legacyPrefix.length)
    .split(',')
    .map((field) => field.trim())
    .filter((field) => field.length > 0);
  const readableFields = getFriendlyLegacyFields(fields);

  if (readableFields.length === 0) {
    return messageStart || 'This event was updated.';
  }

  return `${messageStart} Changed: ${readableFields.join(', ')}.`;
}

export function getNotificationsErrorMessage(error: unknown): string {
  if (!isAxiosError<{ message?: string | string[] }>(error)) {
    return 'Notifications could not be loaded right now.';
  }

  console.error('Notifications request failed', error);

  const message = error.response?.data?.message;

  if (Array.isArray(message)) {
    return message[0] ?? 'Notifications could not be loaded right now.';
  }

  return message ?? 'Notifications could not be loaded right now.';
}
