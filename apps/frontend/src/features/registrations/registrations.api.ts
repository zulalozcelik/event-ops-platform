import axios from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Event } from '../events/events.api';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  withCredentials: true,
});

export interface Registration {
  id: string;
  eventId: string;
  userId: string;
  createdAt: string;
}

export interface MyRegistration {
  id: string;
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

// ========================
// API Call Functions
// ========================
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
): Promise<Registration> => {
  const { data } = await api.post('/registrations', input);
  return data;
};

export const fetchRegistrationCountForEvent = async (
  id: string,
): Promise<{ count: number }> => {
  const { data } = await api.get(`/events/${id}/registrations/count`);
  return data;
};

// ========================
// React Query Hooks
// ========================
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

export const useEventRegistrationCount = (eventId: string) => {
  return useQuery({
    queryKey: ['registrations', 'count', eventId],
    queryFn: () => fetchRegistrationCountForEvent(eventId),
    enabled: !!eventId,
  });
};

export const useCreateRegistration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRegistration,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['registrations', 'me'] });
      queryClient.invalidateQueries({
        queryKey: ['registrations', 'count', variables.eventId],
      });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};
