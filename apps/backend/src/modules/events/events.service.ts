import {
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { Event } from './entities/event.entity';
import {
  IEventRepository,
  UpdateEventRepositoryInput,
} from './repositories/event.repository.interface';
import { EVENT_REPOSITORY } from './repositories/event.repository.tokens';
import { CreateEventDto } from './dto/create-event.dto';
import { GetEventsQueryDto } from './dto/get-events-query.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventChangeLogsService } from '@/modules/event-change-logs/event-change-logs.service';
import { NotificationsService } from '@/modules/notifications/notifications.service';
import { RegistrationsService } from '@/modules/registrations/registrations.service';
import type {
  EventParticipant,
  EventParticipantStatus,
} from '@/modules/registrations/types/registration-attendee.type';
import type { EventDetailResponse } from './types/event-detail.type';
import {
  buildEventUpdateNotificationMessage,
  buildEventComparableSnapshot,
  calculateChangedFields,
  hasChangedFields,
} from './helpers/event-change.helper';

export interface EventParticipantsResponse {
  eventId: string;
  capacity: number;
  counts: {
    registered: number;
    waiting: number;
    cancelled: number;
  };
  participants: EventParticipant[];
}

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    @Inject(EVENT_REPOSITORY)
    private readonly eventRepository: IEventRepository,
    private readonly notificationsService: NotificationsService,
    private readonly eventChangeLogsService: EventChangeLogsService,
    @Inject(forwardRef(() => RegistrationsService))
    private readonly registrationsService: RegistrationsService,
  ) {}

  async createEvent(
    data: CreateEventDto,
    userId: string,
    userRole: string,
  ): Promise<Event> {
    if (userRole !== 'ADMIN' && userRole !== 'ORGANIZER') {
      throw new ForbiddenException(
        'Only admins and organizers can create events',
      );
    }

    return this.eventRepository.create({
      ...data,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      organizerId: userId,
      status: 'PUBLISHED',
    });
  }

  async getPublishedEvents(filters: GetEventsQueryDto): Promise<Event[]> {
    return this.eventRepository.findAllPublishedOrVisible(filters);
  }

  async getEventDetail(id: string): Promise<Event> {
    const event = await this.eventRepository.findById(id);
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }

  async getEventDetailResponse(
    id: string,
    userId?: string,
  ): Promise<EventDetailResponse> {
    const event = await this.getEventDetail(id);
    const summary = await this.registrationsService.getEventRegistrationSummary(
      id,
      userId,
    );

    return {
      ...event,
      eventId: summary.eventId,
      registeredCount: summary.registeredCount,
      waitlistCount: summary.waitlistCount,
      remainingCapacity: summary.remainingCapacity,
      currentUserRegistrationState: summary.currentUserRegistrationState,
    };
  }

  async getEventParticipants(
    id: string,
    userId: string,
    userRole: string,
  ): Promise<EventParticipantsResponse> {
    const event = await this.eventRepository.findById(id);
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (userRole !== 'ADMIN' && event.organizerId !== userId) {
      throw new ForbiddenException(
        'You can only view participants for your own events',
      );
    }

    const participants = await this.registrationsService.getParticipantsForEvent(
      id,
    );

    const countByStatus = (status: EventParticipantStatus) =>
      participants.filter((participant) => participant.status === status).length;

    return {
      eventId: event.id,
      capacity: event.capacity,
      counts: {
        registered: countByStatus('REGISTERED'),
        waiting: countByStatus('WAITING'),
        cancelled: 0,
      },
      participants,
    };
  }

  async updateEvent(
    id: string,
    data: UpdateEventDto,
    userId: string,
    userRole: string,
  ): Promise<Event> {
    if (userRole !== 'ADMIN' && userRole !== 'ORGANIZER') {
      throw new ForbiddenException(
        'Only admins and organizers can update events',
      );
    }

    const event = await this.eventRepository.findById(id);
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (userRole !== 'ADMIN' && event.organizerId !== userId) {
      throw new ForbiddenException('You can only update your own events');
    }

    const beforeSnapshot = buildEventComparableSnapshot({
      title: event.title,
      description: event.description || null,
      location: event.location,
      startAt: event.startDate,
      endAt: event.endDate,
      capacity: event.capacity,
      status: event.status,
    });

    const mergedTitle = data.title ?? event.title;
    const mergedDescription = data.description ?? event.description ?? null;
    const mergedLocation = data.location ?? event.location;
    const mergedStartAt = data.startDate
      ? new Date(data.startDate)
      : event.startDate;
    const mergedEndAt = data.endDate ? new Date(data.endDate) : event.endDate;
    const mergedCapacity = data.capacity ?? event.capacity;
    const mergedStatus = event.status === 'DRAFT' ? 'PUBLISHED' : event.status;

    const mergedEventSnapshot = buildEventComparableSnapshot({
      title: mergedTitle,
      description: mergedDescription,
      location: mergedLocation,
      startAt: mergedStartAt,
      endAt: mergedEndAt,
      capacity: mergedCapacity,
      status: mergedStatus,
    });

    const changedFields = calculateChangedFields(
      beforeSnapshot,
      mergedEventSnapshot,
    );

    const hasChanges = hasChangedFields(changedFields);

    if (!hasChanges) {
      return event;
    }

    const updateData: UpdateEventRepositoryInput = {
      ...data,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      status: mergedStatus === event.status ? undefined : mergedStatus,
    };

    const updatedEvent = await this.eventRepository.update(id, updateData);

    const createdLog = await this.eventChangeLogsService.createLog({
      eventId: event.id,
      changedByUserId: userId,
      beforeData: beforeSnapshot,
      afterData: mergedEventSnapshot,
      changedFields,
      notificationCreated: false,
    });

    const attendeeUsers =
      await this.registrationsService.getAttendeeUserIdsForEvent(id);

    this.logger.debug(
      `Event ${event.id} update found ${attendeeUsers.length} registered attendee records`,
    );

    const notificationMessage = buildEventUpdateNotificationMessage(
      event.title,
      changedFields,
      beforeSnapshot,
      mergedEventSnapshot,
    );

    const attendeeNotifications = attendeeUsers
      .filter((attendee) => attendee.userId !== userId)
      .map((attendee) => ({
        userId: attendee.userId,
        eventId: event.id,
        type: 'EVENT_UPDATED',
        title: 'Event updated',
        message: notificationMessage,
      }));

    this.logger.debug(
      `Event ${event.id} notifications will be created for userIds: ${
        attendeeNotifications
          .map((notification) => notification.userId)
          .join(', ') || 'none'
      }`,
    );

    if (attendeeNotifications.length > 0) {
      await this.notificationsService.createManyNotifications(
        attendeeNotifications,
      );

      this.logger.debug(
        `Inserted ${attendeeNotifications.length} notifications for event ${event.id}`,
      );

      await this.eventChangeLogsService.markNotificationCreated(createdLog.id);
    }

    return updatedEvent;
  }

  async deleteEvent(
    id: string,
    userId: string,
    userRole: string,
  ): Promise<Event> {
    if (userRole !== 'ADMIN' && userRole !== 'ORGANIZER') {
      throw new ForbiddenException(
        'Only organizers can delete events',
      );
    }

    const event = await this.eventRepository.findById(id);
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.organizerId !== userId) {
      throw new ForbiddenException('You can only delete your own events');
    }

    if (event.status === 'CANCELLED') {
      return event;
    }

    const beforeSnapshot = buildEventComparableSnapshot({
      title: event.title,
      description: event.description || null,
      location: event.location,
      startAt: event.startDate,
      endAt: event.endDate,
      capacity: event.capacity,
      status: event.status,
    });

    const afterSnapshot = buildEventComparableSnapshot({
      title: event.title,
      description: event.description || null,
      location: event.location,
      startAt: event.startDate,
      endAt: event.endDate,
      capacity: event.capacity,
      status: 'CANCELLED',
    });

    const changedFields = calculateChangedFields(beforeSnapshot, afterSnapshot);

    const attendeeUsers =
      await this.registrationsService.getAttendeeUserIdsForEvent(id);

    const deletedEvent = await this.eventRepository.cancel(id);

    const createdLog = await this.eventChangeLogsService.createLog({
      eventId: event.id,
      changedByUserId: userId,
      beforeData: beforeSnapshot,
      afterData: afterSnapshot,
      changedFields,
      notificationCreated: false,
    });

    const attendeeNotifications = attendeeUsers
      .filter((attendee) => attendee.userId !== userId)
      .map((attendee) => ({
        userId: attendee.userId,
        eventId: event.id,
        type: 'EVENT_DELETED',
        title: 'Event cancelled',
        message: `${event.title} was cancelled by the organizer.`,
      }));

    if (attendeeNotifications.length > 0) {
      await this.notificationsService.createManyNotifications(
        attendeeNotifications,
      );
      await this.eventChangeLogsService.markNotificationCreated(createdLog.id);
    }

    return deletedEvent;
  }

  async getEventsCount(organizerId: string): Promise<number> {
    return this.eventRepository.countByOrganizerId(organizerId);
  }

  async getUpcomingEvents(organizerId: string): Promise<Event[]> {
    return this.eventRepository.findUpcomingByOrganizerId(organizerId, 3);
  }
}
