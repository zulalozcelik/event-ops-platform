export interface EventAttendeeUser {
  userId: string;
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
