import type { Event } from '../entities/event.entity';
import type { EventRegistrationSummary } from '@/modules/registrations/types/registration-flow.type';

export interface EventDetailResponse
  extends EventRegistrationSummary,
    Omit<Event, never> {}
