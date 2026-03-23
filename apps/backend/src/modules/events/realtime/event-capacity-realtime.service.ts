import { Injectable } from '@nestjs/common';
import { EventCapacityGateway, EVENT_CAPACITY_UPDATED_EVENT } from './event-capacity.gateway';
import type { EventCapacitySummary } from '@/modules/registrations/types/registration-flow.type';

@Injectable()
export class EventCapacityRealtimeService {
  constructor(private readonly eventCapacityGateway: EventCapacityGateway) {}

  publishCapacityUpdated(summary: EventCapacitySummary): void {
    this.eventCapacityGateway.server
      .to(this.eventCapacityGateway.buildEventRoom(summary.eventId))
      .emit(EVENT_CAPACITY_UPDATED_EVENT, {
        eventId: summary.eventId,
        registeredCount: summary.registeredCount,
        waitlistCount: summary.waitlistCount,
        remainingCapacity: summary.remainingCapacity,
      });
  }
}
