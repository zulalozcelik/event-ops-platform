import type {
  ChangedFieldDetail,
  ChangedFieldsMap,
  EventComparableSnapshot,
} from '@/modules/events/types/event-change.type';

export type { ChangedFieldDetail, EventComparableSnapshot };

export interface EventChangeLogEntity {
  id: string;
  eventId: string;
  changedByUserId: string;
  beforeData: EventComparableSnapshot;
  afterData: EventComparableSnapshot;
  changedFields: ChangedFieldsMap;
  notificationCreated: boolean;
  createdAt: Date;
}

export interface CreateEventChangeLogInput {
  eventId: string;
  changedByUserId: string;
  beforeData: EventComparableSnapshot;
  afterData: EventComparableSnapshot;
  changedFields: ChangedFieldsMap;
  notificationCreated?: boolean;
}
