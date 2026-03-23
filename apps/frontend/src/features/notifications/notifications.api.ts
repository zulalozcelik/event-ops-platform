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
