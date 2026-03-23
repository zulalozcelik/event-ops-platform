import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { CurrentUserRegistrationState, Event } from '../events/events.api';

export interface MyRegistration {
  id: string;
  state: Exclude<CurrentUserRegistrationState, 'NONE'>;
  createdAt: string;
  event: Partial<Event>;
}

export interface DashboardSummary {
  totalEvents: number;
  totalRegistrations: number;
  upcomingEvents: Event[];
}

export interface CreateRegistrationInput {
  eventId: string;
}

export interface EventRegistrationSummary {
  eventId: string;
  registeredCount: number;
  waitlistCount: number;
  remainingCapacity: number;
  currentUserRegistrationState: CurrentUserRegistrationState;
}

export interface RegisteredResult {
  action: 'REGISTERED';
  eventId: string;
  userId: string;
  registrationId: string;
}

export interface WaitlistedResult {
  action: 'WAITLISTED';
  eventId: string;
  userId: string;
  waitlistId: string;
}

export type RegistrationActionResult = RegisteredResult | WaitlistedResult;

export interface PromotedRegistration {
  registrationId: string;
  waitlistId: string;
  userId: string;
}

export interface RegistrationCancelledResult {
  action: 'REGISTRATION_CANCELLED';
  eventId: string;
  userId: string;
  registrationId: string;
  promotedRegistration: PromotedRegistration | null;
}

export interface WaitlistLeftResult {
  action: 'WAITLIST_LEFT';
  eventId: string;
  userId: string;
  waitlistId: string;
  promotedRegistration: null;
}

export type CancelRegistrationActionResult =
  | RegistrationCancelledResult
  | WaitlistLeftResult;

export const fetchMyRegistrations = async (): Promise<MyRegistration[]> => {
  const { data } = await api.get('/registrations/me');
  return data;
};

export const fetchDashboardSummary = async (): Promise<DashboardSummary> => {
  const { data } = await api.get('/dashboard/summary');
  return data;
};

export const createRegistration = async (
  input: CreateRegistrationInput,
): Promise<RegistrationActionResult> => {
  const { data } = await api.post('/registrations', input);
  return data;
};

export const cancelRegistration = async (
  eventId: string,
): Promise<CancelRegistrationActionResult> => {
  const { data } = await api.delete(`/registrations/${eventId}`);
  return data;
};

export const fetchRegistrationSummaryForEvent = async (
  id: string,
): Promise<EventRegistrationSummary> => {
  const { data } = await api.get(`/events/${id}/registrations/count`);
  return data;
};

export const useMyRegistrations = () => {
  return useQuery({
    queryKey: ['registrations', 'me'],
    queryFn: fetchMyRegistrations,
  });
};

export const useDashboardSummary = () => {
  return useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: fetchDashboardSummary,
  });
};

export const useEventRegistrationSummary = (eventId: string) => {
  return useQuery({
    queryKey: ['registrations', 'summary', eventId],
    queryFn: () => fetchRegistrationSummaryForEvent(eventId),
    enabled: Boolean(eventId),
  });
};

export const useCreateRegistration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRegistration,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['registrations', 'me'] });
      queryClient.invalidateQueries({
        queryKey: ['registrations', 'summary', variables.eventId],
      });
      queryClient.invalidateQueries({ queryKey: ['events', variables.eventId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useCancelRegistration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelRegistration,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['registrations', 'me'] });
      queryClient.invalidateQueries({
        queryKey: ['registrations', 'summary', result.eventId],
      });
      queryClient.invalidateQueries({ queryKey: ['events', result.eventId] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};
