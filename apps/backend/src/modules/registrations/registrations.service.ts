import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import { IRegistrationRepository } from './repositories/registration.repository.interface';
import { REGISTRATION_REPOSITORY } from './repositories/registration.repository.tokens';
import { EventsService } from '../events/events.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import type { Event } from '../events/entities/event.entity';
import type { UserRegistrationSummary } from './types/registration-attendee.type';
import type {
  CancelRegistrationResult,
  EventRegistrationSummary,
  RegistrationResult,
} from './types/registration-flow.type';
import { RegistrationConflictError } from './types/registration-flow.type';
import { NotificationsService } from '../notifications/notifications.service';
import { EventCapacityRealtimeService } from '../events/realtime/event-capacity-realtime.service';

export interface OrganizerDashboardSummary {
  totalEvents: number;
  totalRegistrations: number;
  upcomingEvents: Event[];
}

@Injectable()
export class RegistrationsService {
  constructor(
    @Inject(REGISTRATION_REPOSITORY)
    private readonly registrationRepository: IRegistrationRepository,
    @Inject(forwardRef(() => EventsService))
    private readonly eventsService: EventsService,
    private readonly notificationsService: NotificationsService,
    private readonly eventCapacityRealtimeService: EventCapacityRealtimeService,
  ) {}

  async createRegistration(
    data: CreateRegistrationDto,
    userId: string,
  ): Promise<RegistrationResult> {
    const event = await this.eventsService.getEventDetail(data.eventId);
    this.validateEventCanAcceptRegistrations(event, userId);

    try {
      const result = await this.registrationRepository.registerOrWaitlist({
        eventId: data.eventId,
        userId,
        capacity: event.capacity,
      });

      await this.emitCapacityUpdate(data.eventId);

      return result;
    } catch (error) {
      if (error instanceof RegistrationConflictError) {
        if (error.state === 'REGISTERED') {
          throw new BadRequestException(
            'You are already registered for this event',
          );
        }

        throw new BadRequestException(
          'You are already in the waitlist for this event',
        );
      }

      throw error;
    }
  }

  async cancelRegistration(
    eventId: string,
    userId: string,
  ): Promise<CancelRegistrationResult> {
    await this.eventsService.getEventDetail(eventId);

    const result = await this.registrationRepository.cancelForEvent(
      eventId,
      userId,
    );

    if (!result) {
      throw new BadRequestException(
        'You do not have an active registration or waitlist entry for this event',
      );
    }

    if (result.promotedRegistration) {
      await this.notificationsService.createNotification({
        userId: result.promotedRegistration.userId,
        eventId,
        type: 'WAITLIST_PROMOTED',
        title: 'Registration updated',
        message:
          'A spot opened up for the event and you have been moved from the waitlist to the registered list.',
      });
    }

    await this.emitCapacityUpdate(eventId);

    return result;
  }

  async getMyRegistrations(userId: string): Promise<UserRegistrationSummary[]> {
    return this.registrationRepository.findMine(userId);
  }

  async getRegistrationCountForEvent(eventId: string): Promise<number> {
    return this.registrationRepository.countByEventId(eventId);
  }

  async getEventRegistrationSummary(
    eventId: string,
    userId?: string,
  ): Promise<EventRegistrationSummary> {
    return this.registrationRepository.getEventRegistrationSummary(eventId, userId);
  }

  async getDashboardSummary(
    userId: string,
    userRole: string,
  ): Promise<OrganizerDashboardSummary> {
    if (userRole !== 'ADMIN' && userRole !== 'ORGANIZER') {
      throw new ForbiddenException('Dashboard is only for organizers');
    }

    return {
      totalEvents: 0,
      totalRegistrations:
        await this.registrationRepository.countTotalForOrganizerEvents(userId),
      upcomingEvents: [],
    };
  }

  async getAttendeeUserIdsForEvent(
    eventId: string,
  ): Promise<{ userId: string }[]> {
    return this.registrationRepository.findAttendeeUserIdsByEventId(eventId);
  }

  private validateEventCanAcceptRegistrations(event: Event, userId: string): void {
    if (event.status !== 'PUBLISHED') {
      throw new BadRequestException('Only published events accept registrations');
    }

    if (event.capacity <= 0) {
      throw new BadRequestException(
        'This event cannot accept registrations because capacity is not available',
      );
    }

    if (event.organizerId === userId) {
      throw new ForbiddenException(
        'Organizers cannot register for their own events',
      );
    }
  }

  private async emitCapacityUpdate(eventId: string): Promise<void> {
    const summary = await this.registrationRepository.getEventRegistrationSummary(
      eventId,
    );

    this.eventCapacityRealtimeService.publishCapacityUpdated(summary);
  }
}
