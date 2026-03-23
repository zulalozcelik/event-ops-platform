import type {
  CreateEventChangeLogInput,
  EventChangeLogEntity,
} from '../types/event-change-log.type';

export const EVENT_CHANGE_LOG_REPOSITORY = 'EVENT_CHANGE_LOG_REPOSITORY';

export interface IEventChangeLogRepository {
  create(input: CreateEventChangeLogInput): Promise<EventChangeLogEntity>;
  findByEventId(eventId: string): Promise<EventChangeLogEntity[]>;
  markNotificationCreated(logId: string): Promise<void>;
}
