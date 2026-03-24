import { api } from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';

export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELLED';
export type CurrentUserRegistrationState = 'REGISTERED' | 'WAITLISTED' | 'NONE';

export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  capacity: number;
  status: EventStatus;
  organizerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventsFilters {
  search?: string;
  location?: string;
  date?: string;
}

export interface EventDetail extends Event {
  eventId: string;
  registeredCount: number;
  waitlistCount: number;
  remainingCapacity: number;
  currentUserRegistrationState: CurrentUserRegistrationState;
}

export interface EventChangeDetail {
  before: string | number | null;
  after: string | number | null;
}

export type EventChangedFields = Record<string, EventChangeDetail>;

export interface EventChangeSnapshot {
  title: string;
  description: string | null;
  location: string | null;
  startAt: string;
  endAt: string;
  capacity: number;
  status: string;
}

export interface EventChangeLog {
  id: string;
  eventId: string;
  changedByUserId: string;
  beforeData: EventChangeSnapshot;
  afterData: EventChangeSnapshot;
  changedFields: EventChangedFields;
  notificationCreated: boolean;
  createdAt: string;
}

export interface CreateEventInput {
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  capacity: number;
}

export type UpdateEventInput = CreateEventInput;

type ApiErrorResponse = {
  message?: string | string[];
};

export const fetchEvents = async (filters: EventsFilters = {}): Promise<Event[]> => {
  const { data } = await api.get('/events', {
    params: filters,
  });
  return data;
};

export const fetchEventById = async (id: string): Promise<EventDetail> => {
  const { data } = await api.get(`/events/${id}`);
  return data;
};

export const createEvent = async (input: CreateEventInput): Promise<Event> => {
  const { data } = await api.post('/events', input);
  return data;
};

export const updateEvent = async (
  id: string,
  input: UpdateEventInput,
): Promise<Event> => {
  const { data } = await api.patch(`/events/${id}`, input);
  return data;
};

export const deleteEvent = async (id: string): Promise<Event> => {
  const { data } = await api.delete(`/events/${id}`);
  return data;
};

export const fetchEventChangeLogs = async (
  id: string,
): Promise<EventChangeLog[]> => {
  const { data } = await api.get(`/events/${id}/change-logs`);
  return data;
};

export const useEvents = (filters: EventsFilters = {}) => {
  return useQuery({
    queryKey: ['events', filters],
    queryFn: () => fetchEvents(filters),
  });
};

export const useEventDetail = (id: string) => {
  return useQuery({
    queryKey: ['events', id],
    queryFn: () => fetchEventById(id),
    enabled: Boolean(id),
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useUpdateEvent = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateEventInput) => updateEvent(id, input),
    onError: (error) => {
      console.error('Event update request failed', error);
    },
    onSuccess: (event) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['events', id] });
      queryClient.invalidateQueries({
        queryKey: ['events', id, 'change-logs'],
      });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.setQueryData(['events', id], (current: EventDetail | undefined) =>
        current
          ? {
              ...current,
              ...event,
            }
          : undefined,
      );
    },
  });
};

export const useDeleteEvent = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['events', id] });
      queryClient.invalidateQueries({
        queryKey: ['events', id, 'change-logs'],
      });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export function getEventMutationErrorMessage(error: unknown): string {
  if (!isAxiosError<ApiErrorResponse>(error)) {
    return 'Unable to save event changes.';
  }

  const message = error.response?.data?.message;

  if (Array.isArray(message)) {
    return message[0] ?? 'Unable to save event changes.';
  }

  return message ?? 'Unable to save event changes.';
}

export const useEventChangeLogs = (id: string, enabled = true) => {
  return useQuery({
    queryKey: ['events', id, 'change-logs'],
    queryFn: () => fetchEventChangeLogs(id),
    enabled: Boolean(id) && enabled,
  });
};
