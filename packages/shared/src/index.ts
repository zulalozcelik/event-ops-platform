export const UserRole = {
  ADMIN: 'ADMIN',
  ATTENDEE: 'ATTENDEE',
  ORGANIZER: 'ORGANIZER',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const EventStatus = {
  ACTIVE: 'ACTIVE',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
} as const;
export type EventStatus = (typeof EventStatus)[keyof typeof EventStatus];

export const RegistrationStatus = {
  REGISTERED: 'REGISTERED',
  CANCELLED: 'CANCELLED',
  ATTENDED: 'ATTENDED',
  NO_SHOW: 'NO_SHOW',
} as const;
export type RegistrationStatus =
  (typeof RegistrationStatus)[keyof typeof RegistrationStatus];

export const WaitlistStatus = {
  WAITING: 'WAITING',
  OFFERED: 'OFFERED',
  ACCEPTED: 'ACCEPTED',
  EXPIRED: 'EXPIRED',
  REMOVED: 'REMOVED',
} as const;
export type WaitlistStatus =
  (typeof WaitlistStatus)[keyof typeof WaitlistStatus];
