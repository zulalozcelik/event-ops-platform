import type { CreateEventInput, Event, EventStatus } from './events.api';

export interface EventFormValues {
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  capacity: number;
  status: Exclude<EventStatus, 'CANCELLED'>;
}

export function createDefaultEventFormValues(): EventFormValues {
  return {
    title: '',
    description: '',
    location: '',
    startDate: '',
    endDate: '',
    capacity: 100,
    status: 'PUBLISHED',
  };
}

function toDateTimeLocal(value: string): string {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function mapEventToFormValues(event: Event): EventFormValues {
  return {
    title: event.title,
    description: event.description,
    location: event.location,
    startDate: toDateTimeLocal(event.startDate),
    endDate: toDateTimeLocal(event.endDate),
    capacity: event.capacity,
    status: event.status === 'DRAFT' ? 'DRAFT' : 'PUBLISHED',
  };
}

export function mapFormValuesToPayload(
  values: EventFormValues,
): CreateEventInput {
  return {
    ...values,
    startDate: new Date(values.startDate).toISOString(),
    endDate: new Date(values.endDate).toISOString(),
  };
}
