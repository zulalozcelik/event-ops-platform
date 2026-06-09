export interface EventAttendeeUser {
  userId: string;
}

export type EventParticipantStatus = 'REGISTERED' | 'WAITING';

export interface EventParticipant {
  registrationId: string;
  userId: string;
  name: string;
  email: string;
  status: EventParticipantStatus;
  registeredAt: Date;
}

export interface RegistrationListEvent {
  id: string;
  title: string;
  location: string;
  startDate: Date;
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED';
}

export interface UserRegistrationSummary {
  id: string;
  state: 'REGISTERED' | 'WAITLISTED';
  createdAt: Date;
  event: RegistrationListEvent;
}
