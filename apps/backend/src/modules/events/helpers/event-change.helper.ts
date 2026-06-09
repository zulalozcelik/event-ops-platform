import type {
  ChangedFieldsMap,
  EventComparableSnapshot,
} from '../types/event-change.type';

interface EventSnapshotSource {
  title: string;
  description: string | null;
  location: string | null;
  startAt: Date;
  endAt: Date;
  capacity: number;
  status: string;
}

export function buildEventComparableSnapshot(
  event: EventSnapshotSource,
): EventComparableSnapshot {
  return {
    title: event.title,
    description: event.description,
    location: event.location,
    startAt: event.startAt.toISOString(),
    endAt: event.endAt.toISOString(),
    capacity: event.capacity,
    status: event.status,
  };
}

export function calculateChangedFields(
  before: EventComparableSnapshot,
  after: EventComparableSnapshot,
): ChangedFieldsMap {
  const changedFields: ChangedFieldsMap = {};

  const keys = Object.keys(before) as Array<keyof EventComparableSnapshot>;

  for (const key of keys) {
    if (before[key] !== after[key]) {
      changedFields[key] = {
        before: before[key],
        after: after[key],
      };
    }
  }

  return changedFields;
}

export function hasChangedFields(changedFields: ChangedFieldsMap): boolean {
  return Object.keys(changedFields).length > 0;
}

function formatNotificationDateTime(value: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

function formatSchedule(startAt: string, endAt: string): string {
  return `${formatNotificationDateTime(startAt)} to ${formatNotificationDateTime(
    endAt,
  )}`;
}

function getFriendlyChangedLabels(
  changedFields: ChangedFieldsMap,
): string[] {
  const changedFieldNames = Object.keys(changedFields);
  const labels: string[] = [];
  const hasStartChange =
    changedFieldNames.includes('startAt') ||
    changedFieldNames.includes('startDate');
  const hasEndChange =
    changedFieldNames.includes('endAt') ||
    changedFieldNames.includes('endDate');

  if (hasStartChange && hasEndChange) {
    labels.push('schedule');
  } else {
    if (hasStartChange) {
      labels.push('start time');
    }

    if (hasEndChange) {
      labels.push('end time');
    }
  }

  if (changedFieldNames.includes('title')) {
    labels.push('title');
  }

  if (changedFieldNames.includes('description')) {
    labels.push('description');
  }

  if (changedFieldNames.includes('location')) {
    labels.push('location');
  }

  if (changedFieldNames.includes('capacity')) {
    labels.push('capacity');
  }

  if (changedFieldNames.includes('status')) {
    labels.push('status');
  }

  return labels;
}

export function buildEventUpdateNotificationMessage(
  eventTitle: string,
  changedFields: ChangedFieldsMap,
  before: EventComparableSnapshot,
  after: EventComparableSnapshot,
): string {
  const labels = getFriendlyChangedLabels(changedFields);

  if (labels.length === 1) {
    const changedLabel = labels[0];

    if (changedLabel === 'schedule') {
      return `The schedule for ${eventTitle} was changed from ${formatSchedule(
        before.startAt,
        before.endAt,
      )}, to ${formatSchedule(after.startAt, after.endAt)}.`;
    }

    if (changedLabel === 'start time') {
      return `The start time for ${eventTitle} was changed from ${formatNotificationDateTime(
        before.startAt,
      )} to ${formatNotificationDateTime(after.startAt)}.`;
    }

    if (changedLabel === 'end time') {
      return `The end time for ${eventTitle} was changed from ${formatNotificationDateTime(
        before.endAt,
      )} to ${formatNotificationDateTime(after.endAt)}.`;
    }

    if (changedLabel === 'location') {
      return `The location for ${eventTitle} was changed from ${
        before.location || 'Empty'
      } to ${after.location || 'Empty'}.`;
    }

    if (changedLabel === 'capacity') {
      return `The capacity for ${eventTitle} was changed from ${before.capacity} to ${after.capacity}.`;
    }

    if (changedLabel === 'title') {
      return `The event title was changed from ${before.title} to ${after.title}.`;
    }

    if (changedLabel === 'description') {
      return `The description for ${eventTitle} was updated.`;
    }

    if (changedLabel === 'status') {
      return `The status for ${eventTitle} was changed from ${before.status} to ${after.status}.`;
    }
  }

  if (labels.length > 0) {
    return `${eventTitle} was updated. Changed: ${labels.join(', ')}.`;
  }

  return `${eventTitle} was updated.`;
}
