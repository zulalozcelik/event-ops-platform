import type {
  EventAttendeeUser,
  UserRegistrationSummary,
} from '../types/registration-attendee.type';
import type {
  CancelRegistrationResult,
  EventRegistrationSummary,
  RegistrationResult,
} from '../types/registration-flow.type';

export interface IRegistrationRepository {
  registerOrWaitlist(
    data: RegisterOrWaitlistInput,
  ): Promise<RegistrationResult>;
  cancelForEvent(
    eventId: string,
    userId: string,
  ): Promise<CancelRegistrationResult | null>;
  existsByEventIdAndUserId(eventId: string, userId: string): Promise<boolean>;
  existsInWaitlistByEventIdAndUserId(
    eventId: string,
    userId: string,
  ): Promise<boolean>;
  countByEventId(eventId: string): Promise<number>;
  countWaitlistByEventId(eventId: string): Promise<number>;
  getEventRegistrationSummary(
    eventId: string,
    userId?: string,
  ): Promise<EventRegistrationSummary>;
  findMine(userId: string): Promise<UserRegistrationSummary[]>;
  countTotalForOrganizerEvents(organizerId: string): Promise<number>;
  findAttendeeUserIdsByEventId(eventId: string): Promise<EventAttendeeUser[]>;
}

export interface RegisterOrWaitlistInput {
  eventId: string;
  userId: string;
  capacity: number;
}
