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
