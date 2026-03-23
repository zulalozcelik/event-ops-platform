export type CurrentUserRegistrationState = 'REGISTERED' | 'WAITLISTED' | 'NONE';

export interface EventCapacitySummary {
  eventId: string;
  registeredCount: number;
  waitlistCount: number;
  remainingCapacity: number;
}

export interface EventRegistrationSummary extends EventCapacitySummary {
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

export type RegistrationResult = RegisteredResult | WaitlistedResult;

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

export type CancelRegistrationResult =
  | RegistrationCancelledResult
  | WaitlistLeftResult;

export class RegistrationConflictError extends Error {
  constructor(public readonly state: 'REGISTERED' | 'WAITLISTED') {
    super(
      state === 'REGISTERED'
        ? 'User is already registered for this event'
        : 'User is already in the waitlist for this event',
    );
  }
}
