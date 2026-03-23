import {
  ForbiddenException,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import { EventsService } from '@/modules/events/events.service';

import {
  EVENT_CHANGE_LOG_REPOSITORY,
  IEventChangeLogRepository,
} from './repositories/event-change-logs.repository.interface';
import type {
  CreateEventChangeLogInput,
  EventChangeLogEntity,
} from './types/event-change-log.type';

@Injectable()
export class EventChangeLogsService {
  constructor(
    @Inject(EVENT_CHANGE_LOG_REPOSITORY)
    private readonly eventChangeLogRepository: IEventChangeLogRepository,
    @Inject(forwardRef(() => EventsService))
    private readonly eventsService: EventsService,
  ) {}

  async createLog(
    input: CreateEventChangeLogInput,
  ): Promise<EventChangeLogEntity> {
    return this.eventChangeLogRepository.create(input);
  }

  async getLogsByEventId(eventId: string): Promise<EventChangeLogEntity[]> {
    return this.eventChangeLogRepository.findByEventId(eventId);
  }

  async getLogsForViewer(
    eventId: string,
    viewerId: string,
    viewerRole: string,
  ): Promise<EventChangeLogEntity[]> {
    const event = await this.eventsService.getEventDetail(eventId);

    if (viewerRole !== 'ADMIN' && event.organizerId !== viewerId) {
      throw new ForbiddenException(
        'You are not allowed to view change logs for this event',
      );
    }

    return this.eventChangeLogRepository.findByEventId(eventId);
  }

  async markNotificationCreated(logId: string): Promise<void> {
    await this.eventChangeLogRepository.markNotificationCreated(logId);
  }
}
